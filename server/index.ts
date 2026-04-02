import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { initDb } from "./db.ts";
import db from "./db.ts";
import { getPreferredLanguage, t } from './lib/i18n.ts';
import { v4 as uuidv4 } from "uuid";
import authRoutes from "./routes/auth.ts";
import bookingRoutes from "./routes/bookings.ts";
import serviceRoutes from "./routes/services.ts";
import adminRoutes from "./routes/admin.ts";
import artisanRoutes from "./routes/artisans.ts";
import { initNotificationService, sendNotification } from "./services/notificationService.ts";
import fs from 'fs';
import path from 'path';
import acceptLanguage from 'accept-language-parser';

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  initNotificationService(io);

  const PORT = 3000;

  // Initialize DB
  try {
    initDb();
    app.set('db', db);
    console.log("Database initialized successfully");
  } catch (dbError) {
    console.error("Failed to initialize database:", dbError);
  }

  app.use(express.json({ limit: '50mb' }));
  
  // Language Detection Middleware
const detectLanguage = (req: any, res: any, next: any) => {
  const langCode = getPreferredLanguage(req);
  
  // Verify language exists and is active
  const lang = db.prepare('SELECT * FROM languages WHERE code = ? AND is_active = 1').get(langCode);
  if (!lang) {
    // Fallback to default setting if requested language not found/active
    const defaultLang = db.prepare('SELECT value FROM settings WHERE key = ?').get('default_language');
    const fallbackCode = defaultLang?.value || 'en';
    const fallback = db.prepare('SELECT * FROM languages WHERE code = ?').get(fallbackCode);
    
    req.lang = fallback?.code || 'en';
    req.isRTL = fallback?.is_rtl === 1;
  } else {
    req.lang = lang.code;
    req.isRTL = lang.is_rtl === 1;
  }

  next();
};

app.use(detectLanguage);
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Serve static uploads
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadDir));

  // Upload endpoint
  app.post('/api/upload', (req, res) => {
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
    res.json({ status: "ok", env: process.env.NODE_ENV || "development" });
  });

  // --- API Routes ---
  app.use("/api/auth", authRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/services", serviceRoutes);
  app.use("/api/artisans", artisanRoutes);
  app.use("/api/marketplace/artisans", artisanRoutes);
  app.use("/api/marketplace/categories", (req, res) => {
    const categories = db.prepare("SELECT * FROM categories").all();
    res.json(categories);
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
  app.get("/api/notifications/:userId", (req, res) => {
    const notifications = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20").all(req.params.userId);
    res.json(notifications);
  });

  app.post("/api/notifications/:id/read", (req, res) => {
    db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Smart Reminders Job
  const startReminderJob = () => {
    setInterval(() => {
      const now = new Date();
      
      // 1. Appointment Reminders (1 hour before)
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      const oneHourAndOneMinFromNow = new Date(now.getTime() + 61 * 60 * 1000);
      
      const upcomingBookings = db.prepare(`
        SELECT b.*, u.name as client_name, a_u.name as artisan_name, a_u.id as artisan_user_id
        FROM bookings b
        JOIN users u ON b.client_id = u.id
        JOIN artisans a ON b.artisan_id = a.id
        JOIN users a_u ON a.user_id = a_u.id
        WHERE b.booking_status = 'proposal_approved' 
        AND b.scheduled_at BETWEEN ? AND ?
      `).all(oneHourFromNow.toISOString(), oneHourAndOneMinFromNow.toISOString()) as any[];

      upcomingBookings.forEach(booking => {
        sendNotification(
          booking.client_id,
          "Appointment Reminder",
          `Your appointment with ${booking.artisan_name} is in 1 hour.`,
          'reminder',
          '/bookings'
        );
        sendNotification(
          booking.artisan_user_id,
          "Appointment Reminder",
          `Your appointment with ${booking.client_name} is in 1 hour.`,
          'reminder',
          '/bookings'
        );
      });

      // 2. Urgent Request Reminders (if not accepted within 15 mins)
      const fifteenMinsAgo = new Date(now.getTime() - 15 * 60 * 1000);
      const sixteenMinsAgo = new Date(now.getTime() - 16 * 60 * 1000);

      const urgentRequests = db.prepare(`
        SELECT b.*, u.name as client_name, a_u.id as artisan_user_id
        FROM bookings b
        JOIN users u ON b.client_id = u.id
        JOIN artisans a ON b.artisan_id = a.id
        JOIN users a_u ON a.user_id = a_u.id
        WHERE b.booking_status = 'pending' 
        AND b.is_urgent = 1
        AND b.created_at BETWEEN ? AND ?
      `).all(sixteenMinsAgo.toISOString(), fifteenMinsAgo.toISOString()) as any[];

      urgentRequests.forEach(request => {
        sendNotification(
          request.artisan_user_id,
          "Urgent Request Reminder",
          `You have an urgent request from ${request.client_name} waiting for your response.`,
          'reminder',
          '/bookings'
        );
      });

    }, 60000); // Run every minute
  };

  startReminderJob();
  
  // Translation Routes
  app.get('/api/translations/:lang', (req, res) => {
    const { lang } = req.params;
    const db = (app as any).get('db');
    
    const translations = db.prepare('SELECT key, value FROM translations WHERE language_code = ?').all(lang);
    const translationMap = translations.reduce((acc: any, t: any) => {
      acc[t.key] = t.value;
      return acc;
    }, {});
    
    res.json(translationMap);
  });

  app.get('/api/languages', (req, res) => {
    const db = (app as any).get('db');
    const languages = db.prepare('SELECT * FROM languages WHERE is_active = 1').all();
    res.json(languages);
  });

  // Categories & Services
  app.get("/api/categories", (req, res) => {
    const categories = db.prepare("SELECT * FROM categories").all();
    res.json(categories);
  });

  app.get("/api/services/:categoryId", (req, res) => {
    const services = db.prepare("SELECT * FROM services WHERE category_id = ?").all(req.params.categoryId);
    res.json(services);
  });

  // Chat
  app.get("/api/messages/:userId/:otherUserId", (req, res) => {
    const { userId, otherUserId } = req.params;
    const messages = db.prepare(`
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) 
         OR (sender_id = ? AND receiver_id = ?) 
      ORDER BY created_at ASC
    `).all(userId, otherUserId, otherUserId, userId);
    res.json(messages);
  });

  // --- WebSockets ---
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    socket.on("update_location", (data) => {
      const { artisanId, lat, lng } = data;
      db.prepare("UPDATE artisans SET latitude = ?, longitude = ? WHERE id = ?")
        .run(lat, lng, artisanId);
      // Broadcast to clients tracking this artisan
      io.emit(`location_${artisanId}`, { lat, lng });
    });

    socket.on("send_message", (data) => {
      const { sender_id, receiver_id, content, type, audio_url, order_id } = data;
      const id = uuidv4();
      db.prepare(`
        INSERT INTO messages (id, sender_id, receiver_id, content, type, audio_url, order_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, sender_id, receiver_id, content || null, type || 'text', audio_url || null, order_id || null);
      
      const message = db.prepare("SELECT * FROM messages WHERE id = ?").get(id);
      io.to(receiver_id).emit("receive_message", message);
      io.to(sender_id).emit("receive_message", message);
      
      // Notify receiver if they are not in the chat
      sendNotification(
        receiver_id, 
        "New Message", 
        type === 'voice' ? "Sent a voice message" : content, 
        'push', 
        `/messages/${sender_id}`
      );
    });

    // --- Video Call Signaling ---
    socket.on("call_request", (data) => {
      const { to, from, fromName, type, signal } = data;
      io.to(to).emit("incoming_call", { from, fromName, type, signal });
    });

    socket.on("accept_call", (data) => {
      const { to, from, signal } = data;
      io.to(to).emit("call_accepted", { from, signal });
    });

    socket.on("reject_call", (data) => {
      const { to } = data;
      io.to(to).emit("call_rejected");
    });

    socket.on("webrtc_signal", (data) => {
      const { to, signal } = data;
      io.to(to).emit("webrtc_signal", { from: socket.id, signal });
    });

    socket.on("ice_candidate", (data) => {
      const { to, candidate } = data;
      io.to(to).emit("ice_candidate", { from: socket.id, candidate });
    });

    socket.on("end_call", (data) => {
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
    console.log(`Database initialized at m3allem.db`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
