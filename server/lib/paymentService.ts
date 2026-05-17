/**
 * paymentService.ts
 *
 * Central payment engine for M3allem platform.
 * - Handles cash, wallet, and (optionally) Stripe payments.
 * - Commission deducted automatically on order completion.
 * - Stripe is fully optional: if keys are absent the service runs without it.
 */

import prisma from "./prisma.ts";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// ─── Encryption helpers ──────────────────────────────────────────────────────
// Keys stored in DB are AES-256-GCM encrypted.
// PAYMENT_ENCRYPTION_KEY must be a 32-byte hex string in env.

const ALGO = "aes-256-gcm";

function getEncKey(): Buffer {
  const raw = process.env.PAYMENT_ENCRYPTION_KEY;
  if (!raw || raw.length < 64) {
    // Fall back to a deterministic dev key — never used in production
    return Buffer.from(
      "dev_key_32bytes_padding_xxxxxxxxxxxx".slice(0, 32),
      "utf8"
    );
  }
  return Buffer.from(raw.slice(0, 64), "hex");
}

export function encryptValue(plaintext: string): string {
  const key = getEncKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Format: iv(hex):authTag(hex):ciphertext(hex)
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptValue(encoded: string): string {
  const key = getEncKey();
  const [ivHex, authTagHex, dataHex] = encoded.split(":");
  if (!ivHex || !authTagHex || !dataHex) throw new Error("Invalid encrypted value format");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const data = Buffer.from(dataHex, "hex");
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

// ─── Stripe lazy loader ───────────────────────────────────────────────────────

let _stripe: any = null;

export async function getStripe(): Promise<any | null> {
  // Return cached instance
  if (_stripe) return _stripe;

  // Try to load key from env first, then from DB (admin-configured)
  let secretKey = process.env.STRIPE_SECRET_KEY || "";

  if (!secretKey) {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key: "stripe_secret_key" },
      });
      if (setting?.value) {
        secretKey = decryptValue(setting.value);
      }
    } catch {
      // DB not ready yet — Stripe stays disabled
    }
  }

  if (!secretKey || secretKey === "sk_test_mock") return null;

  try {
    const { default: Stripe } = await import("stripe");
    _stripe = new (Stripe as any)(secretKey, { apiVersion: "2023-10-16" });
    return _stripe;
  } catch {
    return null;
  }
}

/** Call this when admin updates Stripe keys so the cached instance is refreshed */
export function invalidateStripeCache() {
  _stripe = null;
}

export async function isStripeEnabled(): Promise<boolean> {
  // Check DB toggle first
  try {
    const toggle = await prisma.setting.findUnique({
      where: { key: "stripe_enabled" },
    });
    if (toggle?.value === "false") return false;
  } catch {
    return false;
  }
  return (await getStripe()) !== null;
}

// ─── Commission engine ────────────────────────────────────────────────────────

export interface CommissionResult {
  grossAmount: number;    // what the client pays
  commissionRate: number; // as decimal e.g. 0.10 = 10%
  commissionAmount: number;
  artisanAmount: number;  // what the artisan receives
}

export async function calculateCommission(
  bookingId: string,
  grossAmount: number
): Promise<CommissionResult> {
  // Try category-specific rate first, then global setting
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: { include: { category: true } } },
  });

  let rate = 0.10; // 10% default

  const globalSetting = await prisma.setting.findUnique({
    where: { key: "commission_rate" },
  });
  if (globalSetting?.value) rate = Number(globalSetting.value) / 100;

  const catRate = booking?.service?.category?.commissionRate;
  if (catRate !== null && catRate !== undefined) {
    rate = Number(catRate) / 100;
  }

  const commissionAmount = Math.round(grossAmount * rate * 100) / 100;
  const artisanAmount = Math.round((grossAmount - commissionAmount) * 100) / 100;

  return { grossAmount, commissionRate: rate, commissionAmount, artisanAmount };
}

// ─── Core payment actions ─────────────────────────────────────────────────────

/** Ensure a wallet exists for a user, returns the wallet record */
export async function ensureWallet(userId: string, tx?: any) {
  const db = tx ?? prisma;
  let wallet = await db.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    wallet = await db.wallet.create({ data: { userId, balance: 0 } });
  }
  return wallet;
}

/**
 * Process a CASH payment for a booking.
 * Marks booking as payment_method=cash, paymentStatus=pending (artisan confirms on-site).
 * Commission is tracked but settled when artisan confirms cash received.
 */
export async function processCashPayment(bookingId: string, clientId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking not found");
  if (booking.clientId !== clientId) throw new Error("Unauthorized");
  if (booking.paymentStatus === "paid") throw new Error("Already paid");

  const { commissionAmount, artisanAmount } = await calculateCommission(
    bookingId,
    Number(booking.price ?? 0)
  );

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentMethod: "cash",
      paymentStatus: "pending", // artisan will confirm receipt
      commissionAmount,
    },
  });

  return { method: "cash", status: "pending", commissionAmount, artisanAmount };
}

/**
 * Process a WALLET payment for a booking.
 * Deducts from client wallet, credits artisan wallet minus commission, records all transactions.
 */
export async function processWalletPayment(bookingId: string, clientId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { artisan: { include: { user: true } } },
  });
  if (!booking) throw new Error("Booking not found");
  if (booking.clientId !== clientId) throw new Error("Unauthorized");
  if (booking.paymentStatus === "paid") throw new Error("Already paid");

  const gross = Number(booking.price ?? 0);
  if (gross <= 0) throw new Error("Invalid booking price");

  const { commissionAmount, artisanAmount } = await calculateCommission(bookingId, gross);

  return await prisma.$transaction(async (tx) => {
    // 1. Deduct from client wallet
    const clientWallet = await ensureWallet(clientId, tx);
    if (Number(clientWallet.balance) < gross) throw new Error("Insufficient wallet balance");

    await tx.wallet.update({
      where: { id: clientWallet.id },
      data: { balance: { decrement: gross } },
    });

    await tx.transaction.create({
      data: {
        walletId: clientWallet.id,
        amount: gross,
        type: "payment",
        status: "completed",
        description: `Payment for booking #${bookingId}`,
        referenceId: bookingId,
      },
    });

    // 2. Credit artisan wallet (gross minus commission)
    if (booking.artisan?.user?.id) {
      const artisanWallet = await ensureWallet(booking.artisan.user.id, tx);
      await tx.wallet.update({
        where: { id: artisanWallet.id },
        data: { balance: { increment: artisanAmount } },
      });
      await tx.transaction.create({
        data: {
          walletId: artisanWallet.id,
          amount: artisanAmount,
          type: "release",
          status: "completed",
          description: `Earnings from booking #${bookingId} (after ${Math.round(
            (commissionAmount / gross) * 100
          )}% commission)`,
          referenceId: bookingId,
        },
      });
    }

    // 3. Update booking
    await tx.booking.update({
      where: { id: bookingId },
      data: {
        paymentMethod: "wallet",
        paymentStatus: "paid",
        commissionAmount,
      },
    });

    return { method: "wallet", status: "paid", commissionAmount, artisanAmount };
  });
}

/**
 * Confirm cash payment received (called by artisan after on-site collection).
 * Triggers commission deduction and artisan wallet credit.
 */
export async function confirmCashReceived(bookingId: string, artisanUserId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { artisan: { include: { user: true } } },
  });
  if (!booking) throw new Error("Booking not found");
  if (booking.artisan?.user?.id !== artisanUserId) throw new Error("Unauthorized");
  if (booking.paymentStatus !== "pending") throw new Error("Payment not in pending state");
  if (booking.paymentMethod !== "cash") throw new Error("Not a cash booking");

  const gross = Number(booking.price ?? 0);
  const { commissionAmount, artisanAmount } = await calculateCommission(bookingId, gross);

  return await prisma.$transaction(async (tx) => {
    // Credit artisan wallet
    const artisanWallet = await ensureWallet(artisanUserId, tx);
    await tx.wallet.update({
      where: { id: artisanWallet.id },
      data: { balance: { increment: artisanAmount } },
    });
    await tx.transaction.create({
      data: {
        walletId: artisanWallet.id,
        amount: artisanAmount,
        type: "release",
        status: "completed",
        description: `Cash payment confirmed for booking #${bookingId}`,
        referenceId: bookingId,
      },
    });

    await tx.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: "paid", commissionAmount },
    });

    return { confirmed: true, artisanAmount, commissionAmount };
  });
}
