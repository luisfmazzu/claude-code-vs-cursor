import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DatabaseConfig, User } from '../config/database.config';
import * as bcrypt from 'bcryptjs';

export interface CreateUserDto {
  email: string;
  name: string;
  role: 'owner' | 'administrator' | 'user';
  companyId: string;
  password: string;
}

export interface UpdateUserDto {
  name?: string;
  role?: 'owner' | 'administrator' | 'user';
  active?: boolean;
}

export interface UserFilters {
  role?: string;
  active?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class UsersService {
  constructor(private readonly databaseConfig: DatabaseConfig) {}

  async findAll(companyId: string, filters: UserFilters = {}): Promise<{ users: User[]; total: number }> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.role) {
        query = query.eq('role', filters.role);
      }

      if (filters.active !== undefined) {
        query = query.eq('active', filters.active);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 25) - 1);
      }

      const { data: users, error, count } = await query;

      if (error) {
        throw new BadRequestException(`Failed to fetch users: ${error.message}`);
      }

      return {
        users: users || [],
        total: count || 0,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async findOne(id: string, companyId: string): Promise<User> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .eq('company_id', companyId)
        .single();

      if (error || !user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching user:', error);
      throw new BadRequestException('Failed to fetch user');
    }
  }

  async create(createUserDto: CreateUserDto, currentUserRole: string): Promise<User> {
    try {
      // Check if current user has permission to create users
      if (!this.canManageUsers(currentUserRole)) {
        throw new ForbiddenException('Insufficient permissions to create users');
      }

      // Check if target role is allowed
      if (!this.canAssignRole(currentUserRole, createUserDto.role)) {
        throw new ForbiddenException('Insufficient permissions to assign this role');
      }

      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(createUserDto.companyId);

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', createUserDto.email)
        .single();

      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
      const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

      // Create user
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email: createUserDto.email,
          name: createUserDto.name,
          role: createUserDto.role,
          company_id: createUserDto.companyId,
          password_hash: passwordHash,
          active: true,
          email_verified: false,
        })
        .select()
        .single();

      if (error) {
        throw new BadRequestException(`Failed to create user: ${error.message}`);
      }

      return newUser;
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error creating user:', error);
      throw new BadRequestException('Failed to create user');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto, companyId: string, currentUserRole: string): Promise<User> {
    try {
      // Check if current user has permission to update users
      if (!this.canManageUsers(currentUserRole)) {
        throw new ForbiddenException('Insufficient permissions to update users');
      }

      // If role is being updated, check permissions
      if (updateUserDto.role && !this.canAssignRole(currentUserRole, updateUserDto.role)) {
        throw new ForbiddenException('Insufficient permissions to assign this role');
      }

      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      // Check if user exists
      const existingUser = await this.findOne(id, companyId);

      // Prevent users from deactivating themselves
      if (updateUserDto.active === false && id === currentUserRole) {
        throw new BadRequestException('Cannot deactivate your own account');
      }

      // Update user
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(updateUserDto)
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single();

      if (error) {
        throw new BadRequestException(`Failed to update user: ${error.message}`);
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error updating user:', error);
      throw new BadRequestException('Failed to update user');
    }
  }

  async remove(id: string, companyId: string, currentUserRole: string, currentUserId: string): Promise<void> {
    try {
      // Only owners can delete users
      if (currentUserRole !== 'owner') {
        throw new ForbiddenException('Only owners can delete users');
      }

      // Prevent users from deleting themselves
      if (id === currentUserId) {
        throw new BadRequestException('Cannot delete your own account');
      }

      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      // Check if user exists
      await this.findOne(id, companyId);

      // Delete user
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId);

      if (error) {
        throw new BadRequestException(`Failed to delete user: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error deleting user:', error);
      throw new BadRequestException('Failed to delete user');
    }
  }

  async inviteUser(email: string, role: 'administrator' | 'user', companyId: string, currentUserRole: string): Promise<void> {
    try {
      // Check permissions
      if (!this.canManageUsers(currentUserRole)) {
        throw new ForbiddenException('Insufficient permissions to invite users');
      }

      if (!this.canAssignRole(currentUserRole, role)) {
        throw new ForbiddenException('Insufficient permissions to assign this role');
      }

      // TODO: Implement email invitation system
      // For now, just log the invitation
      console.log(`Invitation sent to ${email} for role ${role} in company ${companyId}`);

      // In a real implementation, you would:
      // 1. Generate an invitation token
      // 2. Store it in a pending_invitations table
      // 3. Send an email with the invitation link
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      console.error('Error inviting user:', error);
      throw new BadRequestException('Failed to invite user');
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string, companyId: string): Promise<void> {
    try {
      const supabase = this.databaseConfig.getClient();
      
      // Set company context
      await this.databaseConfig.setCompanyContext(companyId);

      // Get user
      const user = await this.findOne(userId, companyId);

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      
      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      const { error } = await supabase
        .from('users')
        .update({ password_hash: newPasswordHash })
        .eq('id', userId)
        .eq('company_id', companyId);

      if (error) {
        throw new BadRequestException(`Failed to update password: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error changing password:', error);
      throw new BadRequestException('Failed to change password');
    }
  }

  private canManageUsers(role: string): boolean {
    return ['owner', 'administrator'].includes(role);
  }

  private canAssignRole(currentRole: string, targetRole: string): boolean {
    const roleHierarchy = {
      owner: ['owner', 'administrator', 'user'],
      administrator: ['administrator', 'user'],
      user: [],
    };

    return roleHierarchy[currentRole]?.includes(targetRole) || false;
  }
}