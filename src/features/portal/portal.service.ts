import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class PortalService {
  constructor(private prisma: PrismaService) {}

  async getBanners() {
    return this.prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async getBaiViets(type?: string, limit = 10) {
    const where: any = { isPublished: true };
    if (type) where.type = type;

    return this.prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });
  }

  async getBaiVietDetail(id: number) {
    // Tăng lượt xem
    await this.prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });
  }

  async createBaiViet(data: any) {
    return this.prisma.post.create({
      data: {
        title: data.tieuDe,
        slug: data.duongDan,
        summary: data.tomTat,
        content: data.content,
        thumbnail: data.anhBia,
        type: data.loai,
        targetGroup: data.doiTuong,
        authorId: data.nguoiTaoId,
      },
    });
  }
}
