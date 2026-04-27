import express from "express";
import prisma from "../lib/prisma.ts";
import { sendNotification } from "../services/notificationService.ts";

const router = express.Router();

// Mock Webhook for Stripe / CMI
router.post("/stripe", express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const event = req.body;
    
    // In production, you would verify the signature here using stripe.webhooks.constructEvent

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const bookingId = paymentIntent.metadata?.bookingId;

        if (bookingId) {
          // Update the booking as paid
          await prisma.booking.update({
             where: { id: bookingId },
             data: { paymentStatus: 'paid' }
          });
          
          // Optionally notify the client
          const booking = await prisma.booking.findUnique({ where: { id: bookingId }, select: { clientId: true } });
          if (booking?.clientId) {
            sendNotification(booking.clientId, "Payment Successful", "Your payment has been successfully processed", "push", `/bookings`);
          }
        }
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const bookingId = paymentIntent.metadata?.bookingId;

        if (bookingId) {
          // Update the booking as failed
          await prisma.booking.update({
             where: { id: bookingId },
             data: { paymentStatus: 'failed' }
          });
          
          const booking = await prisma.booking.findUnique({ where: { id: bookingId }, select: { clientId: true } });
          if (booking?.clientId) {
             sendNotification(booking.clientId, "Payment Failed", "Your payment failed. Please retry your payment.", "push", `/bookings/${bookingId}/retry-payment`);
          }
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook Error:", err);
    res.status(400).send(`Webhook Error`);
  }
});

// Endpoint to retry a failed payment
router.post("/retry/:bookingId", async (req: any, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ error: "Booking is already paid" });
    }

    // Here we would create a new Stripe Session or CMI Session and return the URL
    // For now, we simulate a successful generation of a retry link:
    res.json({ 
       message: "Payment retry initiated", 
       checkoutUrl: `/checkout/${bookingId}` 
    });
  } catch (error) {
    console.error("Retry payment error:", error);
    res.status(500).json({ error: "Failed to retry payment" });
  }
});

export default router;
