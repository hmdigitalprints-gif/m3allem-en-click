import prisma from "../lib/prisma.ts";

export const auditService = {
  log: async (userId: string | null, action: string, entityType: string, entityId: string | null, details: any, ipAddress?: string) => {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          entityType,
          entityId,
          details: details ? JSON.stringify(details) : null,
          ipAddress: ipAddress || null
        }
      });
    } catch (error) {
      console.error("Failed to log audit entry:", error);
    }
  }
};
