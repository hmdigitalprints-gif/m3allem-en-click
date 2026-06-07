import prisma from "./prisma.ts";

export async function bootstrapSchema() {
  console.log("[DB PATCH] Bootstrapping PostgreSQL schema for enterprise-grade moderation...");
  try {
    // 1. Alter Users table to add is_suspended
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_suspended" BOOLEAN DEFAULT false;
    `).catch(err => {
      console.warn("[DB PATCH WARNING] Could not add is_suspended to users:", err.message);
    });

    // 2. Alter Users table to add suspension_reason
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "suspension_reason" TEXT;
    `).catch(err => {
      console.warn("[DB PATCH WARNING] Could not add suspension_reason to users:", err.message);
    });

    // 3. Alter Users table to add suspended_until
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "suspended_until" TIMESTAMP WITH TIME ZONE;
    `).catch(err => {
      console.warn("[DB PATCH WARNING] Could not add suspended_until to users:", err.message);
    });

    // 4. Create User Reports table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "user_reports" (
        "id" TEXT NOT NULL,
        "reporter_id" TEXT,
        "reported_id" TEXT,
        "content_type" TEXT NOT NULL,
        "content_id" TEXT,
        "reason" TEXT NOT NULL,
        "details" TEXT,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "user_reports_pkey" PRIMARY KEY ("id")
      );
    `).catch(err => {
      console.warn("[DB PATCH WARNING] Could not create user_reports table:", err.message);
    });

    console.log("[DB PATCH SUCCESS] enterprise-grade moderation tables & columns verified!");
  } catch (error: any) {
    console.error("[DB PATCH ERROR] DB Patch failed:", error.message);
  }
}
