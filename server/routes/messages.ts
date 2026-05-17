import express from "express";
import prisma from "../lib/prisma.ts";
import { authenticateToken } from "./auth.ts";

const router = express.Router();

// Get all unique counterparts and their latest message + unread count in a single query
router.get("/conversations", authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    // Optimized raw query to avoid N+1 issue
    const conversations: any[] = await prisma.$queryRaw`
      SELECT 
        u.id, 
        u.name, 
        u.avatar_url as "avatarUrl", 
        u.role,
        m.content,
        m.type,
        m.created_at as "lastMessageTime",
        COALESCE(unread.count, 0)::int as "unreadCount"
      FROM users u
      JOIN (
        SELECT DISTINCT ON (counterpart_id) 
          CASE WHEN sender_id = ${userId} THEN receiver_id ELSE sender_id END as counterpart_id,
          content, type, created_at
        FROM messages
        WHERE sender_id = ${userId} OR receiver_id = ${userId}
        ORDER BY counterpart_id, created_at DESC
      ) m ON u.id = m.counterpart_id
      LEFT JOIN (
        SELECT sender_id, COUNT(*) as count
        FROM messages
        WHERE receiver_id = ${userId} AND status != 'read'
        GROUP BY sender_id
      ) unread ON u.id = unread.sender_id
      ORDER BY m.created_at DESC
    `;

    const formattedConversations = conversations.map(c => ({
      id: c.id,
      userId: c.id,
      name: c.name,
      avatarUrl: c.avatarUrl,
      lastMessage: c.content || (c.type === 'voice' ? 'Voice message' : c.type === 'image' ? 'Image message' : ''),
      lastMessageTime: c.lastMessageTime ? new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      unreadCount: Number(c.unreadCount),
      online: false
    }));

    res.json(formattedConversations);
  } catch (error) {
    console.error("Conversations error:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Get messages between two users
router.get("/:userId/:otherUserId", authenticateToken, async (req: any, res) => {
  const { userId, otherUserId } = req.params;
  const { cursor } = req.query;
  const requesterId = req.user.id;
  const role = req.user.role;

  // Only participants or admin can read messages
  if (
    role !== "admin" &&
    requesterId !== userId &&
    requesterId !== otherUserId
  ) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      ...(cursor ? { skip: 1, cursor: { id: cursor as string } } : {}),
    });

    const nextCursor = messages.length === 50 ? messages[49].id : null;
    if (nextCursor) res.setHeader("X-Next-Cursor", nextCursor);
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send a simple message via REST (alternative to WebSocket)
router.post("/", authenticateToken, async (req: any, res) => {
  try {
    const { receiverId, content, type, audioUrl, imageUrl } = req.body;
    const senderId = req.user.id;

    if (!receiverId) {
      return res.status(400).json({ error: "receiverId is required" });
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content: content || null,
        type: type || "text",
        audioUrl: audioUrl || null,
        imageUrl: imageUrl || null,
        status: "sent",
      },
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Post message error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
