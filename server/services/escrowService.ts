import prisma from "../lib/prisma.ts";
import { Decimal } from "@prisma/client/runtime/library";
import { t } from "../lib/i18n.ts";
import { sendNotification } from "./notificationService.ts";

export type EscrowResolution = "refund_client" | "release_artisan";

export class EscrowService {
  /**
   * 1. HELD IN ESCROW (Client payment lock)
   * Client pays, available balance is debited and marked as lockedBalance in the client's wallet.
   */
  static async holdInEscrow(bookingId: string, clientId: string) {
    return await prisma.$transaction(async (tx) => {
      // Fetch booking details
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { artisan: { include: { user: true } } }
      });

      if (!booking) {
        throw new Error("Booking not found");
      }
      if (booking.clientId !== clientId) {
        throw new Error("Unauthorized: Only the booking client can initiate escrow");
      }
      if (booking.paymentStatus === "escrow") {
        throw new Error("Funds already held in escrow for this service");
      }
      if (booking.paymentStatus === "paid") {
        throw new Error("Booking has already been completed and paid");
      }

      const rawPrice = booking.price;
      if (!rawPrice || Number(rawPrice) <= 0) {
        throw new Error("Invalid booking price: Must be greater than 0");
      }
      const price = Number(rawPrice);

      // Verify client wallet balance
      let clientWallet = await tx.wallet.findUnique({ where: { userId: clientId } });
      if (!clientWallet) {
        clientWallet = await tx.wallet.create({ data: { userId: clientId, balance: 0, lockedBalance: 0 } });
      }

      const balance = Number(clientWallet.balance ?? 0);
      if (balance < price) {
        throw new Error(`Insufficient wallet balance. Price: ${price} MAD, Current: ${balance} MAD`);
      }

      // Decrement balance, increment locked balance (fintech custody ledger pattern)
      await tx.wallet.update({
        where: { id: clientWallet.id },
        data: {
          balance: { decrement: price },
          lockedBalance: { increment: price }
        }
      });

      // Record audit and transaction ledger
      const clientTx = await tx.transaction.create({
        data: {
          walletId: clientWallet.id,
          amount: price,
          type: "payment",
          status: "completed",
          description: `Escrow payment funded for booking #${bookingId}`,
          referenceId: bookingId
        }
      });

      // Update booking to escrow pay state
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          paymentMethod: "wallet",
          paymentStatus: "escrow",
          bookingStatus: booking.bookingStatus === "pending" ? "accepted" : booking.bookingStatus
        }
      });

      // Log security audit trails
      await tx.auditLog.create({
        data: {
          userId: clientId,
          action: "escrow_funded",
          entityType: "booking",
          entityId: bookingId,
          details: `Funded escrow with amount: ${price} MAD. Transaction: ${clientTx.id}`
        }
      });

      // Notify artisan
      if (booking.artisan?.userId) {
        try {
          await sendNotification(
            booking.artisan.userId,
            "Escrow Secured",
            `Great news! The client has funded the escrow for booking #${bookingId.substring(0, 8)}. Money is secured and will be released upon completion.`,
            "push",
            `/bookings/${bookingId}`
          );
        } catch (err) {
          console.warn("[ESCROW] Notification dispatch failed:", err);
        }
      }

      return {
        bookingId,
        price,
        paymentStatus: "escrow",
        transactionId: clientTx.id
      };
    });
  }

  /**
   * 2. RELEASE FROM ESCROW (Payout to artisan minus commission)
   * Decrements client's locked balance and credits artisan's available wallet balance.
   */
  static async releaseFromEscrow(bookingId: string, initiatorId: string, isAdmin = false) {
    return await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { artisan: { include: { user: true } } }
      });

      if (!booking) {
        throw new Error("Booking not found");
      }
      if (booking.paymentStatus !== "escrow") {
        throw new Error(`Cannot release: Escrow not funded (Current status: ${booking.paymentStatus})`);
      }

      // Permission verify: Only client, admin, or system triggers can release funds to the artisan
      if (!isAdmin && booking.clientId !== initiatorId) {
        throw new Error("Unauthorized: Only the client or an administrator can release escrow funds");
      }

      const price = Number(booking.price ?? 0);
      const commissionRateSetting = await tx.setting.findUnique({ where: { key: "commission_rate" } });
      const ratePercent = commissionRateSetting?.value ? Number(commissionRateSetting.value) : 10; // default 10%
      const commissionAmount = Math.round(price * (ratePercent / 100) * 100) / 100;
      const artisanAmount = Math.round((price - commissionAmount) * 100) / 100;

      // 1. Decrement locked funds from client's wallet
      const clientWallet = await tx.wallet.findUnique({ where: { userId: booking.clientId! } });
      if (!clientWallet || Number(clientWallet.lockedBalance ?? 0) < price) {
        throw new Error("Ledger discrepancy: Client wallet lacks sufficient locked balance.");
      }

      await tx.wallet.update({
        where: { id: clientWallet.id },
        data: { lockedBalance: { decrement: price } }
      });

      // 2. Credit Artisan's wallet balance
      if (!booking.artisan?.userId) {
        throw new Error("Artisan user ID not configured. Cannot process payout credit.");
      }

      let artisanWallet = await tx.wallet.findUnique({ where: { userId: booking.artisan.userId } });
      if (!artisanWallet) {
        artisanWallet = await tx.wallet.create({ data: { userId: booking.artisan.userId, balance: 0, lockedBalance: 0 } });
      }

      await tx.wallet.update({
        where: { id: artisanWallet.id },
        data: { balance: { increment: artisanAmount } }
      });

      // 3. Log transactions
      // Release debit from client (representing the finalized expense out of holding)
      await tx.transaction.create({
        data: {
          walletId: clientWallet.id,
          amount: price,
          type: "release",
          status: "completed",
          description: `Escrow release finalized for booking #${bookingId}`,
          referenceId: bookingId
        }
      });

      // Credit to artisan wallet
      await tx.transaction.create({
        data: {
          walletId: artisanWallet.id,
          amount: artisanAmount,
          type: "release",
          status: "completed",
          description: `Payout credit for booking #${bookingId} (gross: ${price} MAD, after ${ratePercent}% commission)`,
          referenceId: bookingId
        }
      });

      // Update Booking
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: "paid",
          bookingStatus: "completed",
          commissionAmount: new Decimal(commissionAmount),
          artisanAmount: new Decimal(artisanAmount)
        }
      });

      // Log safety audit trails
      await tx.auditLog.create({
        data: {
          userId: initiatorId,
          action: "escrow_released",
          entityType: "booking",
          entityId: bookingId,
          details: `Escrow payout released. Net to artisan: ${artisanAmount} MAD, platform commission: ${commissionAmount} MAD (${ratePercent}%). Initiated by: ${isAdmin ? "System Admin" : "Client"}`
        }
      });

      // Notify artisan
      try {
        await sendNotification(
          booking.artisan.userId,
          "Payment Released",
          `Congratulations! Escrow has been released. ${artisanAmount} MAD has been credited to your wallet balance.`,
          "push",
          `/wallet`
        );
      } catch (err) {
        console.warn("[ESCROW] Notification dispatch failed:", err);
      }

      return {
        bookingId,
        grossAmount: price,
        artisanAmount,
        commissionAmount,
        commissionRate: ratePercent
      };
    });
  }

  /**
   * 3. REFUND ESCROW (Cancellation or mediation refund)
   * Decrements client's locked balance and credits client's available balance in full.
   */
  static async refundEscrow(bookingId: string, initiatorId: string, isAdmin = false) {
    return await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { artisan: { include: { user: true } } }
      });

      if (!booking) {
        throw new Error("Booking not found");
      }
      if (booking.paymentStatus !== "escrow") {
        throw new Error(`Cannot refund: Booking is not in escrow status (Current: ${booking.paymentStatus})`);
      }

      // Security checking: Client can cancel if booking is in safe state, artisan can cancel to self-refund the client. Otherwise needs Admin.
      const isClient = booking.clientId === initiatorId;
      const isArtisan = booking.artisan?.userId === initiatorId;

      if (!isAdmin && !isClient && !isArtisan) {
        throw new Error("Unauthorized: You do not have permissions to trigger a refund process.");
      }

      // If client attempts cancellation, verify state
      if (isClient && !isAdmin) {
        const permittedCancelStates = ["pending", "accepted", "en_route"];
        if (!booking.bookingStatus || !permittedCancelStates.includes(booking.bookingStatus)) {
          throw new Error(`Client cancellation is only permitted during status: [${permittedCancelStates.join(", ")}]. Active jobs require mutual or admin mediation.`);
        }
      }

      const price = Number(booking.price ?? 0);

      // 1. Decrement client's locked_balance and credit client's balance
      const clientWallet = await tx.wallet.findUnique({ where: { userId: booking.clientId! } });
      if (!clientWallet || Number(clientWallet.lockedBalance ?? 0) < price) {
        throw new Error("Ledger discrepancy: Client wallet lacks sufficient locked balance.");
      }

      await tx.wallet.update({
        where: { id: clientWallet.id },
        data: {
          lockedBalance: { decrement: price },
          balance: { increment: price }
        }
      });

      // 2. Log transaction
      await tx.transaction.create({
        data: {
          walletId: clientWallet.id,
          amount: price,
          type: "refund",
          status: "completed",
          description: `Escrow refund returned to wallet balance for booking #${bookingId}`,
          referenceId: bookingId
        }
      });

      // 3. Cancel the booking
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: "failed", // Return to failed/not paid state
          bookingStatus: "cancelled"
        }
      });

      // 4. Log security audit
      await tx.auditLog.create({
        data: {
          userId: initiatorId,
          action: "escrow_refunded",
          entityType: "booking",
          entityId: bookingId,
          details: `Escrow refund executed in full: ${price} MAD back to client. Reason / Initiator: ${isAdmin ? "Mediation Refund" : isClient ? "Client Cancellation" : "Artisan Cancellation"}`
        }
      });

      // Notify clients
      try {
        await sendNotification(
          booking.clientId!,
          "Escrow Refunded",
          `The escrow amount of ${price} MAD for booking #${bookingId.substring(0, 8)} has been returned to your wallet balance.`,
          "push",
          `/wallet`
        );
      } catch (err) {
        console.warn("[ESCROW] Notification dispatch failed:", err);
      }

      // Notify artisan
      if (booking.artisan?.userId) {
        try {
          await sendNotification(
            booking.artisan.userId,
            "Booking Cancelled",
            `Booking #${bookingId.substring(0, 8)} has been cancelled. If any escrow payment was held, it was returned to the client.`,
            "push",
            `/bookings/${bookingId}`
          );
        } catch (err) {
          console.warn("[ESCROW] Notification dispatch failed:", err);
        }
      }

      return {
        bookingId,
        refundedAmount: price,
        paymentStatus: "failed",
        bookingStatus: "cancelled"
      };
    });
  }

  /**
   * 4. MEDIATE DISPUTE RESOLUTION
   * Resolves an open dispute, releasing funds to artisan or refunding the client.
   */
  static async resolveDisputeWithEscrow(disputeId: string, resolution: EscrowResolution, adminId: string, notes: string) {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        client: true,
        artisan: { include: { user: true } }
      }
    });

    if (!dispute) {
      throw new Error("Dispute not found");
    }
    if (dispute.status === "resolved") {
      throw new Error("Dispute is already resolved");
    }

    // Find custom booking ID derived from order/booking tracking. Let's find matches.
    // If orderId, we map it, if bookingId is missing, let's search for any booking matching this client and artisan
    // Let's search bookings for client and artisan
    const booking = await prisma.booking.findFirst({
      where: {
        clientId: dispute.clientId,
        artisanId: dispute.artisanId,
        paymentStatus: "escrow"
      }
    });

    if (!booking) {
      throw new Error("No active escrow bookings found for this dispute pair");
    }

    let actionResult;
    if (resolution === "refund_client") {
      actionResult = await EscrowService.refundEscrow(booking.id, adminId, true);
    } else if (resolution === "release_artisan") {
      actionResult = await EscrowService.releaseFromEscrow(booking.id, adminId, true);
    } else {
      throw new Error(`Invalid resolution action: ${resolution}`);
    }

    // Update dispute in Prisma
    await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: "resolved",
        resolution: `Admin Resolution: ${resolution === "refund_client" ? "Refund Client in Full" : "Payout released to Artisan"} - Notes: ${notes}`
      }
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: "dispute_resolved_escrow",
        entityType: "dispute",
        entityId: disputeId,
        details: `Dispute mediated by admin. Resolution: ${resolution}. Dispute notes: ${notes}`
      }
    });

    return {
      disputeId,
      resolution,
      notes,
      ...actionResult
    };
  }
}
