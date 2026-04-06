import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập' })
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.authService.validateUser(body.username, body.password);
    return this.authService.login(user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký' })
  async register(@Body() body: {
    username: string;
    password: string;
    email?: string;
    role: string;
    fullName?: string;
    phoneNumber?: string;
  }) {
    return this.authService.register(body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin người dùng hiện tại' })
  async getMe(@Request() req: any) {
    return this.authService.getMe(req.user.sub);
  }
}
