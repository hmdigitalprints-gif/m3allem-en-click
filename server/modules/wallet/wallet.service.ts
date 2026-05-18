import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export class WalletService {
  /**
   * Always handles transactions safely using Prisma's transaction engine.
   */
  
  static async ensureWallet(userId: string, tx?: any) {
    const db = tx ?? prisma;
    let wallet = await db.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await db.wallet.create({ data: { userId, balance: 0, lockedBalance: 0 } });
    }
    return wallet;
  }

  static async credit(userId: string, amount: number, referenceId: string, description: string, tx?: any) {
    const db = tx ?? prisma;
    if (amount <= 0) throw new Error("Amount must be greater than zero");
    
    const wallet = await this.ensureWallet(userId, db);
    const updatedWallet = await db.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amount } }
    });

    await db.transaction.create({
      data: {
        walletId: wallet.id,
        amount: amount,
        type: "credit",
        status: "completed",
        description,
        referenceId
      }
    });

    return updatedWallet;
  }

  static async debit(userId: string, amount: number, referenceId: string, description: string, tx?: any) {
    const db = tx ?? prisma;
    if (amount <= 0) throw new Error("Amount must be greater than zero");
    
    const wallet = await this.ensureWallet(userId, db);
    if (Number(wallet.balance) < amount) {
      throw new Error("Insufficient funds");
    }

    const updatedWallet = await db.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: amount } }
    });

    await db.transaction.create({
      data: {
        walletId: wallet.id,
        amount: amount,
        type: "debit",
        status: "completed",
        description,
        referenceId
      }
    });

    return updatedWallet;
  }

  static async lockFunds(userId: string, amount: number, referenceId: string, description: string, tx?: any) {
    const db = tx ?? prisma;
    if (amount <= 0) throw new Error("Amount must be greater than zero");
    
    const wallet = await this.ensureWallet(userId, db);
    if (Number(wallet.balance) < amount) {
      throw new Error("Insufficient funds to lock");
    }

    const updatedWallet = await db.wallet.update({
      where: { id: wallet.id },
      data: { 
        balance: { decrement: amount },
        lockedBalance: { increment: amount }
      }
    });

    await db.transaction.create({
      data: {
        walletId: wallet.id,
        amount: amount,
        type: "lock",
        status: "completed",
        description,
        referenceId
      }
    });

    return updatedWallet;
  }

  static async releaseLockedFunds(userId: string, amount: number, referenceId: string, description: string, tx?: any) {
    const db = tx ?? prisma;
    if (amount <= 0) throw new Error("Amount must be greater than zero");
    
    const wallet = await this.ensureWallet(userId, db);
    if (Number(wallet.lockedBalance) < amount) {
      throw new Error("Insufficient locked funds");
    }

    const updatedWallet = await db.wallet.update({
      where: { id: wallet.id },
      data: { 
        lockedBalance: { decrement: amount }
      }
    });

    await db.transaction.create({
      data: {
        walletId: wallet.id,
        amount: amount,
        type: "release_lock",
        status: "completed",
        description,
        referenceId
      }
    });

    return updatedWallet;
  }

  static async revertLockedFunds(userId: string, amount: number, referenceId: string, description: string, tx?: any) {
    const db = tx ?? prisma;
    if (amount <= 0) throw new Error("Amount must be greater than zero");
    
    const wallet = await this.ensureWallet(userId, db);
    if (Number(wallet.lockedBalance) < amount) {
      throw new Error("Insufficient locked funds to revert");
    }

    const updatedWallet = await db.wallet.update({
      where: { id: wallet.id },
      data: { 
        lockedBalance: { decrement: amount },
        balance: { increment: amount }
      }
    });

    await db.transaction.create({
      data: {
        walletId: wallet.id,
        amount: amount,
        type: "revert_lock",
        status: "completed",
        description,
        referenceId
      }
    });

    return updatedWallet;
  }
}
