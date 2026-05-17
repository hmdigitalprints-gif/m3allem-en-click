/**
 * server/routes/wallet.ts
 *
 * Wallet endpoints:
 *  GET  /api/wallet/balance             — balance + recent transactions
 *  GET  /api/wallet/stripe-status       — is Stripe available?
 *  POST /api/wallet/pay-order           — pay a booking (wallet | cash)
 *  POST /api/wallet/confirm-cash/:id    — artisan confirms cash received
 *  POST /api/wallet/withdraw            — request a withdrawal
 *  GET  /api/wallet/withdrawals         — list own withdrawal requests
 *  POST /api/wallet/topup               — Stripe top-up (only when enabled)
 *  POST /api/wallet/webhook             — Stripe webhook
 */

import express from "express";
import prisma from "../lib/prisma.ts";
import { authenticateToken } from "./auth.ts";
import { auditService } from "../services/auditService.ts";
import {
  processCashPayment,
  processWalletPayment,
  confirmCashReceived,
  ensureWallet,
  isStripeEnabled,
  getStripe,
  decryptValue,
} from "../lib/paymentService.ts";

const router = express.Router();

// ─── Balance + transaction history ───────────────────────────────────────────

router.get("/balance", authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const wallet = await ensureWallet(userId);
    const transactions = await prisma.transaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ ...wallet, transactions });
  } catch (error) {
    console.error("Fetch wallet error:", error);
    res.status(500).json({ error: "Failed to fetch wallet" });
  }
});

// ─── Stripe availability (safe for frontend) ──────────────────────────────────

router.get("/stripe-status", async (_req, res) => {
  try {
    const enabled = await isStripeEnabled();
    res.json({ stripeEnabled: enabled });
  } catch {
    res.json({ stripeEnabled: false });
  }
});

// ─── Pay for a booking ────────────────────────────────────────────────────────

router.post("/pay-order", authenticateToken, async (req: any, res) => {
  try {
    const { bookingId, method } = req.body;
    const clientId = req.user.id;

    if (!bookingId) return res.status(400).json({ error: "bookingId is required" });
    if (!["wallet", "cash"].includes(method)) {
      return res.status(400).json({ error: "Method must be 'wallet' or 'cash'" });
    }

    const result =
      method === "cash"
        ? await processCashPayment(bookingId, clientId)
        : await processWalletPayment(bookingId, clientId);

    await auditService.log(clientId, "PAYMENT_PROCESSED", "booking", bookingId, {
      method,
      ...result,
    });

    res.json({ success: true, ...result });
  } catch (error: any) {
    const msg = error?.message || "Failed to process payment";
    const clientError = ["Insufficient wallet balance", "Already paid", "Unauthorized"].includes(msg);
    console.error("Payment error:", error);
    res.status(clientError ? 400 : 500).json({ error: msg });
  }
});

// ─── Artisan confirms cash received ──────────────────────────────────────────

router.post("/confirm-cash/:bookingId", authenticateToken, async (req: any, res) => {
  try {
    const { bookingId } = req.params;
    const result = await confirmCashReceived(bookingId, req.user.id);
    await auditService.log(req.user.id, "CASH_CONFIRMED", "booking", bookingId, result);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ error: error?.message || "Failed to confirm cash" });
  }
});

// ─── Withdrawal request ───────────────────────────────────────────────────────

router.post("/withdraw", authenticateToken, async (req: any, res) => {
  try {
    const { amount, method, accountDetails } = req.body;
    const userId = req.user.id;

    if (!amount || Number(amount) <= 0) return res.status(400).json({ error: "Invalid amount" });
    if (!method) return res.status(400).json({ error: "Withdrawal method required" });

    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet || Number(wallet.balance) < Number(amount)) throw new Error("Insufficient funds");

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: Number(amount) } },
      });

      const txRecord = await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount: Number(amount),
          type: "withdrawal",
          status: "pending",
          description: `Withdrawal request via ${method}`,
        },
      });

      return (tx as any).withdrawalRequest.create({
        data: {
          userId,
          amount: Number(amount),
          method,
          accountDetails: accountDetails ? JSON.stringify(accountDetails) : null,
          status: "pending",
          transactionId: txRecord.id,
        },
      });
    });

    await auditService.log(userId, "WITHDRAWAL_REQUESTED", "wallet", null, { amount, method });
    res.json({ success: true, requestId: result.id, status: "pending" });
  } catch (error: any) {
    const msg = error?.message || "Failed to request withdrawal";
    console.error("Withdrawal error:", error);
    res.status(msg === "Insufficient funds" ? 400 : 500).json({ error: msg });
  }
});

// ─── List own withdrawal requests ────────────────────────────────────────────

router.get("/withdrawals", authenticateToken, async (req: any, res) => {
  try {
    const requests = await (prisma as any).withdrawalRequest.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    res.json(requests);
  } catch (error) {
    console.error("Fetch withdrawals error:", error);
    res.status(500).json({ error: "Failed to fetch withdrawal requests" });
  }
});

// ─── Top-up via Stripe (disabled when no keys configured) ────────────────────

router.post("/topup", authenticateToken, async (req: any, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || Number(amount) <= 0) return res.status(400).json({ error: "Invalid amount" });

    if (!(await isStripeEnabled())) {
      return res.status(503).json({
        error: "Stripe disabled by admin",
        message: "Online top-up is currently unavailable. Please contact support.",
      });
    }

    const stripe = await getStripe();
    if (!stripe) return res.status(503).json({ error: "Stripe not configured" });

    const wallet = await ensureWallet(userId);
    const txRecord = await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        amount: Number(amount),
        type: "topup",
        status: "pending",
        description: "Top-up via Stripe",
      },
    });

    const pi = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100),
      currency: "mad",
      metadata: { transactionId: txRecord.id, userId },
    });

    res.json({ success: true, transactionId: txRecord.id, clientSecret: pi.client_secret });
  } catch (error) {
    console.error("Top-up error:", error);
    res.status(500).json({ error: "Failed to initiate top-up" });
  }
});

// ─── Stripe webhook ───────────────────────────────────────────────────────────

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const stripe = await getStripe();
  if (!stripe) return res.status(503).json({ error: "Stripe disabled" });

  let webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  if (!webhookSecret) {
    try {
      const setting = await prisma.setting.findUnique({ where: { key: "stripe_webhook_secret" } });
      if (setting?.value) webhookSecret = decryptValue(setting.value);
    } catch { /* ignore */ }
  }

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"] as string, webhookSecret);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as any;
    const transactionId = pi.metadata?.transactionId;
    if (transactionId) {
      await prisma.$transaction(async (tx) => {
        const txRecord = await tx.transaction.findUnique({ where: { id: transactionId } });
        if (txRecord?.status === "pending") {
          await tx.transaction.update({ where: { id: transactionId }, data: { status: "completed" } });
          if (txRecord.walletId) {
            await tx.wallet.update({
              where: { id: txRecord.walletId },
              data: { balance: { increment: Number(txRecord.amount) } },
            });
          }
        }
      });
    }
  }

  res.json({ received: true });
});

export default router;
