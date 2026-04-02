import db from "../db.ts";
import { v4 as uuidv4 } from "uuid";
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
export const sendNotification = (userId: string, titleKey: string, messageKey: string, type: 'push' | 'email' | 'reminder', link?: string, params: any = {}) => {
  const user = db.prepare("SELECT preferred_language FROM users WHERE id = ?").get(userId) as any;
  const lang = user ? user.preferred_language : 'fr';

  let title = t(titleKey, lang);
  let message = t(messageKey, lang);

  // Replace params in message/title if any (e.g. {{name}})
  Object.keys(params).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    message = message.replace(regex, params[key]);
    title = title.replace(regex, params[key]);
  });

  const id = uuidv4();
  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, link)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, userId, title, message, type, link || null);
  
  const notification = db.prepare("SELECT * FROM notifications WHERE id = ?").get(id);
  if (io) {
    io.to(userId).emit("new_notification", notification);
  }
  
  // Simulate Email/Push
  console.log(`[${type.toUpperCase()}] To ${userId} [${lang}]: ${title} - ${message}`);
};
