import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DatabaseConfig, User } from '../config/database.config';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  companyId?: string;
  role?: 'owner' | 'administrator' | 'user';
}

export interface JwtPayload {
  sub: string;
  email: string;
  companyId: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly databaseConfig: DatabaseConfig,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('active', true)
        .single();

      if (error || !user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isPasswordValid) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error validating user:', error);
      return null;
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    
    const user = await this.validateUser(email, password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login timestamp
    await this.updateLastLogin(user.id);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      companyId: user.company_id,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.company_id,
        emailVerified: user.email_verified,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, name, companyId, role = 'user' } = registerDto;

    try {
      const supabase = this.databaseConfig.getClient();

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          email,
          password_hash: passwordHash,
          name,
          company_id: companyId,
          role,
          active: true,
          email_verified: false,
        })
        .select()
        .single();

      if (userError) {
        console.error('Error creating user:', userError);
        throw new BadRequestException('Failed to create user account');
      }

      // Generate JWT token
      const payload: JwtPayload = {
        sub: newUser.id,
        email: newUser.email,
        companyId: newUser.company_id,
        role: newUser.role,
      };

      const accessToken = this.jwtService.sign(payload);

      return {
        access_token: accessToken,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          companyId: newUser.company_id,
          emailVerified: newUser.email_verified,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Registration error:', error);
      throw new BadRequestException('Failed to register user');
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .eq('active', true)
        .single();

      if (error || !user) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating last login:', error);
      // Don't throw error for this non-critical operation
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await this.getUserById(userId);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      
      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      const supabase = this.databaseConfig.getClient();
      
      const { error } = await supabase
        .from('users')
        .update({ password_hash: newPasswordHash })
        .eq('id', userId);

      if (error) {
        throw new BadRequestException('Failed to update password');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error changing password:', error);
      throw new BadRequestException('Failed to change password');
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      const { data: user } = await supabase
        .from('users')
        .select('id, name')
        .eq('email', email)
        .eq('active', true)
        .single();

      if (!user) {
        // Don't reveal if user exists for security
        return;
      }

      // TODO: Implement password reset token generation and email sending
      // For now, just log that a reset was requested
      console.log(`Password reset requested for user: ${email}`);
    } catch (error) {
      console.error('Error requesting password reset:', error);
      // Don't throw error to avoid revealing user existence
    }
  }

  async verifyEmail(userId: string): Promise<void> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      const { error } = await supabase
        .from('users')
        .update({ email_verified: true })
        .eq('id', userId);

      if (error) {
        throw new BadRequestException('Failed to verify email');
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      throw new BadRequestException('Failed to verify email');
    }
  }
}