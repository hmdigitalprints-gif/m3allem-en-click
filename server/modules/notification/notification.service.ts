import prisma from "../../lib/prisma.ts";
import { RealtimeService } from "../realtime/websocket.service.ts";

export class NotificationService {
  static async sendNotification(
    userId: string, 
    type: string, 
    title: string, 
    body: string, 
    actionUrl?: string
  ) {
    // 1. Persist to DB
    const notif = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        actionUrl,
        read: false
      }
    });

    // 2. Real-time push
    RealtimeService.notifyUser(userId, "new_notification", notif);

    return notif;
  }

  static async markAsRead(notificationId: string) {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });
  }

  static async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
  }
}
