import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        fullName: true,
        avatar: true,
        isActivated: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        teacherProfile: true,
        studentProfile: {
          include: {
            classEnrollments: {
              include: {
                academicClass: {
                  include: {
                    class: true,
                    academicYear: true,
                  },
                },
              },
            },
          },
        },
        staffProfile: true,
        socialProfile: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });
  }

  async update(id: number, data: any) {
    const updateData: any = {};
    
    if (data.email !== undefined) updateData.email = data.email;
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async changePassword(id: number, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || !user.password) {
      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new Error('Old password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async createProfile(userId: number, profileType: string, data: any) {
    switch (profileType) {
      case 'TEACHER': // Changed from GIAO_VIEN
        return this.prisma.teacherProfile.create({
          data: {
            userId,
            teacherCode: data.teacherCode,
            fullName: data.fullName,
            birthday: data.birthday ? new Date(data.birthday) : null,
            gender: data.gender,
            address: data.address,
            phoneNumber: data.phoneNumber,
            contactEmail: data.contactEmail,
            idCard: data.idCard,
            educationLevel: data.educationLevel,
            specialization: data.specialization,
          },
        });
      case 'STUDENT': // Changed from HOC_SINH
        return this.prisma.studentProfile.create({
          data: {
            userId,
            studentCode: data.studentCode,
            fullName: data.fullName,
            birthday: data.birthday ? new Date(data.birthday) : null,
            gender: data.gender,
            birthPlace: data.birthPlace,
            ethnicity: data.ethnicity,
            religion: data.religion,
            permanentAddress: data.permanentAddress,
            phoneNumber: data.phoneNumber,
            idCard: data.idCard,
            fatherName: data.fatherName,
            fatherPhone: data.fatherPhone,
            motherName: data.motherName,
            motherPhone: data.motherPhone,
          },
        });
      default:
        throw new Error('Invalid profile type');
    }
  }

  async updateProfile(userId: number, profileType: string, data: any) {
    switch (profileType) {
      case 'TEACHER':
        return this.prisma.teacherProfile.update({
          where: { userId },
          data: {
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            contactEmail: data.contactEmail,
            address: data.address,
            specialization: data.specialization,
          },
        });
      case 'STUDENT':
        return this.prisma.studentProfile.update({
          where: { userId },
          data: {
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            permanentAddress: data.permanentAddress,
          },
        });
      default:
        throw new Error('Invalid profile type');
    }
  }
}
