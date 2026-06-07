import { registerJobProcessor, initializeQueueSystem, addQueueJob } from "../lib/queues.ts";
import { OtpService } from "./otpService.ts";
import prisma from "../lib/prisma.ts";
import sharp from "sharp";
import fs from "fs";
import path from "path";

/**
 * Configure processors for all background queues.
 */
export function setupQueueProcessors() {
  console.log("[QUEUES RUNNER] Registering standard job handlers.");

  // 1. Email Processing Queue Handler
  registerJobProcessor("email-queue", async (data: { to: string; subject: string; body: string; html?: string }) => {
    console.log(`[QUEUES JOB] Sending Async Email to ${data.to}: "${data.subject}"`);
    try {
      // Re-use lazy initialized transporters inside OtpService
      await OtpService.sendNotificationEmail(data.to, data.subject, data.body);
      console.log(`[QUEUES JOB SUCCESS] Email sent to ${data.to}`);
    } catch (err: any) {
      console.error(`[QUEUES JOB FAILURE] Email to ${data.to} failed:`, err.message);
      throw err; // Signal BullMQ client for safe retries
    }
  });

  // 2. Notification System Queue Handler
  registerJobProcessor("notification-queue", async (data: { userId: string; title: string; message: string; type: string }) => {
    console.log(`[QUEUES JOB] Despatching System Notification to ${data.userId}`);
    try {
      // Connects directly to DB & Sockets (Push, banner updates)
      await prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type as any,
          link: null
        }
      });
      console.log(`[QUEUES JOB SUCCESS] Notification logged for ${data.userId}`);
    } catch (err: any) {
      console.error(`[QUEUES JOB FAILURE] Notification failed for ${data.userId}:`, err.message);
      throw err;
    }
  });

  // 3. Sharp Image Processor Queue Handler
  registerJobProcessor("image-queue", async (data: { filePath: string; type: string; options?: any }) => {
    const absolutePath = path.isAbsolute(data.filePath) 
      ? data.filePath 
      : path.join(process.cwd(), data.filePath);

    console.log(`[QUEUES JOB] Running Sharp Core Compression on file: "${absolutePath}"`);

    if (!fs.existsSync(absolutePath)) {
      console.warn(`[QUEUES JOB] File not found, skipping optimization: ${absolutePath}`);
      return;
    }

    try {
      const originalBuffer = fs.readFileSync(absolutePath);
      
      // Keep only high-entropy WebP optimization with low-latency compression
      const resized = await sharp(originalBuffer)
        .rotate()
        .resize({
          width: data.type === "avatar" ? 512 : 2048,
          height: data.type === "avatar" ? 512 : 2048,
          fit: sharp.fit.inside,
          withoutEnlargement: true
        })
        .webp({ quality: 75, effort: 4 })
        .toBuffer();

      // Write safely on replace
      fs.writeFileSync(absolutePath, resized);
      console.log(`[QUEUES JOB SUCCESS] Image optimized: ${absolutePath} (Saved approximately ~40-70% bandwidth)`);
    } catch (err: any) {
      console.error(`[QUEUES JOB FAILURE] sharp error processing "${absolutePath}":`, err.message);
      throw err;
    }
  });

  // 4. Background System Maintenance Queue Handler
  registerJobProcessor("background-queue", async (data: { action: string; payload?: any }) => {
    console.log(`[QUEUES JOB] Running Background maintenance cron: [${data.action}]`);
    try {
      if (data.action === "cleanup") {
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        // Delete expired/unverified token records safely
        const deletedNotifications = await prisma.notification.deleteMany({
          where: {
            createdAt: { lt: fiveDaysAgo },
            isRead: true
          }
        });
        
        console.log(`[QUEUES JOB SUCCESS] Standard Db scrubbing done. Purged ${deletedNotifications.count} read notifications.`);
      }
    } catch (err: any) {
      console.error(`[QUEUES JOB FAILURE] Maintenance failed:`, err.message);
      throw err;
    }
  });

  // Initialize Queues connections
  initializeQueueSystem();
}

/**
 * Convenience methods to add jobs quickly from anywhere in the app
 */
export async function queueEmail(to: string, subject: string, body: string, html?: string): Promise<string> {
  return addQueueJob("email-queue", "send-email", { to, subject, body, html });
}

export async function queueNotification(userId: string, title: string, message: string, type: "push" | "email" | "reminder"): Promise<string> {
  return addQueueJob("notification-queue", "dispatch-notif", { userId, title, message, type });
}

export async function queueImageOptimization(filePath: string, type: "avatar" | "portfolio" | "proof"): Promise<string> {
  return addQueueJob("image-queue", "optimize-image", { filePath, type });
}

export async function queueMaintenanceCleanups(): Promise<string> {
  return addQueueJob("background-queue", "cron-cleanup", { action: "cleanup" });
}
