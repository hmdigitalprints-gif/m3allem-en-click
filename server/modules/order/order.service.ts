import prisma from "../../lib/prisma.ts";
import { auditService } from "../../services/auditService.ts";
import { sendNotification } from "../../services/notificationService.ts";
import { WalletService } from "../wallet/wallet.service.ts";

export class OrderService {
  static async changeStatus(orderId: string, actorId: string, actorRole: string, newStatus: string, reason?: string) {
    const order = await prisma.booking.findUnique({ where: { id: orderId }});
    if (!order) throw new Error("Order not found");

    const previousStatus = order.bookingStatus;
    if (previousStatus === newStatus) return order;

    // Execute state transition logic inside a transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Update Booking Status
      const updated = await tx.booking.update({
        where: { id: orderId },
        data: { bookingStatus: newStatus as any }
      });

      // 2. Log Event
      await auditService.log(
        actorId, 
        `ORDER_${newStatus.toUpperCase()}`, 
        "booking", 
        orderId, 
        { previousStatus, newStatus, reason, role: actorRole }
      );

      // 3. Payment Flow Triggers
      if ((newStatus === 'completed') && (previousStatus === 'in_progress' || previousStatus === 'client_review')) {
        // If order paid via wallet, and it's marked complete, we ensure artisan wallet release happens
        // Note: Currently in our system, "processWalletPayment" already handled commission and artisan payout,
        // so no further real credits happen here, BUT we could mark transaction status.
      }

      if (newStatus === 'cancelled' && order.paymentStatus === 'paid' && order.paymentMethod === 'wallet') {
        // Refund logic
        if (order.clientId) {
          await WalletService.credit(order.clientId, Number(order.price), order.id, `Refund for cancelled order ${order.id}`, tx);
        }
      }

      return updated;
    });

    // 4. Trigger Notifications & Analytics (Outside transaction to not block DB)
    if (updatedOrder.clientId && actorId !== updatedOrder.clientId) {
      await sendNotification(
        updatedOrder.clientId, 
        "notification_order_updated", 
        "notification_order_updated_msg", 
        "push", 
        `/client/orders/${orderId}`, 
        { status: newStatus }
      );
    }
    if (updatedOrder.artisanId) {
      const artisan = await prisma.artisan.findUnique({ where: { id: updatedOrder.artisanId } });
      if (artisan?.userId && actorId !== artisan.userId) {
        await sendNotification(
          artisan.userId, 
          "notification_order_updated", 
          "notification_order_updated_msg", 
          "push", 
          `/artisan/orders/${orderId}`, 
          { status: newStatus }
        );
      }
    }

    return updatedOrder;
  }
}
