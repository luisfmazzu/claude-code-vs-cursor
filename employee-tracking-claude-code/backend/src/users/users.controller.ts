import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request, 
  Query,
  BadRequestException 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService, CreateUserDto, UpdateUserDto, UserFilters } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('owner', 'administrator')
  @ApiOperation({ summary: 'Get all users in company' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findAll(
    @Request() req,
    @Query('role') role?: string,
    @Query('active') active?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const filters: UserFilters = {
      role,
      active: active !== undefined ? active === 'true' : undefined,
      search,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    };

    return this.usersService.findAll(req.user.companyId, filters);
  }

  @Get(':id')
  @Roles('owner', 'administrator')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findOne(@Param('id') id: string, @Request() req) {
    const user = await this.usersService.findOne(id, req.user.companyId);
    
    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Post()
  @Roles('owner', 'administrator')
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    // Set company ID from authenticated user
    createUserDto.companyId = req.user.companyId;
    
    const user = await this.usersService.create(createUserDto, req.user.role);
    
    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Patch(':id')
  @Roles('owner', 'administrator')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    const user = await this.usersService.update(
      id,
      updateUserDto,
      req.user.companyId,
      req.user.role,
    );
    
    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Delete(':id')
  @Roles('owner')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Only owners can delete users' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.usersService.remove(id, req.user.companyId, req.user.role, req.user.id);
    return { message: 'User deleted successfully' };
  }

  @Post('invite')
  @Roles('owner', 'administrator')
  @ApiOperation({ summary: 'Invite user to company' })
  @ApiResponse({ status: 200, description: 'Invitation sent successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async inviteUser(
    @Body() inviteDto: { email: string; role: 'administrator' | 'user' },
    @Request() req,
  ) {
    await this.usersService.inviteUser(
      inviteDto.email,
      inviteDto.role,
      req.user.companyId,
      req.user.role,
    );
    
    return { message: 'Invitation sent successfully' };
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  async changePassword(
    @Body() changePasswordDto: { currentPassword: string; newPassword: string },
    @Request() req,
  ) {
    if (!changePasswordDto.currentPassword || !changePasswordDto.newPassword) {
      throw new BadRequestException('Current password and new password are required');
    }

    if (changePasswordDto.newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters long');
    }

    await this.usersService.changePassword(
      req.user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
      req.user.companyId,
    );
    
    return { message: 'Password changed successfully' };
  }

  @Get('profile/me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getMyProfile(@Request() req) {
    const user = await this.usersService.findOne(req.user.id, req.user.companyId);
    
    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Patch('profile/me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateMyProfile(
    @Body() updateDto: { name?: string },
    @Request() req,
  ) {
    const user = await this.usersService.update(
      req.user.id,
      { name: updateDto.name },
      req.user.companyId,
      req.user.role,
    );
    
    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}