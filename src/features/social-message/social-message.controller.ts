import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { SocialMessageService } from './social-message.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Social Message - Mạng xã hội & Tin nhắn')
@Controller('social-message')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SocialMessageController {
  constructor(private readonly socialMessageService: SocialMessageService) {}

  // ==================== THREADS ====================
  @Get('feed')
  @ApiOperation({ summary: 'Lấy bảng tin (feed)' })
  async getFeed(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.socialMessageService.getFeed(
      req.user.userId,
      limit ? Number(limit) : 20,
      cursor ? Number(cursor) : undefined,
    );
  }

  @Get('thread/:id')
  @ApiOperation({ summary: 'Lấy chi tiết thread' })
  async getThreadDetail(@Param('id') id: string, @Request() req: any) {
    return this.socialMessageService.getThreadDetail(Number(id), req.user.userId);
  }

  @Post('thread')
  @ApiOperation({ summary: 'Tạo thread mới' })
  async createThread(
    @Request() req: any,
    @Body() data: { content: string; hinhAnh?: string; threadChaId?: number },
  ) {
    return this.socialMessageService.createThread(req.user.userId, data);
  }

  @Delete('thread/:id')
  @ApiOperation({ summary: 'Xóa thread' })
  async deleteThread(@Param('id') id: string, @Request() req: any) {
    return this.socialMessageService.deleteThread(Number(id), req.user.userId);
  }

  @Get('user/:id/threads')
  @ApiOperation({ summary: 'Lấy threads của user' })
  async getUserThreads(
    @Param('id') userId: string,
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.socialMessageService.getUserThreads(
      Number(userId),
      req.user.userId,
      limit ? Number(limit) : 20,
      cursor ? Number(cursor) : undefined,
    );
  }

  // ==================== LIKE ====================
  @Post('thread/:id/like')
  @ApiOperation({ summary: 'Like/Unlike thread' })
  async toggleLike(@Param('id') threadId: string, @Request() req: any) {
    return this.socialMessageService.toggleLike(req.user.userId, Number(threadId));
  }

  // ==================== FOLLOW ====================
  @Post('user/:id/follow')
  @ApiOperation({ summary: 'Follow/Unfollow user' })
  async toggleFollow(@Param('id') followingId: string, @Request() req: any) {
    return this.socialMessageService.toggleFollow(req.user.userId, Number(followingId));
  }

  @Get('followers')
  @ApiOperation({ summary: 'Lấy danh sách người theo dõi mình' })
  async getFollowers(@Request() req: any) {
    return this.socialMessageService.getFollowers(req.user.userId);
  }

  @Get('following')
  @ApiOperation({ summary: 'Lấy danh sách người mình theo dõi' })
  async getFollowing(@Request() req: any) {
    return this.socialMessageService.getFollowing(req.user.userId);
  }

  // ==================== FRIENDS ====================
  @Post('friend-request/:userId')
  @ApiOperation({ summary: 'Gửi lời mời kết bạn' })
  async sendFriendRequest(@Param('userId') receiverId: string, @Request() req: any) {
    return this.socialMessageService.sendFriendRequest(req.user.userId, Number(receiverId));
  }

  @Post('friend-request/:id/respond')
  @ApiOperation({ summary: 'Chấp nhận/Từ chối lời mời kết bạn' })
  async respondToFriendRequest(
    @Param('id') requestId: string,
    @Body() data: { accept: boolean },
    @Request() req: any,
  ) {
    return this.socialMessageService.respondToFriendRequest(
      Number(requestId),
      req.user.userId,
      data.accept,
    );
  }

  @Get('friend-requests')
  @ApiOperation({ summary: 'Lấy danh sách lời mời kết bạn đang chờ' })
  async getFriendRequests(@Request() req: any) {
    return this.socialMessageService.getFriendRequests(req.user.userId);
  }

  @Get('friends')
  @ApiOperation({ summary: 'Lấy danh sách bạn bè' })
  async getFriends(@Request() req: any) {
    return this.socialMessageService.getFriends(req.user.userId);
  }

  // ==================== CHAT ====================
  @Get('chat/channels')
  @ApiOperation({ summary: 'Lấy danh sách kênh chat' })
  async getChannels(@Request() req: any) {
    return this.socialMessageService.getChannels(req.user.userId);
  }

  @Post('chat/channel/direct/:userId')
  @ApiOperation({ summary: 'Tạo hoặc lấy kênh chat cá nhân' })
  async getOrCreateDirectChat(
    @Param('userId') otherUserId: string,
    @Request() req: any,
  ) {
    return this.socialMessageService.getOrCreateDirectChat(
      req.user.userId,
      Number(otherUserId),
    );
  }

  @Get('chat/channel/:id/messages')
  @ApiOperation({ summary: 'Lấy tin nhắn trong kênh' })
  async getMessages(
    @Param('id') chatChannelId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.socialMessageService.getMessages(
      Number(chatChannelId),
      limit ? Number(limit) : 50,
      cursor ? Number(cursor) : undefined,
    );
  }

  @Post('chat/channel/:id/message')
  @ApiOperation({ summary: 'Gửi tin nhắn' })
  async sendMessage(
    @Param('id') chatChannelId: string,
    @Request() req: any,
    @Body() data: { content?: string; type?: string; fileUrl?: string },
  ) {
    return this.socialMessageService.sendMessage(req.user.userId, {
      channelId: Number(chatChannelId),
      ...data,
    });
  }

  // ==================== PROFILE ====================
  @Get('profile/:id')
  @ApiOperation({ summary: 'Lấy thông tin social profile' })
  async getSocialProfile(@Param('id') userId: string, @Request() req: any) {
    return this.socialMessageService.getSocialProfile(Number(userId), req.user.userId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm người dùng' })
  async searchUsers(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.socialMessageService.searchUsers(
      query,
      limit ? Number(limit) : 20,
    );
  }
}
