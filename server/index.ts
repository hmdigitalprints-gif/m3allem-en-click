import express from "express";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import prisma from "./lib/prisma.ts";
import { getPreferredLanguage, t } from "./lib/i18n.ts";
import { v4 as uuidv4 } from "uuid";
import authRoutes from "./routes/auth.ts";
import bookingRoutes from "./routes/bookings.ts";
import serviceRoutes from "./routes/services.ts";
import adminRoutes from "./routes/admin.ts";
import artisanRoutes from "./routes/artisans.ts";
import walletRoutes from "./routes/wallet.ts";
import sellerRoutes from "./routes/sellers.ts";
import marketplaceRoutes from "./routes/marketplace.ts";
import companyRoutes from "./routes/companies.ts";
import aiRoutes from "./routes/ai.ts";
import messageRoutes from "./routes/messages.ts";
import simulationRoutes from "./routes/simulation.ts";
import {
  initNotificationService,
  sendNotification,
} from "./services/notificationService.ts";
import { authenticateToken } from "./routes/auth.ts";
import { BookingStatus } from "@prisma/client";
import { sanitizeObject } from "./lib/sanitizer.ts";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import fs from "fs";
import path from "path";
import acceptLanguage from "accept-language-parser";
import NodeCache from "node-cache";
import pino from "pino";
import pinoHttp from "pino-http";
import * as Sentry from "@sentry/node";
import compression from "compression";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});

Sentry.init({
  dsn: process.env.SENTRY_DSN || "",
  tracesSampleRate: 1.0,
});

const langCache = new NodeCache({ stdTTL: 300 });

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is missing.");
}
const JWT_SECRET = process.env.JWT_SECRET;

async function startServer() {
  const app = express();
  app.set("trust proxy", 1);

  // Enable CORS
  app.use(cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept-Language", "Cookie"]
  }));

  // Gzip compression for faster transfers
  app.use(compression());

  app.use(
    pinoHttp({
      logger,
      autoLogging: {
        ignore: (req) => {
          // Ignore Vite static assets and fast-refresh requests
          const url = req.url || '';
          if (
            url.startsWith('/@') ||
            url.startsWith('/src') ||
            url.startsWith('/node_modules') ||
            url.startsWith('/__vite') ||
            url.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)
          ) {
            return true;
          }
          return false;
        },
      },
    }),
  );

  const httpServer = createServer(app);

  const isDev = process.env.NODE_ENV !== "production";

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || (isDev ? "*" : "https://m3allem.ma"),
    },
  });

  initNotificationService(io);

  const PORT = 3000;

  // Database is handled by Prisma
  const hasValidDbUrl =
    process.env.DATABASE_URL &&
    process.env.DATABASE_URL !==
      "postgresql://dummy:dummy@localhost:5432/dummy" &&
    (process.env.DATABASE_URL.startsWith("postgresql://") ||
      process.env.DATABASE_URL.startsWith("postgres://"));

  const dbReady = hasValidDbUrl;

  app.use(cookieParser());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // Request Logging
  app.use((req, res, next) => {
    next();
  });

  // Input Sanitization Middleware
  app.use((req, res, next) => {
    if (req.body && typeof req.body === "object") {
      req.body = sanitizeObject(req.body);
    }
    next();
  });

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: isDev
        ? false
        : {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'unsafe-inline'"], // Removed unsafe-eval
              styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
              ],
              imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
              fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
              connectSrc: ["'self'", "wss:", "ws:"],
            },
          },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isDev ? 10000 : 2000, // Significantly increased for development
    message:
      "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
  });

  // Apply rate limiter to all API routes
  app.use("/api/", limiter);

  // Stricter rate limit for auth routes
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Increased slightly but still limited for security
    message: "Too many login attempts, please try again after 15 minutes",
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
        req.lang = langCode || "en";
        req.isRTL = req.lang === "ar";
        return next();
      }

      const cacheKey = `lang_${langCode}`;
      const cachedResult: any = langCache.get(cacheKey);

      if (cachedResult) {
        req.lang = cachedResult.lang;
        req.isRTL = cachedResult.isRTL;
        return next();
      }

      // Verify language exists and is active
      const lang = await prisma.language.findUnique({
        where: { code: langCode, isActive: true },
      });

      let finalLang = "en";
      let finalIsRTL = false;

      if (!lang) {
        // Fallback to default setting if requested language not found/active
        let fallbackCode = "en";
        const defaultLangSettingCache = langCache.get(
          "default_language_setting",
        );
        if (defaultLangSettingCache !== undefined) {
          fallbackCode = defaultLangSettingCache as string;
        } else {
          const defaultLangSetting = await prisma.setting.findUnique({
            where: { key: "default_language" },
          });
          fallbackCode = defaultLangSetting?.value || "en";
          langCache.set("default_language_setting", fallbackCode, 300);
        }

        const fallbackCacheKey = `lang_data_${fallbackCode}`;
        let fallback: any = langCache.get(fallbackCacheKey);
        if (fallback === undefined) {
          fallback = await prisma.language.findUnique({
            where: { code: fallbackCode },
          });
          langCache.set(fallbackCacheKey, fallback || null, 300);
        }

        finalLang = fallback?.code || "en";
        finalIsRTL = fallback?.isRtl === true;
      } else {
        finalLang = lang.code;
        finalIsRTL = lang.isRtl === true;
      }

      langCache.set(cacheKey, { lang: finalLang, isRTL: finalIsRTL }, 3600);
      req.lang = finalLang;
      req.isRTL = finalIsRTL;
    } catch (error: any) {
      if (
        !error?.message?.includes("PrismaClientInitializationError") &&
        !String(error).includes("PrismaClientInitializationError")
      ) {
        console.error("Language detection error:", error);
      }
      req.lang = "en";
      req.isRTL = false;
    }

    next();
  };

  app.use(detectLanguage);

  // Serve static uploads
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  app.use(
    "/uploads",
    (req, res, next) => {
      // Prevent execution of scripts/HTML in uploaded files when accessed directly
      res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
      res.setHeader("X-Content-Type-Options", "nosniff");

      // Force download for non-image types
      const ext = path.extname(req.url).toLowerCase();
      const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
      if (!imageExts.includes(ext)) {
        res.setHeader("Content-Disposition", "attachment");
      }

      next();
    },
    express.static(uploadDir),
  );

  // Upload endpoint
  app.post("/api/upload", authenticateToken, async (req, res) => {
    try {
      const { file, type } = req.body; // type: image, audio
      if (!file) {
        return res.status(400).json({ error: "No file provided" });
      }

      // Extract base64 data
      const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Invalid base64 string" });
      }

      const mimeType = matches[1];
      const allowedMimes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
        "audio/webm",
        "audio/mp3",
        "audio/mpeg",
        "audio/ogg",
        "application/pdf",
      ];
      if (!allowedMimes.includes(mimeType)) {
        return res.status(400).json({ error: "Disallowed file type" });
      }

      const buffer = Buffer.from(matches[2], "base64");
      if (buffer.length > 5 * 1024 * 1024) {
        // 5MB limit
        return res
          .status(400)
          .json({ error: "File size limit exceeded (5MB maximum)" });
      }

      let finalBuffer = buffer;
      let ext = "png";

      if (mimeType === "image/svg+xml") {
        // file-type package often misidentifies SVGs
        const contentString = buffer.toString('utf-8');
        if (!contentString.includes('<svg') && !contentString.includes('<SVG')) {
          return res.status(400).json({ error: "Invalid SVG file" });
        }
        ext = "svg";
      } else {
        // Validate magic bytes
        const { fileTypeFromBuffer } = await import("file-type");
        const actualType = await fileTypeFromBuffer(buffer);
  
        if (!actualType || !allowedMimes.includes(actualType.mime)) {
          return res
            .status(400)
            .json({ error: "File content does not match allowed types" });
        }
  
        ext =
          actualType.ext ||
          mimeType.split("/")[1] ||
          (type === "audio" ? "webm" : "png");
  
        if (
          actualType.mime.startsWith("image/") &&
          actualType.mime !== "image/gif"
        ) {
          const sharp = (await import("sharp")).default;
          // Optimize to webp but preserve high original resolution (up to 4k basically)
          finalBuffer = await sharp(buffer)
            .resize({ width: 3840, withoutEnlargement: true })
            .webp({ quality: 85 })
            .toBuffer();
          ext = "webp";
        }
      }

      const filename = `${uuidv4()}.${ext}`;

      // Prevent path traversal
      if (filename.includes("..") || filename.includes("/")) {
        return res.status(400).json({ error: "Invalid filename" });
      }

      // Supabase Storage Integration
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
      const supabaseBucket = process.env.SUPABASE_BUCKET || "uploads";

      if (supabaseUrl && supabaseAnonKey) {
          const { createClient } = await import("@supabase/supabase-js");
          const supabase = createClient(supabaseUrl, supabaseAnonKey);
          
          const { error: uploadError } = await supabase.storage
            .from(supabaseBucket)
            .upload(filename, finalBuffer, {
              contentType: mimeType === "image/svg+xml" ? "image/svg+xml" : "image/webp",
              upsert: true
            });
            
          if (uploadError) {
              console.error("Supabase storage upload failed:", uploadError);
              return res.status(500).json({ error: "Cloud storage upload failed", details: uploadError.message });
          }
          
          const { data: publicData } = supabase.storage.from(supabaseBucket).getPublicUrl(filename);
          return res.json({ url: publicData.publicUrl });
      }

      // Fallback: Local filesystem (Ephemeral in Cloud Run)
      const filepath = path.join(uploadDir, filename);

      fs.writeFileSync(filepath, finalBuffer);

      const url = `/uploads/${filename}`;
      res.json({ url });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      env: process.env.NODE_ENV || "development",
      dbReady,
    });
  });

  // Detailed health check
  app.get("/api/health/detailed", (req, res) => {
    res.json({
      status: "ok",
      env: process.env.NODE_ENV || "development",
      dbReady,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    });
  });

  // DB Readiness Middleware for API
  app.use("/api", (req, res, next) => {
    if (!dbReady) {
      if (req.method === "GET" && req.path === "/marketplace/categories") {
        return res.json([
          {
            id: "1",
            name_en: "Plumbing",
            name_fr: "Plomberie",
            name_ar: "سباكة",
            icon: "wrench",
            image_url:
              "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80",
            description: "Plumbing services",
            popular: true,
            groupId: null,
          },
          {
            id: "2",
            name_en: "Electrical",
            name_fr: "Électricité",
            name_ar: "كهرباء",
            icon: "zap",
            image_url:
              "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80",
            description: "Electrical services",
            popular: true,
            groupId: null,
          },
        ]);
      }
      if (req.method === "GET" && req.path === "/marketplace/artisans") {
        return res.json([]);
      }
      if (req.method === "GET" && req.path.startsWith("/services")) {
        return res.json([]);
      }
      // otherwise standard 503
      return res.status(503).json({
        error: "Database not ready",
        message:
          "The application is unable to connect to the database. Please check your PostgreSQL configuration in the Settings menu.",
      });
    }
    next();
  });

  app.get("/api/public/settings", async (req, res) => {
    try {
      if (!dbReady) return res.json({});
      const settings = await prisma.setting.findMany();
      const settingsMap = settings.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});

      const publicKeys = [
        "platform_name",
        "contact_email",
        "support_phone",
        "hero_slides",
        "show_stats_section",
        "show_categories_section",
        "show_features_section",
        "show_faq_section",
        "branding_logo_light",
        "branding_logo_dark",
        "branding_symbol_light",
        "branding_symbol_dark",
        "branding_favicon",
        "branding_navbar_animation",
        "branding_primary_color",
        "branding_gradient",
      ];
      const publicSettings = Object.keys(settingsMap)
        .filter((key) => publicKeys.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = settingsMap[key];
          return obj;
        }, {});

      res.json(publicSettings);
    } catch (error) {
      console.error("Failed to fetch public settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // --- API Routes ---
  app.use("/api/auth", authRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/services", serviceRoutes);
  app.use("/api/wallet", walletRoutes);
  app.use("/api/artisans", artisanRoutes);
  app.use("/api/sellers", sellerRoutes);
  app.use("/api/companies", companyRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/messages", messageRoutes);
  app.use("/api/simulation", simulationRoutes);

  // Custom auth / webhooks
  const { default: webhookRoutes } = await import("./routes/webhooks.ts");
  app.use("/api/webhooks", webhookRoutes);

  app.use("/api/marketplace", marketplaceRoutes);

  app.use(
    "/api/admin",
    (req, res, next) => {
      next();
    },
    adminRoutes,
  );

  // Notifications
  app.get(
    "/api/notifications/:userId",
    authenticateToken,
    async (req: any, res) => {
      const { userId } = req.params;
      const requesterId = req.user.id;
      const role = req.user.role;

      if (role !== "admin" && requesterId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      try {
        const notifications = await prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 20,
        });
        res.json(notifications);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch notifications" });
      }
    },
  );

  app.post(
    "/api/notifications/:id/read",
    authenticateToken,
    async (req: any, res) => {
      const { id } = req.params;
      const userId = req.user.id;

      try {
        // Verify ownership
        const notification = await prisma.notification.findUnique({
          where: { id },
        });
        if (!notification)
          return res.status(404).json({ error: "Notification not found" });

        if (notification.userId !== userId && req.user.role !== "admin") {
          return res.status(403).json({ error: "Unauthorized" });
        }

        await prisma.notification.update({
          where: { id },
          data: { isRead: true },
        });
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: "Failed to mark notification as read" });
      }
    },
  );

  // Smart Reminders Job
  const startReminderJob = () => {
    setInterval(async () => {
      if (!dbReady) return;
      try {
        const now = new Date();

        // 1. Appointment Reminders (1 hour before)
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        const oneHourAndOneMinFromNow = new Date(
          now.getTime() + 61 * 60 * 1000,
        );

        const upcomingBookings = await prisma.booking.findMany({
          where: {
            bookingStatus: BookingStatus.proposal_approved,
            scheduledAt: {
              gte: oneHourFromNow,
              lte: oneHourAndOneMinFromNow,
            },
          },
          select: {
            id: true,
            clientId: true,
            artisanId: true,
            scheduledAt: true,
            bookingStatus: true,
            client: { select: { id: true, name: true } },
            artisan: {
              select: {
                user: { select: { id: true, name: true } }
              }
            },
          },
        });

        upcomingBookings.forEach((booking) => {
          if (booking.clientId && (booking.client as any)?.id) {
            sendNotification(
              booking.clientId,
              "Appointment Reminder",
              `Your appointment with ${booking.artisan?.user?.name || 'an artisan'} is in 1 hour.`,
              "reminder",
              "/bookings",
            );
          }
          if (booking.artisan?.user?.id) {
            sendNotification(
              booking.artisan.user.id,
              "Appointment Reminder",
              `Your appointment with ${booking.client?.name || 'a client'} is in 1 hour.`,
              "reminder",
              "/bookings",
            );
          }
        });

        // 2. Urgent Request Reminders (if not accepted within 15 mins)
        const fifteenMinsAgo = new Date(now.getTime() - 15 * 60 * 1000);
        const sixteenMinsAgo = new Date(now.getTime() - 16 * 60 * 1000);

        const urgentRequests = await prisma.booking.findMany({
          where: {
            bookingStatus: BookingStatus.pending,
            isUrgent: true,
            createdAt: {
              gte: sixteenMinsAgo,
              lte: fifteenMinsAgo,
            },
          },
          select: {
            id: true,
            clientId: true,
            artisanId: true,
            isUrgent: true,
            createdAt: true,
            client: { select: { id: true, name: true } },
            artisan: {
              select: {
                user: { select: { id: true } }
              }
            },
          },
        });

        urgentRequests.forEach((request) => {
          if (request.artisan?.user?.id) {
            sendNotification(
              request.artisan.user.id,
              "Urgent Request Reminder",
              `You have an urgent request from ${request.client?.name || 'a client'} waiting for your response.`,
              "reminder",
              "/bookings",
            );
          }
        });
      } catch (error: any) {
        if (
          !error?.message?.includes("PrismaClientInitializationError") &&
          !String(error).includes("PrismaClientInitializationError")
        ) {
          console.error("Error in reminder job details:", {
            message: error.message,
            code: error.code,
            clientVersion: error.clientVersion,
            meta: error.meta,
            stack: error.stack
          });
        }
      }
    }, 60000); // Run every minute
  };

  startReminderJob();

  // Translation Routes
  app.get("/api/translations/:lang", async (req, res) => {
    const { lang } = req.params;

    try {
      const translations = await prisma.translation.findMany({
        where: { languageCode: lang },
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

  app.get("/api/languages", async (req, res) => {
    try {
      const languages = await prisma.language.findMany({
        where: { isActive: true },
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
        where: { categoryId: req.params.categoryId },
      });
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  // --- WebSockets ---

  // Secure socket connection
  io.use((socket, next) => {
    let token = "";
    const cookieHeader = socket.request.headers.cookie;
    if (cookieHeader) {
      const match = cookieHeader.match(/token=([^;]+)/);
      if (match) token = match[1];
    }
    if (!token && socket.handshake.auth?.token) {
      token = socket.handshake.auth.token;
    }
    if (!token) return next(new Error("Authentication error"));

    import("jsonwebtoken").then((jwt) => {
      jwt.default.verify(
        token,
        JWT_SECRET,
        (err, decoded) => {
          if (err) return next(new Error("Authentication error"));
          socket.data.user = decoded;
          next();
        },
      );
    });
  });

  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      // Secure: only allow user to join their own room
      socket.join(socket.data.user.id);
    });

    socket.on("update_location", async (data) => {
      const { artisanId, lat, lng } = data;
      try {
        const artisan = await prisma.artisan.findFirst({
          where: { id: artisanId, userId: socket.data.user.id },
        });

        if (!artisan) {
          console.error(
            "Unauthorized location update. Artisan does not belong to user.",
          );
          return;
        }

        await prisma.artisan.update({
          where: { id: artisan.id },
          data: { latitude: lat, longitude: lng },
        });
        // Broadcast to clients tracking this artisan
        io.emit(`location_${artisanId}`, { lat, lng });
      } catch (error) {
        console.error("Location update error:", error);
      }
    });

    socket.on("send_message", async (data) => {
      const {
        receiverId,
        content,
        type,
        audioUrl,
        imageUrl,
        latitude,
        longitude,
        orderId,
      } = data;
      const senderId = socket.data.user.id;
      
      try {
        const message = await prisma.message.create({
          data: {
            senderId,
            receiverId,
            content: content || null,
            type: type || "text",
            audioUrl: audioUrl || null,
            imageUrl: imageUrl || null,
            latitude: latitude || null,
            longitude: longitude || null,
            orderId: orderId || null,
            status: "sent",
          },
        });

        // Emit to both parties
        io.to(receiverId).emit("receive_message", message);
        io.to(senderId).emit("receive_message", message);

        // Notify receiver
        sendNotification(
          receiverId,
          "New Message",
          type === "voice"
            ? "Sent a voice message"
            : type === "image"
              ? "Sent a photo"
              : type === "location"
                ? "Shared their location"
                : content,
          "push",
          `/messages/${senderId}`,
        );
      } catch (error) {
        console.error("Send message error:", error);
      }
    });

    socket.on("typing_start", (data) => {
      const { to } = data;
      io.to(to).emit("user_typing", { from: socket.data.user.id, isTyping: true });
    });

    socket.on("typing_stop", (data) => {
      const { to } = data;
      io.to(to).emit("user_typing", { from: socket.data.user.id, isTyping: false });
    });

    socket.on("mark_delivered", async (data) => {
      if (!data) return;
      const { messageIds, senderId } = data;
      if (messageIds && messageIds.length > 0) {
        try {
          await prisma.message.updateMany({
            where: {
              id: { in: messageIds },
              receiverId: socket.data.user.id,
              status: "sent"
            },
            data: { status: "delivered" },
          });
          io.to(senderId).emit("messages_delivered", { messageIds, receiverId: socket.data.user.id });
        } catch (error) {
          console.error("Mark delivered error:", error);
        }
      }
    });

    socket.on("mark_read", async (data) => {
      if (!data) return;
      const { messageIds, readerId, senderId } = data;
      if (messageIds && messageIds.length > 0) {
        try {
          await prisma.message.updateMany({
            where: {
              id: { in: messageIds },
              receiverId: socket.data.user.id,
            },
            data: { status: "read" },
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
      // User disconnected
    });
  });

  // API Routes Error Handler
  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      console.error("API Error:", err);
      if (req.originalUrl.startsWith("/api/")) {
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        next(err);
      }
    },
  );

  // API routes not found
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: "API route not found" });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(
      express.static(distPath, {
        maxAge: "1y",
        index: false,
      }),
    );
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`Database: PostgreSQL`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
