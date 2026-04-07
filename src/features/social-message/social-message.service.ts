import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SocialMessageService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) { }

  // ==================== THREADS (SOCIAL POSTS) ====================
  async createThread(userId: number, data: {
    content: string;
    image?: string;
    parentPostId?: number;
  }) {
    const thread = await this.prisma.socialPost.create({
      data: {
        authorId: userId,
        content: data.content,
        image: data.image,
        parentPostId: data.parentPostId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
            reposts: true,
          },
        },
      },
    });

    // Notify parent author if it's a reply
    if (data.parentPostId) {
      const parentThread = await this.prisma.socialPost.findUnique({
        where: { id: data.parentPostId },
        select: { authorId: true },
      });

      if (parentThread && parentThread.authorId !== userId) {
        await this.notificationsService.createNotification({
          recipientId: parentThread.authorId,
          title: 'New Reply',
          content: 'Someone replied to your post',
          type: "SOCIAL",
          link: `/social/thread/${data.parentPostId}`,
        });
      }
    }

    return thread;
  }

  async getFeed(userId: number, limit = 20, cursor?: number) {
    // Get following list
    const following = await this.prisma.follower.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f: any) => f.followingId);
    followingIds.push(userId); // Include self

    const threads = await this.prisma.socialPost.findMany({
      where: {
        authorId: { in: followingIds },
        parentPostId: null, // Only original posts
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        _count: {
          select: { likes: true, replies: true, reposts: true },
        },
        likes: {
          where: { userId: userId },
          select: { userId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    return threads.map((t: any) => ({
      ...t,
      liked: t.likes.length > 0,
      likes: undefined,
    }));
  }

  async getThreadDetail(id: number, userId?: number) {
    const thread = await this.prisma.socialPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatar: true,
              },
            },
            _count: { select: { likes: true, replies: true } },
            likes: userId
              ? {
                where: { userId: userId },
                select: { userId: true },
              }
              : false,
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: { likes: true, replies: true, reposts: true },
        },
        likes: userId
          ? {
            where: { userId: userId },
            select: { userId: true },
          }
          : false,
      },
    });

    if (!thread) return null;

    return {
      ...thread,
      liked: userId ? thread.likes.length > 0 : false,
      likes: undefined,
      replies: thread.replies.map((r: any) => ({
        ...r,
        liked: userId ? r.likes.length > 0 : false,
        likes: undefined,
      })),
    };
  }

  async getUserThreads(userId: number, requesterId?: number, limit = 20, cursor?: number) {
    const threads = await this.prisma.socialPost.findMany({
      where: {
        authorId: userId,
        parentPostId: null,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        _count: {
          select: { likes: true, replies: true, reposts: true },
        },
        likes: requesterId
          ? {
            where: { userId: requesterId },
            select: { userId: true },
          }
          : false,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    return threads.map((t: any) => ({
      ...t,
      liked: requesterId ? t.likes.length > 0 : false,
      likes: undefined,
    }));
  }

  async deleteThread(id: number, userId: number) {
    const thread = await this.prisma.socialPost.findUnique({
      where: { id },
    });

    if (!thread) {
      throw new NotFoundException('Post not found');
    }

    if (thread.authorId !== userId) {
      throw new NotFoundException('You do not have permission to delete this post');
    }

    return this.prisma.socialPost.delete({
      where: { id },
    });
  }

  // ==================== LIKE ====================
  async toggleLike(userId: number, postId: number) {
    const existing = await this.prisma.postLike.findUnique({
      where: {
        postId_userId: { postId, userId: userId },
      },
    });

    if (existing) {
      await this.prisma.postLike.delete({ where: { id: existing.id } });
      return { liked: false };
    } else {
      const like = await this.prisma.postLike.create({
        data: { postId, userId: userId },
        include: {
          post: { select: { authorId: true } },
        },
      });

      // Notify author
      if (like.post.authorId !== userId) {
        await this.notificationsService.createNotification({
          recipientId: like.post.authorId,
          title: 'New Like',
          content: 'Someone liked your post',
          type: "SOCIAL",
          link: `/social/thread/${postId}`,
        });
      }

      return { liked: true };
    }
  }

  // ==================== FOLLOW ====================
  async toggleFollow(followerId: number, followingId: number) {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    const existing = await this.prisma.follower.findUnique({
      where: {
        followingId_followerId: {
          followerId: followerId,
          followingId: followingId,
        },
      },
    });

    if (existing) {
      await this.prisma.follower.delete({ where: { id: existing.id } });
      return { following: false };
    } else {
      await this.prisma.follower.create({
        data: {
          followerId: followerId,
          followingId: followingId,
        },
      });

      // Notify followed user
      await this.notificationsService.createNotification({
        recipientId: followingId,
        title: 'New Follower',
        content: 'Someone started following you',
        type: "SOCIAL",
        link: `/social/profile/${followerId}`,
      });

      return { following: true };
    }
  }

  async getFollowers(userId: number) {
    const followers = await this.prisma.follower.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    return followers.map((f: any) => f.follower);
  }

  async getFollowing(userId: number) {
    const following = await this.prisma.follower.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    return following.map((f: any) => f.following);
  }

  // ==================== FRIENDS ====================
  async sendFriendRequest(senderId: number, recipientId: number) {
    if (senderId === recipientId) {
      throw new Error('Cannot send friend request to yourself');
    }

    // Check if relation exists
    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId, recipientId },
          { senderId: recipientId, recipientId: senderId },
        ],
      },
    });

    if (existing) {
      throw new Error('Friendship relation already exists');
    }

    const friendRequest = await this.prisma.friendship.create({
      data: {
        senderId,
        recipientId,
        status: 'PENDING',
      },
    });

    // Notify
    await this.notificationsService.createNotification({
      recipientId,
      title: 'Friend Request',
      content: 'Someone sent you a friend request',
      type: "SOCIAL",
      link: `/social/friends`,
    });

    return friendRequest;
  }

  async respondToFriendRequest(requestId: number, recipientId: number, accept: boolean) {
    const request = await this.prisma.friendship.findFirst({
      where: {
        id: requestId,
        recipientId,
      },
    });

    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    return this.prisma.friendship.update({
      where: { id: requestId },
      data: {
        status: accept ? 'ACCEPTED' : 'REJECTED',
      },
    });
  }

  async getFriendRequests(userId: number) {
    return this.prisma.friendship.findMany({
      where: {
        recipientId: userId,
        status: 'PENDING',
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async getFriends(userId: number) {
    const friends = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: userId },
          { recipientId: userId },
        ],
        status: 'ACCEPTED',
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        recipient: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    return friends.map((f: any) => {
      return f.senderId === userId ? f.recipient : f.sender;
    });
  }

  // ==================== CHAT ====================
  async getChannels(userId: number) {
    return this.prisma.chatChannel.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatar: true,
              },
            },
          },
        },
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async getOrCreateDirectChat(user1Id: number, user2Id: number) {
    // Find existing private channel
    const existingChannel = await this.prisma.chatChannel.findFirst({
      where: {
        chatType: "PRIVATE",
        AND: [
          {
            members: {
              some: { userId: user1Id },
            },
          },
          {
            members: {
              some: { userId: user2Id },
            },
          },
        ],
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (existingChannel) {
      return existingChannel;
    }

    // Create new channel
    return this.prisma.chatChannel.create({
      data: {
        chatType: "PRIVATE",
        members: {
          create: [
            { userId: user1Id },
            { userId: user2Id },
          ],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async getMessages(channelId: number, limit = 50, cursor?: number) {
    return this.prisma.message.findMany({
      where: { channelId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
      orderBy: { sentAt: 'desc' },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });
  }

  async sendMessage(senderId: number, data: {
    channelId: number;
    content?: string;
    type?: string;
    fileUrl?: string;
  }) {
    // Check if sender is in channel
    const member = await this.prisma.channelMember.findFirst({
      where: {
        channelId: data.channelId,
        userId: senderId,
      },
    });

    if (!member) {
      throw new Error('You are not a member of this chat channel');
    }

    const message = await this.prisma.message.create({
      data: {
        channelId: data.channelId,
        senderId,
        content: data.content,
        type: data.type as any || "TEXT",
        fileUrl: data.fileUrl,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    // Notify other members
    const otherMembers = await this.prisma.channelMember.findMany({
      where: {
        channelId: data.channelId,
        userId: { not: senderId },
      },
    });

    for (const member of otherMembers) {
      await this.notificationsService.createNotification({
        recipientId: member.userId,
        title: 'New Message',
        content: 'You have a new message',
        type: "MESSAGE",
        link: `/chat/${data.channelId}`,
      });
    }

    return message;
  }

  // ==================== SOCIAL PROFILE ====================
  async getSocialProfile(userId: number, requesterId?: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        teacherProfile: true,
        socialProfile: true,
        _count: {
          select: {
            socialPosts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    let isFollowing = false;
    let friendshipStatus: 'NONE' | 'FRIEND' | 'SENT' | 'RECEIVED' = 'NONE';
    let mutualFriendsCount = 0;

    // Get total friends count
    const friendsCount = await this.prisma.friendship.count({
      where: {
        OR: [
          { senderId: userId, status: 'ACCEPTED' },
          { recipientId: userId, status: 'ACCEPTED' },
        ],
      },
    });

    if (requesterId && requesterId !== userId) {
      // Check follow status
      const follow = await this.prisma.follower.findUnique({
        where: {
          followingId_followerId: {
            followerId: requesterId,
            followingId: userId,
          },
        },
      });
      isFollowing = !!follow;

      // Check friendship status
      const friendship = await this.prisma.friendship.findFirst({
        where: {
          OR: [
            { senderId: requesterId, recipientId: userId },
            { senderId: userId, recipientId: requesterId },
          ],
        },
      });

      if (friendship) {
        if (friendship.status === 'ACCEPTED') friendshipStatus = 'FRIEND';
        else if (friendship.senderId === requesterId) friendshipStatus = 'SENT';
        else friendshipStatus = 'RECEIVED';
      }

      // Mutual friends logic
      const userFriends = await this.prisma.friendship.findMany({
        where: { OR: [{ senderId: userId }, { recipientId: userId }], status: 'ACCEPTED' },
        select: { senderId: true, recipientId: true },
      });
      const requesterFriends = await this.prisma.friendship.findMany({
        where: { OR: [{ senderId: requesterId }, { recipientId: requesterId }], status: 'ACCEPTED' },
        select: { senderId: true, recipientId: true },
      });

      const userFriendIds = new Set(userFriends.flatMap((f: { senderId: number; recipientId: number }) => f.senderId === userId ? f.recipientId : f.senderId));
      const requesterFriendIds = requesterFriends.flatMap((f: { senderId: number; recipientId: number }) => f.senderId === requesterId ? f.recipientId : f.senderId);

      mutualFriendsCount = requesterFriendIds.filter((id: number) => userFriendIds.has(id)).length;
    }

    // Get latest photos (from posts)
    const recentPhotos = await this.prisma.socialPost.findMany({
      where: { authorId: userId, image: { not: null } },
      select: { image: true },
      take: 6,
      orderBy: { createdAt: 'desc' },
    });

    // Get sample friends (first 6)
    const sampleFriendsRaw = await this.prisma.friendship.findMany({
      where: { OR: [{ senderId: userId }, { recipientId: userId }], status: 'ACCEPTED' },
      include: {
        sender: { select: { id: true, fullName: true, avatar: true, username: true } },
        recipient: { select: { id: true, fullName: true, avatar: true, username: true } },
      },
      take: 6,
    });

    const sampleFriends = sampleFriendsRaw.map((f: { senderId: number; sender: any; recipient: any }) => f.senderId === userId ? f.recipient : f.sender);

    return {
      ...user,
      stats: {
        posts: user._count.socialPosts,
        followers: user._count.followers,
        following: user._count.following,
        friends: friendsCount,
        mutualFriends: mutualFriendsCount,
      },
      social: {
        isFollowing,
        friendshipStatus,
        recentPhotos: recentPhotos.map((p: { image: string | null }) => p.image).filter(Boolean),
        sampleFriends,
      },
    };
  }

  async searchUsers(query: string, limit = 20) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { fullName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatar: true,
        role: true,
      },
      take: limit,
    });
  }
}
