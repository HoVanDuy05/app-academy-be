import { Controller, Get, Post, Delete, Param, Query, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Notifications - Thông báo')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thông báo' })
  async getNotifications(
    @Request() req: any,
    @Query('isRead') isRead?: string,
  ) {
    return this.notificationsService.getNotifications(
      req.user.userId,
      isRead !== undefined ? isRead === 'true' : undefined,
    );
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Đánh dấu đã đọc' })
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.notificationsService.markAsRead(Number(id), req.user.userId);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Đánh dấu tất cả đã đọc' })
  async markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa thông báo' })
  async deleteNotification(@Param('id') id: string, @Request() req: any) {
    return this.notificationsService.deleteNotification(Number(id), req.user.userId);
  }
}
