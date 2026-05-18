import prisma from "../../lib/prisma.ts";
import { WalletService } from "./wallet.service.ts";
import { auditService } from "../../services/auditService.ts";

export class WithdrawalService {
  static async requestWithdrawal(userId: string, amount: number, method: string, accountDetails: any) {
    if (amount <= 0) throw new Error("Amount must be greater than zero");

    return await prisma.$transaction(async (tx) => {
      // 1. Lock the funds
      await WalletService.lockFunds(
        userId, 
        amount, 
        `WR_REQ_${Date.now()}`, 
        `Withdrawal requested via ${method}`, 
        tx
      );

      // 2. Create the withdrawal request
      const request = await tx.withdrawalRequest.create({
        data: {
          userId,
          amount,
          method,
          accountDetails: JSON.stringify(accountDetails),
          status: "pending",
        }
      });
      
      await auditService.log(userId, "WITHDRAWAL_REQUESTED", "wallet", request.id, { amount, method }, tx);
      return request;
    });
  }

  static async approveWithdrawal(requestId: string, adminId: string, note?: string) {
    return await prisma.$transaction(async (tx) => {
      const request = await tx.withdrawalRequest.findUnique({ where: { id: requestId } });
      if (!request) throw new Error("Withdrawal request not found");
      if (request.status !== "pending") throw new Error("Request is not pending");

      // Release locked funds (they leave the system)
      await WalletService.releaseLockedFunds(
        request.userId, 
        Number(request.amount), 
        request.id, 
        `Withdrawal approved by admin ${adminId}`, 
        tx
      );

      // Mark request approved
      const updated = await tx.withdrawalRequest.update({
        where: { id: requestId },
        data: { status: "approved", adminNote: note }
      });

      await auditService.log(adminId, "WITHDRAWAL_APPROVED", "wallet", request.id, { amount: request.amount, targetUserId: request.userId }, tx);
      return updated;
    });
  }

  static async rejectWithdrawal(requestId: string, adminId: string, reason: string) {
    return await prisma.$transaction(async (tx) => {
      const request = await tx.withdrawalRequest.findUnique({ where: { id: requestId } });
      if (!request) throw new Error("Withdrawal request not found");
      if (request.status !== "pending") throw new Error("Request is not pending");

      // Revert locked funds (back to balance)
      await WalletService.revertLockedFunds(
        request.userId, 
        Number(request.amount), 
        request.id, 
        `Withdrawal rejected: ${reason}`, 
        tx
      );

      // Mark request rejected
      const updated = await tx.withdrawalRequest.update({
        where: { id: requestId },
        data: { status: "rejected", adminNote: reason }
      });

      await auditService.log(adminId, "WITHDRAWAL_REJECTED", "wallet", request.id, { amount: request.amount, reason }, tx);
      return updated;
    });
  }
}
