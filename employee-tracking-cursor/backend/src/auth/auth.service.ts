import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload, AuthResponse, RegisterRequest, LoginRequest, UserRole } from '../types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterRequest): Promise<AuthResponse> {
    const { email, password, firstName, lastName, companyName, timezone = 'UTC' } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Generate company slug
    const baseSlug = companyName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').trim('-');
    let slug = baseSlug;
    let counter = 1;

    // Ensure unique slug
    while (await this.prisma.company.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Hash password
    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 12);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create company and user in transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create company
      const company = await prisma.company.create({
        data: {
          name: companyName,
          slug,
          timezone,
          subscriptionStatus: 'trial',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
        },
      });

      // Create user as company owner
      const user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          passwordHash,
          role: 'owner',
          companyId: company.id,
          emailVerified: false, // In production, send verification email
        },
      });

      // Create default absence types for the company
      await this.createDefaultAbsenceTypes(prisma, company.id);

      return { user, company };
    });

    // Generate tokens
    const tokens = await this.generateTokens(result.user);

    return {
      ...tokens,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role as UserRole,
        companyId: result.user.companyId,
      },
      company: {
        id: result.company.id,
        name: result.company.name,
        slug: result.company.slug,
      },
    };
  }

  async login(loginDto: LoginRequest): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Find user with company info
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            subscriptionStatus: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if company subscription is active
    if (user.company.subscriptionStatus === 'suspended' || user.company.subscriptionStatus === 'cancelled') {
      throw new UnauthorizedException('Account suspended. Please contact support.');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as UserRole,
        companyId: user.companyId,
      },
      company: {
        id: user.company.id,
        name: user.company.name,
        slug: user.company.slug,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = await this.generateAccessToken(user);
      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            subscriptionStatus: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as UserRole,
      companyId: user.companyId,
      company: user.company,
    };
  }

  private async generateTokens(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role as UserRole,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '30d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async generateAccessToken(user: any): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role as UserRole,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1h'),
    });
  }

  private async createDefaultAbsenceTypes(prisma: any, companyId: string) {
    const defaultTypes = [
      {
        name: 'Sick Leave',
        code: 'SICK',
        description: 'Time off due to illness or medical appointments',
        isPaid: true,
        requiresApproval: false,
        maxDaysPerYear: 10,
        advanceNoticeDays: 0,
        color: '#ef4444',
      },
      {
        name: 'Vacation',
        code: 'VACATION',
        description: 'Planned time off for rest and relaxation',
        isPaid: true,
        requiresApproval: true,
        maxDaysPerYear: 25,
        advanceNoticeDays: 14,
        color: '#22c55e',
      },
      {
        name: 'Personal Leave',
        code: 'PERSONAL',
        description: 'Time off for personal matters',
        isPaid: false,
        requiresApproval: true,
        maxDaysPerYear: 5,
        advanceNoticeDays: 3,
        color: '#3b82f6',
      },
    ];

    for (const type of defaultTypes) {
      await prisma.absenceType.create({
        data: {
          ...type,
          companyId,
        },
      });
    }
  }
} 