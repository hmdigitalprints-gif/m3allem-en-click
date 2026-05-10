import express from "express";
import prisma from "../lib/prisma.ts";
import { authenticateToken } from "./auth.ts";
import { TransactionType, TransactionStatus } from "@prisma/client";

const router = express.Router();

// Get wallet balance and transactions
router.get("/balance", authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });
    
    if (!wallet) {
      // Create wallet if it doesn't exist
      wallet = await prisma.wallet.create({
        data: { userId, balance: 0 },
        include: { transactions: true }
      });
    }

    res.json(wallet);
  } catch (error) {
    console.error("Fetch wallet error:", error);
    res.status(500).json({ error: "Failed to fetch wallet" });
  }
});

// Top up wallet (Initiate Payment)
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', { apiVersion: '2023-10-16' as any });

router.post("/topup", authenticateToken, async (req: any, res) => {
  try {
    const { amount, method } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const transaction = await prisma.$transaction(async (tx) => {
      let wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        wallet = await tx.wallet.create({ data: { userId, balance: 0 } });
      }

      // Create a pending transaction
      return tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type: 'topup',
          status: 'pending',
          description: `Top-up via ${method}`
        }
      });
    });

    // Create Stripe PaymentIntent
    let clientSecret = "mock_client_secret";
    if (process.env.STRIPE_SECRET_KEY) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // convert MAD/currency to cents
        currency: 'mad',
        metadata: {
          transactionId: transaction.id,
          userId: userId
        }
      });
      clientSecret = paymentIntent.client_secret || "";
    }

    res.json({ success: true, transactionId: transaction.id, clientSecret, status: 'pending' });
  } catch (error) {
    console.error("Topup error:", error);
    res.status(500).json({ error: "Failed to process top-up" });
  }
});

// Stripe Webhook handler
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig as string, 
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock'
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as any;
    const transactionId = paymentIntent.metadata.transactionId;
    
    if (transactionId) {
      await prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.findUnique({ where: { id: transactionId } });
        if (transaction && transaction.status === 'pending') {
          await tx.transaction.update({
            where: { id: transactionId },
            data: { status: 'completed' }
          });
          await tx.wallet.update({
            where: { id: transaction.walletId! }, // ensure walletId exists
            data: { balance: { increment: transaction.amount } }
          });
        }
      });
    }
  }

  res.send();
});

// Withdraw funds
router.post("/withdraw", authenticateToken, async (req: any, res) => {
  try {
    const { amount, method } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const transaction = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet || wallet.balance < amount) {
        throw new Error("Insufficient funds");
      }

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } }
      });

      return tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type: 'withdrawal',
          status: 'pending',
          description: `Withdrawal via ${method}`
        }
      });
    });

    res.json({ success: true, transactionId: transaction.id });
  } catch (error) {
    if (error instanceof Error && error.message === "Insufficient funds") {
      return res.status(400).json({ error: error.message });
    }
    console.error("Withdrawal error:", error);
    res.status(500).json({ error: "Failed to process withdrawal" });
  }
});

// Pay for an order
router.post("/pay-order", authenticateToken, async (req: any, res) => {
  try {
    const { orderId, method } = req.body;
    const userId = req.user.id;

    if (method !== 'wallet') {
      return res.status(400).json({ error: "Only wallet payment supported via this endpoint" });
    }

    const booking = await prisma.booking.findUnique({ where: { id: orderId } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.clientId !== userId) return res.status(403).json({ error: "Unauthorized" });

    const transaction = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet || wallet.balance < (booking.price || 0)) {
        throw new Error("Insufficient wallet balance");
      }

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: booking.price || 0 } }
      });

      const t = await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount: booking.price || 0,
          type: 'payment',
          status: 'completed',
          description: `Payment for booking #${orderId}`,
          referenceId: orderId
        }
      });

      await tx.booking.update({
        where: { id: orderId },
        data: { paymentStatus: 'paid', paymentMethod: 'wallet' }
      });

      return t;
    });

    res.json({ success: true, transactionId: transaction.id });
  } catch (error) {
    if (error instanceof Error && error.message === "Insufficient wallet balance") {
      return res.status(400).json({ error: error.message });
    }
    console.error("Payment error:", error);
    res.status(500).json({ error: "Failed to process payment" });
  }
});

export default router;
