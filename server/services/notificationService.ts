import prisma from "../lib/prisma.ts";
import { Server } from "socket.io";
import { t } from "../lib/i18n.ts";

export let io: Server;

export const initNotificationService = (socketIo: Server) => {
  io = socketIo;
};

/**
 * Sends a localized notification to a user.
 * @param userId Target user ID
 * @param titleKey Translation key for the title
 * @param messageKey Translation key for the message
 * @param type Notification type
 * @param link Optional link
 * @param params Optional parameters for string replacement
 */
export const sendNotification = async (userId: string, titleKey: string, messageKey: string, type: 'push' | 'email' | 'reminder', link?: string, params: any = {}) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferredLanguage: true }
    });
    const lang = user ? user.preferredLanguage : 'fr';

    let title = await t(titleKey, lang);
    let message = await t(messageKey, lang);

    // Replace params in message/title if any (e.g. {{name}})
    Object.keys(params).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      message = message.replace(regex, params[key]);
      title = title.replace(regex, params[key]);
    });

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link: link || null
      }
    });
    
    if (io) {
      io.to(userId).emit("new_notification", notification);
    }
    
    // Simulate Email/Push
    console.log(`[${type.toUpperCase()}] To ${userId} [${lang}]: ${title} - ${message}`);
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
};
