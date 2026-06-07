import prisma from "../../lib/prisma.ts";

export class UserService {
  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        verified: true,
        avatarUrl: true,
        city: true,
        createdAt: true,
      }
    });
    if (!user) throw new Error("User not found");
    return user;
  }

  static async updateUserProfile(userId: string, data: any) {
    return await prisma.user.update({
      where: { id: userId },
      data
    });
  }
}
