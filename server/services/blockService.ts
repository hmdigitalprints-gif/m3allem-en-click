import prisma from "../lib/prisma.ts";

export class BlockService {
  /**
   * Blocks a target user from sending messages or making calls.
   */
  static async blockUser(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new Error("You cannot block yourself.");
    }

    return await prisma.userBlockMute.upsert({
      where: {
        userId_targetUserId: { userId, targetUserId }
      },
      create: {
        userId,
        targetUserId,
        isBlocked: true,
        isMuted: false
      },
      update: {
        isBlocked: true
      }
    });
  }

  /**
   * Unblocks a target user.
   */
  static async unblockUser(userId: string, targetUserId: string) {
    return await prisma.userBlockMute.update({
      where: {
        userId_targetUserId: { userId, targetUserId }
      },
      data: {
        isBlocked: false
      }
    }).catch(() => {
      // Return gracefully if entry didn't exist
      return null;
    });
  }

  /**
   * Mutes real-time and pushing notifications of messages from a target user.
   */
  static async muteUser(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new Error("You cannot mute yourself.");
    }

    return await prisma.userBlockMute.upsert({
      where: {
        userId_targetUserId: { userId, targetUserId }
      },
      create: {
        userId,
        targetUserId,
        isBlocked: false,
        isMuted: true
      },
      update: {
        isMuted: true
      }
    });
  }

  /**
   * Unmutes real-time/pushing notifications of messages from a target user.
   */
  static async unmuteUser(userId: string, targetUserId: string) {
    return await prisma.userBlockMute.update({
      where: {
        userId_targetUserId: { userId, targetUserId }
      },
      data: {
        isMuted: false
      }
    }).catch(() => {
      return null;
    });
  }

  /**
   * Verifies if any block relationship exists between user A and user B.
   * If userA blocked userB or userB blocked userA, communication is disabled.
   */
  static async isBlocked(userAId: string, userBId: string): Promise<boolean> {
    if (!userAId || !userBId) return false;

    const blockCount = await prisma.userBlockMute.count({
      where: {
        OR: [
          { userId: userAId, targetUserId: userBId, isBlocked: true },
          { userId: userBId, targetUserId: userAId, isBlocked: true }
        ]
      }
    });

    return blockCount > 0;
  }

  /**
   * Checks specifically if receiver has blocked or muted the sender.
   */
  static async getPreferences(senderId: string, receiverId: string) {
    const records = await prisma.userBlockMute.findMany({
      where: {
        OR: [
          { userId: senderId, targetUserId: receiverId },
          { userId: receiverId, targetUserId: senderId }
        ]
      }
    });

    const isBlocked = records.some(r => r.isBlocked);
    const isMutedByReceiver = records.some(r => r.userId === receiverId && r.targetUserId === senderId && r.isMuted);

    return {
      isBlocked,
      isMutedByReceiver
    };
  }

  /**
   * Get blocked and muted registry for a specific user ID to render in settings.
   */
  static async getRelations(userId: string) {
    const list = await prisma.userBlockMute.findMany({
      where: { userId }
    });

    // Populate user profiles cleanly
    const targetIds = list.map(item => item.targetUserId);
    const profiles = await prisma.user.findMany({
      where: { id: { in: targetIds } },
      select: { id: true, name: true, avatarUrl: true, role: true }
    });

    const profileMap = new Map(profiles.map(p => [p.id, p]));

    return list.map(item => ({
      ...item,
      targetUser: profileMap.get(item.targetUserId) || null
    }));
  }
}
