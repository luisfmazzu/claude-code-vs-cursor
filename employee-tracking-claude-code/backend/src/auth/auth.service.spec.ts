import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DatabaseConfig } from '../config/database.config';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  or: jest.fn().mockReturnThis(),
};

const mockDatabaseConfig = {
  getClient: jest.fn().mockReturnValue(mockSupabaseClient),
  setCompanyContext: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('test-jwt-secret'),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: DatabaseConfig,
          useValue: mockDatabaseConfig,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password_hash: 'hashed-password',
        name: 'Test User',
        role: 'user',
        company_id: 'company-id',
        active: true,
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockUser,
        error: null,
      });

      mockedBcrypt.compare.mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        companyId: mockUser.company_id,
        active: mockUser.active,
      });

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('email', 'test@example.com');
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password', 'hashed-password');
    });

    it('should return null when user is not found', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      });

      const result = await service.validateUser('nonexistent@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password_hash: 'hashed-password',
        name: 'Test User',
        role: 'user',
        company_id: 'company-id',
        active: true,
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockUser,
        error: null,
      });

      mockedBcrypt.compare.mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrong-password');

      expect(result).toBeNull();
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('wrong-password', 'hashed-password');
    });

    it('should return null when user is inactive', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password_hash: 'hashed-password',
        name: 'Test User',
        role: 'user',
        company_id: 'company-id',
        active: false,
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockUser,
        error: null,
      });

      mockedBcrypt.compare.mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token for valid user', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        companyId: 'company-id',
        active: true,
      };

      mockJwtService.sign.mockReturnValue('mock-access-token');

      const result = await service.login(mockUser);

      expect(result).toEqual({
        access_token: 'mock-access-token',
        user: mockUser,
      });

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        role: mockUser.role,
        companyId: mockUser.companyId,
      });
    });
  });

  describe('register', () => {
    const registerDto = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
      companyName: 'Test Company',
    };

    it('should successfully register a new user and company', async () => {
      const mockCompany = {
        id: 'company-id',
        name: 'Test Company',
        email: 'newuser@example.com',
      };

      const mockUser = {
        id: 'user-id',
        email: 'newuser@example.com',
        name: 'New User',
        role: 'owner',
        company_id: 'company-id',
        active: true,
      };

      // Mock bcrypt hash
      mockedBcrypt.hash.mockResolvedValue('hashed-password');

      // Mock company creation
      mockSupabaseClient.single
        .mockResolvedValueOnce({ data: null, error: { message: 'Not found' } }) // Check existing user
        .mockResolvedValueOnce({ data: mockCompany, error: null }) // Create company
        .mockResolvedValueOnce({ data: mockUser, error: null }); // Create user

      mockJwtService.sign.mockReturnValue('mock-access-token');

      const result = await service.register(registerDto);

      expect(result).toEqual({
        access_token: 'mock-access-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          companyId: mockUser.company_id,
          active: mockUser.active,
        },
      });

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should throw BadRequestException when user already exists', async () => {
      const existingUser = {
        id: 'existing-user-id',
        email: 'newuser@example.com',
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: existingUser,
        error: null,
      });

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
      await expect(service.register(registerDto)).rejects.toThrow('User already exists');
    });
  });

  describe('refreshToken', () => {
    it('should return new access token for valid refresh token', async () => {
      const payload = {
        sub: 'user-id',
        email: 'test@example.com',
        role: 'user',
        companyId: 'company-id',
      };

      mockJwtService.verify.mockReturnValue(payload);
      mockJwtService.sign.mockReturnValue('new-access-token');

      const result = await service.refreshToken('valid-refresh-token');

      expect(result).toEqual({
        access_token: 'new-access-token',
      });

      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-refresh-token');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: payload.email,
        sub: payload.sub,
        role: payload.role,
        companyId: payload.companyId,
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshToken('invalid-token')).rejects.toThrow('Invalid refresh token');
    });
  });
});