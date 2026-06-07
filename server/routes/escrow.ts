import express from "express";
import { authenticateToken } from "./auth.ts";
import { EscrowService, EscrowResolution } from "../services/escrowService.ts";
import prisma from "../lib/prisma.ts";
import { bookingIpLimiter, bookingUserLimiter } from "../lib/rateLimiters.ts";

const router = express.Router();

/**
 * Helper to check if current logged-in user is an administrator
 */
const isAdminCheck = async (userId: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  return user?.role === "admin";
};

/**
 * POST /api/escrow/pay
 * Client funds the escrow of a booking using their available wallet balance.
 */
router.post("/pay", authenticateToken, bookingIpLimiter, bookingUserLimiter, async (req: any, res) => {
  try {
    const { bookingId } = req.body;
    const clientId = req.user.id;

    if (!bookingId) {
      return res.status(400).json({ error: "Missing required parameter: bookingId" });
    }

    const receipt = await EscrowService.holdInEscrow(bookingId, clientId);
    res.status(200).json({
      success: true,
      message: "Escrow funds locked successfully.",
      data: receipt
    });
  } catch (error: any) {
    console.error("[ESCROW ROUTE ERROR] /pay:", error.message);
    res.status(400).json({ error: error.message || "Failed to initiate escrow hold." });
  }
});

/**
 * POST /api/escrow/release
 * Client releases escrowed funds to the artisan upon service completion.
 */
router.post("/release", authenticateToken, async (req: any, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user.id;

    if (!bookingId) {
      return res.status(400).json({ error: "Missing required parameter: bookingId" });
    }

    const isAdmin = await isAdminCheck(userId);
    const result = await EscrowService.releaseFromEscrow(bookingId, userId, isAdmin);

    res.status(200).json({
      success: true,
      message: "Escrow funds released to artisan wallet successfully.",
      data: result
    });
  } catch (error: any) {
    console.error("[ESCROW ROUTE ERROR] /release:", error.message);
    res.status(400).json({ error: error.message || "Failed to release escrow." });
  }
});

/**
 * POST /api/escrow/refund
 * Request refund of held escrow funds due to booking cancellation or mutually-agreed termination.
 */
router.post("/refund", authenticateToken, async (req: any, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user.id;

    if (!bookingId) {
      return res.status(400).json({ error: "Missing required parameter: bookingId" });
    }

    const isAdmin = await isAdminCheck(userId);
    const result = await EscrowService.refundEscrow(bookingId, userId, isAdmin);

    res.status(200).json({
      success: true,
      message: "Escrow funds refunded to client wallet successfully.",
      data: result
    });
  } catch (error: any) {
    console.error("[ESCROW ROUTE ERROR] /refund:", error.message);
    res.status(400).json({ error: error.message || "Failed to execute refund." });
  }
});

/**
 * POST /api/escrow/disputes/:id/resolve
 * Admin mediation endpoint: resolves order dispute and releases/refunds escrow assets accordingly.
 */
router.post("/disputes/:id/resolve", authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { resolution, notes } = req.body;
    const adminId = req.user.id;

    const isAdmin = await isAdminCheck(adminId);
    if (!isAdmin) {
      return res.status(403).json({ error: "Forbidden: Access restricted to platform Administrators." });
    }

    if (!resolution || !["refund_client", "release_artisan"].includes(resolution)) {
      return res.status(400).json({ error: "Invalid resolution. Must be 'refund_client' or 'release_artisan'." });
    }

    if (!notes || notes.trim().length === 0) {
      return res.status(400).json({ error: "Please provide resolution notes for the ledger and audit trailing." });
    }

    const result = await EscrowService.resolveDisputeWithEscrow(id, resolution as EscrowResolution, adminId, notes);

    res.status(200).json({
      success: true,
      message: "Dispute mediated, escrow balance dispersed successfully.",
      data: result
    });
  } catch (error: any) {
    console.error("[ESCROW ROUTE ERROR] /disputes/resolve:", error.message);
    res.status(400).json({ error: error.message || "Failed to arbitrate dispute." });
  }
});

/**
 * GET /api/escrow/booking/:bookingId/status
 * Fetches the current escrow state machine and tracking logs for a specific booking.
 */
router.get("/booking/:bookingId/status", authenticateToken, async (req: any, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: { select: { id: true, name: true, email: true } },
        artisan: { include: { user: { select: { id: true, name: true } } } }
      }
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const isAdmin = await isAdminCheck(userId);
    const isClient = booking.clientId === userId;
    const isArtisan = booking.artisan?.user?.id === userId;

    if (!isAdmin && !isClient && !isArtisan) {
      return res.status(403).json({ error: "Unauthorized to inspect escrow data for this booking." });
    }

    // Retrieve ledger entries matching this booking ID
    const ledgerTransactions = await prisma.transaction.findMany({
      where: { referenceId: bookingId },
      orderBy: { createdAt: "desc" }
    });

    const flowState = {
      bookingId: booking.id,
      currentBookingStatus: booking.bookingStatus,
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      totalPrice: booking.price,
      estimatedArtisanShare: booking.artisanAmount || null,
      estimatedCommissionShare: booking.commissionAmount || null,
      partyDetails: {
        clientName: booking.client?.name,
        artisanName: booking.artisan?.user?.name,
      },
      hasActiveEscrow: booking.paymentStatus === "escrow",
      ledgerHistory: ledgerTransactions
    };

    res.status(200).json(flowState);
  } catch (error: any) {
    console.error("[ESCROW ROUTE ERROR] /status:", error.message);
    res.status(500).json({ error: "Failed to gather escrow details." });
  }
});

export default router;
