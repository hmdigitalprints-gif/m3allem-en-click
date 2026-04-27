import express from "express";
import prisma from "../lib/prisma.ts";
import { authenticateToken } from "./auth.ts";
type TransactionType = string; type TransactionStatus = string;

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

// Top up wallet
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

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } }
      });

      return tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type: 'topup',
          status: 'completed',
          description: `Top-up via ${method}`
        }
      });
    });

    res.json({ success: true, transactionId: transaction.id });
  } catch (error) {
    console.error("Topup error:", error);
    res.status(500).json({ error: "Failed to process top-up" });
  }
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
