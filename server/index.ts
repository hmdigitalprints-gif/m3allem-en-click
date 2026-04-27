import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import prisma from "./lib/prisma.ts";
import { getPreferredLanguage, t } from './lib/i18n.ts';
import { v4 as uuidv4 } from "uuid";
import authRoutes from "./routes/auth.ts";
import bookingRoutes from "./routes/bookings.ts";
import serviceRoutes from "./routes/services.ts";
import adminRoutes from "./routes/admin.ts";
import artisanRoutes from "./routes/artisans.ts";
import walletRoutes from "./routes/wallet.ts";
import { initNotificationService, sendNotification } from "./services/notificationService.ts";
import { authenticateToken } from "./routes/auth.ts";
import { sanitizeObject } from "./lib/sanitizer.ts";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import fs from 'fs';
import path from 'path';
import acceptLanguage from 'accept-language-parser';

async function startServer() {
  // Check DATABASE_URL
  if (!process.env.DATABASE_URL || (!process.env.DATABASE_URL.startsWith('postgresql://') && !process.env.DATABASE_URL.startsWith('postgres://'))) {
    console.error('\n================================================================================');
    console.error('CRITICAL ERROR: Invalid or missing DATABASE_URL environment variable.');
    console.error('The application requires a PostgreSQL database to function.');
    console.error('Please set the DATABASE_URL in your environment variables (e.g., in AI Studio Settings).');
    console.error('Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE');
    console.error('================================================================================\n');
  }

  const app = express();
  app.set('trust proxy', 1);
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  initNotificationService(io);

  const PORT = 3000;

  const dbReady = true;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Request Logging
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.url}`);
    }
    next();
  });
  
  // Input Sanitization Middleware
  app.use((req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }
    next();
  });

  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: false, 
    crossOriginEmbedderPolicy: false,
  }));

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Increased for development
    message: "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
  });
  
  // Apply rate limiter to all API routes
  app.use("/api/", limiter);

  // Stricter rate limit for auth routes
  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Increased for development
    message: "Too many login attempts, please try again after an hour",
    validate: { trustProxy: false },
  });
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);
  
// Language Detection Middleware
const detectLanguage = async (req: any, res: any, next: any) => {
  try {
    const langCode = await getPreferredLanguage(req);
    
    // Avoid Prisma calls if DB is not ready to prevent timeouts
    if (!dbReady) {
      req.lang = langCode || 'en';
      req.isRTL = req.lang === 'ar';
      return next();
    }
    
    // Verify language exists and is active
    const lang = await prisma.language.findUnique({
      where: { code: langCode, isActive: true }
    });

    if (!lang) {
      // Fallback to default setting if requested language not found/active
      const defaultLangSetting = await prisma.setting.findUnique({
        where: { key: 'default_language' }
      });
      const fallbackCode = defaultLangSetting?.value || 'en';
      const fallback = await prisma.language.findUnique({
        where: { code: fallbackCode }
      });
      
      req.lang = fallback?.code || 'en';
      req.isRTL = fallback?.isRtl === true;
    } else {
      req.lang = lang.code;
      req.isRTL = lang.isRtl === true;
    }
  } catch (error: any) {
    if (!error?.message?.includes('PrismaClientInitializationError') && !String(error).includes('PrismaClientInitializationError')) {
      console.error("Language detection error:", error);
    }
    req.lang = 'en';
    req.isRTL = false;
  }

  next();
};

app.use(detectLanguage);

  // Serve static uploads
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadDir));

  // Upload endpoint
  app.post('/api/upload', authenticateToken, (req, res) => {
    try {
      const { file, type } = req.body; // type: image, audio
      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      // Extract base64 data
      const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Invalid base64 string' });
      }

      const mimeType = matches[1];
      const ext = mimeType.split('/')[1] || (type === 'audio' ? 'webm' : 'png');
      const buffer = Buffer.from(matches[2], 'base64');
      const filename = `${uuidv4()}.${ext}`;
      const filepath = path.join(uploadDir, filename);

      fs.writeFileSync(filepath, buffer);

      const url = `/uploads/${filename}`;
      res.json({ url });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV || "development", dbReady });
  });

  // --- API Routes ---
  app.use("/api/auth", authRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/services", serviceRoutes);
  app.use("/api/wallet", walletRoutes);
  app.use("/api/artisans", artisanRoutes);
  
  // Custom auth / webhooks
  const { default: webhookRoutes } = await import("./routes/webhooks.ts");
  app.use("/api/webhooks", webhookRoutes);

  app.use("/api/marketplace/artisans", artisanRoutes);
  app.use("/api/marketplace/categories", async (req, res) => {
    try {
      const categories = await prisma.category.findMany();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });
  app.use("/api/marketplace/favorites", (req, res) => {
    // Mock favorites for now
    res.json([]);
  });
  app.use("/api/marketplace/my-favorites", (req, res) => {
    res.json([]);
  });
  app.use("/api/admin", (req, res, next) => {
    console.log(`[Server] Admin route hit: ${req.method} ${req.url}`);
    next();
  }, adminRoutes);

  // Notifications
  app.get("/api/notifications/:userId", authenticateToken, async (req: any, res) => {
    const { userId } = req.params;
    const requesterId = req.user.id;
    const role = req.user.role;

    if (role !== 'admin' && requesterId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20
      });
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications/:id/read", authenticateToken, async (req: any, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      // Verify ownership
      const notification = await prisma.notification.findUnique({
        where: { id }
      });
      if (!notification) return res.status(404).json({ error: "Notification not found" });
      
      if (notification.userId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Unauthorized" });
      }

      await prisma.notification.update({
        where: { id },
        data: { isRead: true }
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // Smart Reminders Job
  const startReminderJob = () => {
    setInterval(async () => {
      if (!dbReady) return;
      try {
        const now = new Date();
        
        // 1. Appointment Reminders (1 hour before)
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        const oneHourAndOneMinFromNow = new Date(now.getTime() + 61 * 60 * 1000);
        
        const upcomingBookings = await prisma.booking.findMany({
          where: {
            bookingStatus: 'proposal_approved',
            scheduledAt: {
              gte: oneHourFromNow,
              lte: oneHourAndOneMinFromNow
            }
          },
          include: {
            client: { select: { name: true } },
            artisan: { include: { user: { select: { name: true, id: true } } } }
          }
        });

        upcomingBookings.forEach(booking => {
          if (booking.clientId) {
            sendNotification(
              booking.clientId,
              "Appointment Reminder",
              `Your appointment with ${booking.artisan?.user?.name} is in 1 hour.`,
              'reminder',
              '/bookings'
            );
          }
          if (booking.artisan?.user?.id) {
            sendNotification(
              booking.artisan.user.id,
              "Appointment Reminder",
              `Your appointment with ${booking.client?.name} is in 1 hour.`,
              'reminder',
              '/bookings'
            );
          }
        });

        // 2. Urgent Request Reminders (if not accepted within 15 mins)
        const fifteenMinsAgo = new Date(now.getTime() - 15 * 60 * 1000);
        const sixteenMinsAgo = new Date(now.getTime() - 16 * 60 * 1000);

        const urgentRequests = await prisma.booking.findMany({
          where: {
            bookingStatus: 'pending',
            isUrgent: true,
            createdAt: {
              gte: sixteenMinsAgo,
              lte: fifteenMinsAgo
            }
          },
          include: {
            client: { select: { name: true } },
            artisan: { include: { user: { select: { id: true } } } }
          }
        });

        urgentRequests.forEach(request => {
          if (request.artisan?.user?.id) {
            sendNotification(
              request.artisan.user.id,
              "Urgent Request Reminder",
              `You have an urgent request from ${request.client?.name} waiting for your response.`,
              'reminder',
              '/bookings'
            );
          }
        });
      } catch (error: any) {
        if (!error?.message?.includes('PrismaClientInitializationError') && !String(error).includes('PrismaClientInitializationError')) {
          console.error("Error in reminder job:", error);
        }
      }
    }, 60000); // Run every minute
  };

  startReminderJob();
  
  // Translation Routes
  app.get('/api/translations/:lang', async (req, res) => {
    const { lang } = req.params;
    
    try {
      const translations = await prisma.translation.findMany({
        where: { languageCode: lang }
      });
      const translationMap = translations.reduce((acc: any, t: any) => {
        acc[t.key] = t.value;
        return acc;
      }, {});
      
      res.json(translationMap);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch translations" });
    }
  });

  app.get('/api/languages', async (req, res) => {
    try {
      const languages = await prisma.language.findMany({
        where: { isActive: true }
      });
      res.json(languages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch languages" });
    }
  });

  // Categories & Services
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await prisma.category.findMany();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/services/:categoryId", async (req, res) => {
    try {
      const services = await prisma.service.findMany({
        where: { categoryId: req.params.categoryId }
      });
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  // Chat
  app.get("/api/messages/:userId/:otherUserId", authenticateToken, async (req: any, res) => {
    const { userId, otherUserId } = req.params;
    const requesterId = req.user.id;
    const role = req.user.role;

    // Only participants or admin can read messages
    if (role !== 'admin' && requesterId !== userId && requesterId !== otherUserId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId }
          ]
        },
        orderBy: { createdAt: 'asc' }
      });
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // 404 handler for API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: "API endpoint not found" });
  });

  // --- WebSockets ---
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    socket.on("update_location", async (data) => {
      const { artisanId, lat, lng } = data;
      try {
        await prisma.artisan.update({
          where: { id: artisanId },
          data: { latitude: lat, longitude: lng }
        });
        // Broadcast to clients tracking this artisan
        io.emit(`location_${artisanId}`, { lat, lng });
      } catch (error) {
        console.error("Location update error:", error);
      }
    });

    socket.on("send_message", async (data) => {
      const { sender_id, receiver_id, content, type, audio_url, image_url, latitude, longitude, order_id } = data;
      try {
        const message = await prisma.message.create({
          data: {
            senderId: sender_id,
            receiverId: receiver_id,
            content: content || null,
            type: type || 'text',
            audioUrl: audio_url || null,
            imageUrl: image_url || null,
            latitude: latitude || null,
            longitude: longitude || null,
            orderId: order_id || null,
            status: 'sent'
          }
        });
        
        io.to(receiver_id).emit("receive_message", message);
        io.to(sender_id).emit("receive_message", message);
        
        // Notify receiver if they are not in the chat
        sendNotification(
          receiver_id, 
          "New Message", 
          type === 'voice' ? "Sent a voice message" : 
          type === 'image' ? "Sent a photo" :
          type === 'location' ? "Shared their location" : content, 
          'push', 
          `/messages/${sender_id}`
        );
      } catch (error) {
        console.error("Send message error:", error);
      }
    });

    socket.on("typing_start", (data) => {
      if (!data) return;
      const { to, from } = data;
      io.to(to).emit("user_typing", { from, isTyping: true });
    });

    socket.on("typing_stop", (data) => {
      if (!data) return;
      const { to, from } = data;
      io.to(to).emit("user_typing", { from, isTyping: false });
    });

    socket.on("mark_read", async (data) => {
      if (!data) return;
      const { messageIds, readerId, senderId } = data;
      if (messageIds && messageIds.length > 0) {
        try {
          await prisma.message.updateMany({
            where: { id: { in: messageIds } },
            data: { status: 'read' }
          });
          io.to(senderId).emit("messages_read", { messageIds, readerId });
        } catch (error) {
          console.error("Mark read error:", error);
        }
      }
    });

    // --- Video Call Signaling ---
    socket.on("call_request", (data) => {
      if (!data) return;
      const { to, from, fromName, type, signal } = data;
      io.to(to).emit("incoming_call", { from, fromName, type, signal });
    });

    socket.on("accept_call", (data) => {
      if (!data) return;
      const { to, from, signal } = data;
      io.to(to).emit("call_accepted", { from, signal });
    });

    socket.on("reject_call", (data) => {
      if (!data) return;
      const { to } = data;
      io.to(to).emit("call_rejected");
    });

    socket.on("webrtc_signal", (data) => {
      if (!data) return;
      const { to, signal } = data;
      io.to(to).emit("webrtc_signal", { from: socket.id, signal });
    });

    socket.on("ice_candidate", (data) => {
      if (!data) return;
      const { to, candidate } = data;
      io.to(to).emit("ice_candidate", { from: socket.id, candidate });
    });

    socket.on("end_call", (data) => {
      if (!data) return;
      const { to } = data;
      io.to(to).emit("call_ended");
    });

    socket.on("submit_diagnostic", (data) => {
      const { to, diagnosis, price } = data;
      io.to(to).emit("receive_diagnostic", { diagnosis, price });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`Database: SQLite`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
