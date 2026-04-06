import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async createNotification(data: {
    recipientId: number;
    title: string;
    content: string;
    type?: string;
    link?: string;
  }) {
    return this.prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        title: data.title,
        content: data.content,
        type: data.type as any || 'SYSTEM',
        link: data.link,
      },
    });
  }

  async getNotifications(recipientId: number, isRead?: boolean) {
    const where: any = { recipientId };
    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: number, recipientId: number) {
    return this.prisma.notification.updateMany({
      where: { id, recipientId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(recipientId: number) {
    return this.prisma.notification.updateMany({
      where: { recipientId, isRead: false },
      data: { isRead: true },
    });
  }

  async deleteNotification(id: number, recipientId: number) {
    return this.prisma.notification.deleteMany({
      where: { id, recipientId },
    });
  }
}
