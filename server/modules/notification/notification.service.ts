import prisma from "../../lib/prisma.ts";
import { RealtimeService } from "../realtime/websocket.service.ts";
import { NotificationType } from "@prisma/client";

export class NotificationService {
  static async sendNotification(
    userId: string, 
    type: string, 
    title: string, 
    body: string, 
    actionUrl?: string
  ) {
    // 1. Persist to DB
    const validatedType = (type === "push" || type === "email" || type === "reminder") ? (type as NotificationType) : NotificationType.push;
    const notif = await prisma.notification.create({
      data: {
        userId,
        type: validatedType,
        title,
        message: body,
        link: actionUrl,
        isRead: false
      }
    });

    // 2. Real-time push
    RealtimeService.notifyUser(userId, "new_notification", notif);

    return notif;
  }

  static async markAsRead(notificationId: string) {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });
  }

  static async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  }
}
