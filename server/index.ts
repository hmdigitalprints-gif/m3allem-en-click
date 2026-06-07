import "dotenv/config";
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
import escrowRoutes from "./routes/escrow.ts";
import sellerRoutes from "./routes/sellers.ts";
import marketplaceRoutes from "./routes/marketplace.ts";
import companyRoutes from "./routes/companies.ts";
import aiRoutes from "./routes/ai.ts";
import messageRoutes from "./routes/messages.ts";
import kycRoutes from "./routes/kyc.ts";
import { BlockService } from "./services/blockService.ts";
import { bootstrapSchema } from "./lib/dbPatch.ts";
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
import { getCache, setCache } from "./lib/redis.ts";
import { setupQueueProcessors } from "./services/queueRunner.ts";
import pino from "pino";
import pinoHttp from "pino-http";
import * as Sentry from "@sentry/node";
import compression from "compression";
import {
  ensureUploadDirectories,
  ALLOWED_MIME_TYPES,
  uploadRateLimiter,
  scanFileForMalware,
  optimizeAndFormatImage,
  generateRandomFileName,
  saveUploadedFileLocally
} from "./lib/secureUpload.ts";
import { csrfProtection, getCsrfTokenRoute } from "./lib/csrf.ts";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});

Sentry.init({
  dsn: process.env.SENTRY_DSN || "",
  tracesSampleRate: 1.0,
});

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is missing.");
}
const JWT_SECRET = process.env.JWT_SECRET;

async function startServer() {
  // Initialize BullMQ jobs/queues and system events
  setupQueueProcessors();
  await bootstrapSchema();

  const app = express();
  app.set("trust proxy", 1);

  // SECURE CORS WHITELIST (No Wildcards allowed to prevent cross-origin abuse and credential hijacking)
  const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "https://m3allem.ma",
    "https://www.m3allem.ma",
  ];

  if (process.env.APP_URL) {
    allowedOrigins.push(process.env.APP_URL);
  }

  const isOriginAllowed = (origin: string | undefined): boolean => {
    if (!origin) return true; // Allow non-browser requests (e.g. server-to-server or tools with omit origin)
    
    // Explicit whitelist check
    if (allowedOrigins.includes(origin)) {
      return true;
    }

    // Dynamic AI Studio developer and shared preview environments matching cloud run pattern
    const isAiStudioPreview = /^https:\/\/ais-(dev|pre)-[a-z0-9]+-\d+\.[a-z0-9-]+\.run\.app$/.test(origin);
    if (isAiStudioPreview) {
      return true;
    }

    return false;
  };

  app.use(cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy blocked request from origin: ${origin}`));
      }
    },
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
      origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
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

  // CSRF Protection Middleware
  app.get("/api/csrf-token", getCsrfTokenRoute);
  app.use("/api/", csrfProtection);

  // Language Detection Middleware
  const detectLanguage = async (req: any, res: any, next: any) => {
    try {
      // Fast path for non-API requests (static assets, Vite files, client pages) to prevent database call blockages
      if (!req.url.startsWith("/api/")) {
        req.lang = "en";
        req.isRTL = false;
        return next();
      }

      const langCode = await getPreferredLanguage(req);

      // Avoid Prisma calls if DB is not ready to prevent timeouts
      if (!dbReady) {
        req.lang = langCode || "en";
        req.isRTL = req.lang === "ar";
        return next();
      }

      const cacheKey = `lang_${langCode}`;
      const cachedResult = await getCache<any>(cacheKey);

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
        const defaultLangSettingCache = await getCache<string>(
          "default_language_setting",
        );
        if (defaultLangSettingCache !== undefined) {
          fallbackCode = defaultLangSettingCache as string;
        } else {
          const defaultLangSetting = await prisma.setting.findUnique({
            where: { key: "default_language" },
          });
          fallbackCode = defaultLangSetting?.value || "en";
          await setCache("default_language_setting", fallbackCode, 300);
        }

        const fallbackCacheKey = `lang_data_${fallbackCode}`;
        let fallback = await getCache<any>(fallbackCacheKey);
        if (fallback === undefined) {
          fallback = await prisma.language.findUnique({
            where: { code: fallbackCode },
          });
          await setCache(fallbackCacheKey, fallback || null, 300);
        }

        finalLang = fallback?.code || "en";
        finalIsRTL = fallback?.isRtl === true;
      } else {
        finalLang = lang.code;
        finalIsRTL = lang.isRtl === true;
      }

      await setCache(cacheKey, { lang: finalLang, isRTL: finalIsRTL }, 3600);
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

  // Ensure the public/private structure is fully built and ready
  ensureUploadDirectories();

  // Serve only uploads/public statically (Safe, public-facing assets)
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
    express.static(path.join(process.cwd(), "uploads", "public")),
  );

  // Secure API endpoint for private files (authenticated, checked bounds)
  app.get("/api/uploads/private/:filename", authenticateToken, async (req: any, res) => {
    try {
      const { filename } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Prevent directory traversal attacks
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return res.status(400).json({ error: "Invalid file request" });
      }

      const privatePath = path.join(process.cwd(), "uploads", "private", filename);

      // Verify actual presence
      if (!fs.existsSync(privatePath)) {
        return res.status(404).json({ error: "File not found" });
      }

      // 1. Admin overrides
      if (userRole === "ADMIN" || userRole === "admin") {
        res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Disposition", "attachment; filename=" + JSON.stringify(filename));
        return res.sendFile(privatePath);
      }

      // 2. Owner of matching KycVerification records
      const kyc = await prisma.kycVerification.findFirst({
        where: {
          userId: userId,
          OR: [
            { documentUrl: { contains: filename } },
            { idDocumentUrl: { contains: filename } },
            { companyRegistration: { contains: filename } }
          ]
        }
      });

      if (kyc) {
        res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Disposition", "attachment; filename=" + JSON.stringify(filename));
        return res.sendFile(privatePath);
      }

      // 3. Owner of matching ArtisanVerification records
      const verification = await prisma.artisanVerification.findFirst({
        where: {
          userId: userId,
          OR: [
            { idDocument: { contains: filename } },
            { professionalLicense: { contains: filename } }
          ]
        }
      });

      if (verification) {
        res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Disposition", "attachment; filename=" + JSON.stringify(filename));
        return res.sendFile(privatePath);
      }

      // 3. User inside target Booking (client or artisan) associated with file
      const booking = await prisma.booking.findFirst({
        where: {
          OR: [
            { clientId: userId },
            { artisan: { userId: userId } }
          ],
          attachments: { not: null }
        }
      });

      if (booking) {
        const attachmentsString = String(booking.attachments || "");
        if (attachmentsString.includes(filename)) {
          res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
          res.setHeader("X-Content-Type-Options", "nosniff");
          res.setHeader("Content-Disposition", "attachment; filename=" + JSON.stringify(filename));
          return res.sendFile(privatePath);
        }
      }

      return res.status(403).json({ error: "Unauthorized access: You do not have permission to view this file" });
    } catch (unauthErr) {
      console.error("Private secure download error:", unauthErr);
      res.status(500).json({ error: "An error occurred retrieving the secure document" });
    }
  });

  // Security-hardened Upload endpoint
  app.post("/api/upload", authenticateToken, uploadRateLimiter, async (req: any, res) => {
    try {
      const { file, type } = req.body; // type: image, audio, doc, etc.
      const userId = req.user.id;

      if (!file) {
        return res.status(400).json({ error: "No file provided" });
      }

      // Extract and validate base64 scheme
      const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Invalid file coding (expected base64 URI scheme)" });
      }

      const mimeType = matches[1];
      const base64Data = matches[2];

      // Validate allowed mime list strictly
      const allowedMimes = Object.keys(ALLOWED_MIME_TYPES);
      if (!allowedMimes.includes(mimeType)) {
        return res.status(400).json({ error: "Disallowed or unsafe file type" });
      }

      const buffer = Buffer.from(base64Data, "base64");

      // Verify file size limit based on type: 5MB for PDFs, 3MB for images/audio
      const isPdf = mimeType === "application/pdf";
      const maxSize = isPdf ? 5 * 1024 * 1024 : 3 * 1024 * 1024;
      if (buffer.length > maxSize) {
        return res.status(400).json({ 
          error: `File size limit exceeded. Max size allowed is ${isPdf ? "5MB" : "3MB"}` 
        });
      }

      // Generate secure base file name to pre-scan
      const tempExt = mimeType.split("/")[1]?.split("+")[0] || "bin";
      const unscannedFilename = `unscanned-${uuidv4()}.${tempExt}`;

      // Run advanced virus and signature heuristic scan
      const malwareScan = scanFileForMalware(buffer, mimeType, unscannedFilename);
      if (!malwareScan.secure) {
        console.warn(`[SECURITY WARN] Blocked malware upload from user ${userId}: ${malwareScan.reason}`);
        return res.status(422).json({ error: `Security check block: ${malwareScan.reason}` });
      }

      let finalBuffer = buffer;
      let finalExt = tempExt;

      if (mimeType === "image/svg+xml") {
        // Double check SVG markup validity
        const svgText = buffer.toString("utf8");
        if (!svgText.includes("<svg") && !svgText.includes("<SVG")) {
          return res.status(400).json({ error: "Corrupted or invalid visual template" });
        }
        finalExt = "svg";
      } else {
        // Enforce magic byte check using file-type package to avoid falsified mime declarations
        const { fileTypeFromBuffer: getFileType } = await import("file-type");
        const actualType = await getFileType(buffer);
        if (!actualType || !allowedMimes.includes(actualType.mime) || actualType.mime !== mimeType) {
          return res.status(400).json({ error: "Tampered or misidentified file structure" });
        }

        // Run metadata removal & conversion to WebP for standard raster images
        if (actualType.mime.startsWith("image/") && actualType.mime !== "image/gif") {
          try {
            const optimized = await optimizeAndFormatImage(buffer, actualType.mime);
            finalBuffer = optimized.finalBuffer;
            finalExt = optimized.extension;
          } catch (optError) {
            console.error("Image optimization failed:", optError);
            return res.status(400).json({ error: "Failed to optimize image payload smoothly" });
          }
        } else if (actualType.mime === "image/gif") {
          const optimized = await optimizeAndFormatImage(buffer, actualType.mime);
          finalBuffer = optimized.finalBuffer;
          finalExt = optimized.extension;
        } else {
          finalExt = actualType.ext;
        }
      }

      // Generate fully high-entropy random filename with secure suffix
      const secureFilename = generateRandomFileName(finalExt);

      // Group into Private directory if it is a sensitive verification document (PDF)
      const isPrivateFile = isPdf || type === "verification" || type === "doc";

      // Supabase upload sync if active
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
      const supabaseBucket = process.env.SUPABASE_BUCKET || "uploads";

      if (supabaseUrl && (supabaseServiceKey || supabaseAnonKey)) {
        try {
          const { createClient } = await import("@supabase/supabase-js");
          const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);
          
          const targetPath = isPrivateFile ? `private/${secureFilename}` : `public/${secureFilename}`;
          const { error: uploadError } = await supabase.storage
            .from(supabaseBucket)
            .upload(targetPath, finalBuffer, {
              contentType: mimeType === "image/svg+xml" ? "image/svg+xml" : (mimeType.startsWith("image/") ? "image/webp" : mimeType),
              upsert: true
            });
            
          if (!uploadError) {
            if (isPrivateFile) {
              // Create dynamic secure url proxy pointing to our Express service
              return res.json({ url: `/api/uploads/private/${secureFilename}` });
            } else {
              const { data: publicData } = supabase.storage.from(supabaseBucket).getPublicUrl(targetPath);
              if (publicData?.publicUrl) {
                return res.json({ url: publicData.publicUrl });
              }
            }
          } else {
            console.error("Supabase Storage integration issues, falling back to local system:", uploadError);
          }
        } catch (supabaseErr) {
          console.error("Supabase execution failed, falling back to local system:", supabaseErr);
        }
      }

      // Store in secure folder structure on disk
      const storageResult = saveUploadedFileLocally(finalBuffer, secureFilename, isPrivateFile);
      
      res.json({ url: storageResult.relativeUrl });
    } catch (uploadFail) {
      console.error("File upload operation failed:", uploadFail);
      res.status(500).json({ error: "An unexpected error occurred during uploading." });
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
  app.use("/api/escrow", escrowRoutes);
  app.use("/api/artisans", artisanRoutes);
  app.use("/api/sellers", sellerRoutes);
  app.use("/api/companies", companyRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/messages", messageRoutes);
  app.use("/api/kyc", kycRoutes);
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
      const cacheKey = "api_categories_all";
      const cached = await getCache<any[]>(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const categories = await prisma.category.findMany();
      await setCache(cacheKey, categories, 3600); // 1 hour cache
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
        fileUrl,
        fileName,
        fileSize,
        latitude,
        longitude,
        orderId,
      } = data;
      const senderId = socket.data.user.id;
      
      try {
        // Secure check: Verify block status before sending or accepting the message
        const blockStatus = await BlockService.getPreferences(senderId, receiverId);
        if (blockStatus.isBlocked) {
          socket.emit("error", { message: "Messaging is blocked between you and this user." });
          return;
        }

        const message = await prisma.message.create({
          data: {
            senderId,
            receiverId,
            content: content || null,
            type: type || "text",
            audioUrl: audioUrl || null,
            imageUrl: imageUrl || null,
            fileUrl: fileUrl || null,
            fileName: fileName || null,
            fileSize: fileSize || null,
            latitude: latitude || null,
            longitude: longitude || null,
            orderId: orderId || null,
            status: "sent",
          },
        });

        // Emit to both parties (if receiver is online)
        io.to(receiverId).emit("receive_message", message);
        io.to(senderId).emit("receive_message", message);

        // Only trigger push notifications if recipient has NOT muted the sender
        if (!blockStatus.isMutedByReceiver) {
          sendNotification(
            receiverId,
            "New Message",
            type === "voice"
              ? "Sent a voice message"
              : type === "image"
                ? "Sent a photo"
                : type === "file"
                  ? `Sent an attachment: ${fileName || "File"}`
                  : type === "location"
                    ? "Shared their location"
                    : content,
            "push",
            `/messages/${senderId}`,
          );
        }
      } catch (error) {
        console.error("Send message error:", error);
      }
    });

    socket.on("typing_start", async (data) => {
      const { to } = data;
      const senderId = socket.data.user.id;
      // Do not broadcast typing cues if blocked
      const blocked = await BlockService.isBlocked(senderId, to);
      if (!blocked) {
        io.to(to).emit("user_typing", { from: senderId, isTyping: true });
      }
    });

    socket.on("typing_stop", async (data) => {
      const { to } = data;
      const senderId = socket.data.user.id;
      const blocked = await BlockService.isBlocked(senderId, to);
      if (!blocked) {
        io.to(to).emit("user_typing", { from: senderId, isTyping: false });
      }
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
