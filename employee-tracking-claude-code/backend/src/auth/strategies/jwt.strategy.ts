import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService, JwtPayload } from '../auth.service';
import { DatabaseConfig } from '../../config/database.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly databaseConfig: DatabaseConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fallback-secret',
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const user = await this.authService.getUserById(payload.sub);
      
      if (!user || !user.active) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Set company and user context for RLS
      await this.databaseConfig.setCompanyContext(user.company_id);
      await this.databaseConfig.setUserContext(user.id);
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.company_id,
        emailVerified: user.email_verified,
      };
    } catch (error) {
      console.error('JWT validation error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}