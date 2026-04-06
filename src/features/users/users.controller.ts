import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách người dùng' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết người dùng' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(Number(id));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.usersService.update(Number(id), data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa người dùng' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(Number(id));
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Đổi mật khẩu' })
  async changePassword(
    @Request() req: any,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    return this.usersService.changePassword(req.user.userId, body.oldPassword, body.newPassword);
  }

  @Post('profile')
  @ApiOperation({ summary: 'Tạo hồ sơ người dùng' })
  async createProfile(
    @Request() req: any,
    @Body() body: { profileType: string; data: any },
  ) {
    return this.usersService.createProfile(req.user.userId, body.profileType, body.data);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Cập nhật hồ sơ người dùng' })
  async updateProfile(
    @Request() req: any,
    @Body() body: { profileType: string; data: any },
  ) {
    return this.usersService.updateProfile(req.user.userId, body.profileType, body.data);
  }
}
