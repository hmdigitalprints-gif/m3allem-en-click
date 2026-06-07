import { Queue, Worker, Job } from "bullmq";
import { getRedisClient, checkIsRedisActive } from "./redis.ts";

// Define strict types for job payloads
export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

export interface NotificationJobData {
  userId: string;
  title: string;
  message: string;
  type: string;
  metadata?: any;
}

export interface ImageProcessingJobData {
  filePath: string;
  type: "avatar" | "portfolio" | "proof";
  options?: {
    quality?: number;
    maxWidth?: number;
  };
}

export interface BackgroundJobData {
  action: "cleanup" | "sync_ledger" | "db_maintenance";
  payload?: any;
}

// Global active queues
let emailQueue: Queue<any> | null = null;
let notificationQueue: Queue<any> | null = null;
let imageProcessingQueue: Queue<any> | null = null;
let backgroundJobsQueue: Queue<any> | null = null;

// Track active worker handlers
const localWorkers: { [queueName: string]: Function } = {};

/**
 * Initialize BullMQ queues and workers when Redis is active, or configure fallbacks.
 */
export function initializeQueueSystem() {
  const redisConnection = getRedisClient();
  const isRedisActive = checkIsRedisActive();

  if (isRedisActive && redisConnection) {
    console.log("[QUEUES INFO] Initializing real BullMQ cluster wrappers.");
    
    // BullMQ limits concurrency to save memory
    const queueOptions = { connection: redisConnection as any };

    emailQueue = new Queue<any>("email-queue", queueOptions);
    notificationQueue = new Queue<any>("notification-queue", queueOptions);
    imageProcessingQueue = new Queue<any>("image-queue", queueOptions);
    backgroundJobsQueue = new Queue<any>("background-queue", queueOptions);

    // Boot Real BullMQ Workers
    setupBullMQWorkers(redisConnection);
  } else {
    console.log("[QUEUES INFO] Running Queue engine in asynchronous dynamic callback fallback mode.");
  }
}

/**
 * Register job processors for queues
 */
export function registerJobProcessor(
  queueName: "email-queue" | "notification-queue" | "image-queue" | "background-queue",
  handler: (data: any) => Promise<any>
) {
  localWorkers[queueName] = handler;
}

/**
 * Generic Job Addition with type checks
 */
export async function addQueueJob(
  queueName: "email-queue" | "notification-queue" | "image-queue" | "background-queue",
  jobName: string,
  data: any
): Promise<string> {
  const isRedisActive = checkIsRedisActive();

  if (isRedisActive) {
    try {
      let targetQueue: Queue | null = null;
      switch (queueName) {
        case "email-queue":
          targetQueue = emailQueue;
          break;
        case "notification-queue":
          targetQueue = notificationQueue;
          break;
        case "image-queue":
          targetQueue = imageProcessingQueue;
          break;
        case "background-queue":
          targetQueue = backgroundJobsQueue;
          break;
      }

      if (targetQueue) {
        const job = await targetQueue.add(jobName, data, {
          attempts: 3,
          backoff: { type: "exponential", delay: 1000 },
          removeOnComplete: true,
        });
        console.log(`[QUEUES] Queued job #${job.id} on queue "${queueName}".`);
        return job.id || "redis-job";
      }
    } catch (err: any) {
      console.error(`[QUEUES ERROR] Failed adding job ${jobName} to BullMQ queue:`, err.message);
    }
  }

  // Backup In-Memory Async Executor Simulation
  const randomJobId = `mem_${Math.random().toString(36).substring(7)}`;
  console.log(`[QUEUES FALLBACK] Simulating async queue job ${jobName} (#${randomJobId}) on local background worker.`);
  
  // Safe asynchronous schedule execution
  setTimeout(async () => {
    const handler = localWorkers[queueName];
    if (handler) {
      try {
        await handler(data);
        console.log(`[QUEUES FALLBACK] Successfully completed job #${randomJobId} (${jobName})`);
      } catch (jobErr: any) {
        console.error(`[QUEUES FALLBACK ERROR] Failed running job #${randomJobId}:`, jobErr.message);
      }
    } else {
      console.warn(`[QUEUES FALLBACK] No handler registered for queue "${queueName}". Job discarded.`);
    }
  }, 100);

  return randomJobId;
}

/**
 * Binds active processors directly list using BullMQ connection context
 */
function setupBullMQWorkers(redisConnection: any) {
  // 1. Email Worker
  new Worker<EmailJobData>(
    "email-queue",
    async (job: Job<EmailJobData>) => {
      const handler = localWorkers["email-queue"];
      if (handler) {
        await handler(job.data);
      }
    },
    { connection: redisConnection as any, concurrency: 5 }
  );

  // 2. Notification Worker
  new Worker<NotificationJobData>(
    "notification-queue",
    async (job: Job<NotificationJobData>) => {
      const handler = localWorkers["notification-queue"];
      if (handler) {
        await handler(job.data);
      }
    },
    { connection: redisConnection as any, concurrency: 10 }
  );

  // 3. Image Optimization Worker
  new Worker<ImageProcessingJobData>(
    "image-queue",
    async (job: Job<ImageProcessingJobData>) => {
      const handler = localWorkers["image-queue"];
      if (handler) {
        await handler(job.data);
      }
    },
    { connection: redisConnection as any, concurrency: 3 }
  );

  // 4. General Cleanup & Db Worker
  new Worker<BackgroundJobData>(
    "background-queue",
    async (job: Job<BackgroundJobData>) => {
      const handler = localWorkers["background-queue"];
      if (handler) {
        await handler(job.data);
      }
    },
    { connection: redisConnection as any, concurrency: 2 }
  );

  console.log("[QUEUES INFO] Real BullMQ Workers listener setup active and polling.");
}
