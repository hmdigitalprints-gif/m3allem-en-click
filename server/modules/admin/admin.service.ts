import prisma from "../../lib/prisma.ts";
import { auditService } from "../../services/auditService.ts";

export class AdminService {
  static async getUsers(skip = 0, take = 50, search?: string) {
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as any } },
        { email: { contains: search, mode: 'insensitive' as any } }
      ]
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, email: true, phone: true, role: true, verified: true, createdAt: true
        }
      }),
      prisma.user.count({ where })
    ]);

    return { users, total };
  }

  static async verifyUser(userId: string, adminId: string) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { verified: true }
    });
    await auditService.log(adminId, "USER_VERIFIED", "user", userId, {});
    return updated;
  }

  static async banUser(userId: string, adminId: string, reason: string) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { verified: false } // using verified as a proxy or we could add 'isBanned' tracking
    });
    await auditService.log(adminId, "USER_BANNED", "user", userId, { reason });
    return updated;
  }
}
