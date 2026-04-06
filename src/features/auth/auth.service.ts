import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(identifier: string, password: string) {
    // Tìm theo email HOẶC username
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier },
        ],
      },
      include: {
        teacherProfile: true,
        studentProfile: true,
        staffProfile: true,
      },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu không đúng');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { 
      sub: user.id, 
      username: user.username, 
      role: user.role 
    };
    
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  async register(data: {
    username: string;
    password: string;
    email?: string;
    role: string;
    fullName?: string;
    phoneNumber?: string;
  }) {
    // Kiểm tra trùng username hoặc email
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: data.username },
          { email: data.email },
        ],
      },
    });

    if (existing) {
      throw new ConflictException('Username hoặc Email đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        email: data.email,
        role: data.role as any,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        isActivated: true, // Auto activate for now
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacherProfile: true,
        studentProfile: {
          include: {
            class: true,
            attendances: {
              take: 5,
              orderBy: { date: 'desc' },
            },
          },
        },
        staffProfile: true,
        socialProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password, ...result } = user;
    return result;
  }
}
