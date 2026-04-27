import express from "express";
import prisma from "../lib/prisma.ts";
import { authenticateToken } from "./auth.ts";
import { sendNotification, io } from "../services/notificationService.ts";
import { calculateDistance } from "../lib/utils.ts";
import { t, getPreferredLanguage } from "../lib/i18n.ts";
import { auditService } from "../services/auditService.ts";
type BookingStatus = string; type PaymentMethod = string; type DeliveryMethod = string; type MaterialHandling = string;

const router = express.Router();

// Create a new booking with initial proof and delivery method
router.post("/", authenticateToken, async (req: any, res) => {
  try {
    const { 
      artisanId, 
      serviceId, 
      deliveryMethod, 
      proofBeforeClient, 
      materialHandling, 
      scheduledAt, 
      isUrgent, 
      locationLat, 
      locationLng, 
      city, 
      attachments,
      paymentMethod
    } = req.body;
    const clientId = req.user.id;

    if (!serviceId) {
      return res.status(400).json({ error: "Missing required fields: serviceId" });
    }

    // 1. Create booking in 'pending' status
    const booking = await prisma.booking.create({
      data: {
        clientId,
        artisanId: artisanId || null,
        serviceId,
        deliveryMethod: (deliveryMethod as DeliveryMethod) || 'home_service',
        proofBeforeClient: proofBeforeClient || 'photo',
        materialHandling: (materialHandling as MaterialHandling) || 'client_provides',
        bookingStatus: 'pending',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        isUrgent: !!isUrgent,
        locationLat: locationLat || null,
        locationLng: locationLng || null,
        city: city || null,
        attachments: attachments ? JSON.stringify(attachments) : null,
        paymentMethod: (paymentMethod as PaymentMethod) || 'cash'
      }
    });

    // 2. Notify artisan(s)
    try {
      if (artisanId) {
        // Notify specific artisan
        const artisan = await prisma.artisan.findUnique({
          where: { id: artisanId },
          select: { userId: true }
        });
        if (artisan) {
          await sendNotification(
            artisan.userId,
            "notif_new_booking_title",
            "notif_new_booking_msg",
            'push',
            `/bookings/${booking.id}`
          );
          if (io) {
            const service = await prisma.service.findUnique({
              where: { id: serviceId },
              select: { title: true }
            });
            const client = await prisma.user.findUnique({
              where: { id: clientId },
              select: { name: true }
            });
            io.to(artisan.userId).emit("new_job_available", { 
              bookingId: booking.id,
              serviceTitle: service?.title,
              clientName: client?.name,
              city: city,
              isUrgent: !!isUrgent
            });
          }
        }
      } else {
        // Notify all artisans in the same category and location
        const service = await prisma.service.findUnique({
          where: { id: serviceId },
          select: { categoryId: true, title: true }
        });
        if (service) {
          const matchingArtisans = await prisma.artisan.findMany({
            where: {
              categoryId: service.categoryId,
              isOnline: true
            },
            include: {
              user: { select: { id: true } }
            }
          });

          matchingArtisans.forEach(async (artisan) => {
            let matches = false;
            
            // Location match logic
            if (locationLat && locationLng && artisan.latitude && artisan.longitude) {
              const distance = calculateDistance(Number(locationLat), Number(locationLng), Number(artisan.latitude), Number(artisan.longitude));
              if (distance <= (Number(artisan.serviceRadius) || 10)) matches = true;
            }

            if (!matches && city && artisan.preferredCities) {
              const preferred = artisan.preferredCities;
              if (Array.isArray(preferred) && preferred.some((c: any) => String(c).toLowerCase() === city.toLowerCase())) matches = true;
            }

            if (matches) {
              await sendNotification(
                artisan.userId,
                "notif_new_job_request_title",
                "notif_new_job_request_msg",
                'push',
                `/bookings/${booking.id}`,
                { service: service.title }
              );
              if (io) {
                const client = await prisma.user.findUnique({
                  where: { id: clientId },
                  select: { name: true }
                });
                io.to(artisan.userId).emit("new_job_available", { 
                  bookingId: booking.id,
                  serviceTitle: service.title,
                  clientName: client?.name,
                  city: city,
                  isUrgent: !!isUrgent
                });
              }
            }
          });
        }
      }
    } catch (notifyError) {
      console.error("Notification failed:", notifyError);
    }

    res.status(201).json({
      message: "Booking created successfully. Waiting for artisan proposal.",
      bookingId: booking.id
    });
    
    await auditService.log(clientId, 'BOOKING_CREATED', 'booking', booking.id, { artisanId, serviceId }, req.ip);
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ error: "Failed to create booking", details: error instanceof Error ? error.message : String(error) });
  }
});

// Get bookings for current user (client or artisan)
router.get("/", authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const lang = await getPreferredLanguage(req);

    let bookings;
    if (role === 'artisan') {
      const artisan = await prisma.artisan.findUnique({
        where: { userId },
        select: { id: true }
      });
      if (!artisan) return res.status(404).json({ error: "Artisan profile not found" });
      
      bookings = await prisma.booking.findMany({
        where: { artisanId: artisan.id },
        include: {
          service: { select: { title: true } },
          client: { select: { name: true, avatarUrl: true } },
          ratings: { select: { id: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      bookings = await prisma.booking.findMany({
        where: { clientId: userId },
        include: {
          service: { select: { title: true } },
          artisan: {
            include: {
              user: { select: { name: true, avatarUrl: true } }
            }
          },
          ratings: { select: { id: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    const formatted = await Promise.all(bookings.map(async (b: any) => ({
      ...b,
      status: b.bookingStatus,
      service_title: b.service?.title,
      client_name: b.client?.name,
      client_avatar: b.client?.avatarUrl,
      artisan_name: b.artisan?.user?.name,
      artisan_avatar: b.artisan?.user?.avatarUrl,
      has_review: b.ratings.length > 0,
      status_label: await t(`status_${b.bookingStatus}`, lang)
    })));

    res.json(formatted);
  } catch (error) {
    console.error("Fetch bookings error:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Get nearby job requests for artisans
router.get("/nearby", authenticateToken, async (req: any, res) => {
  try {
    const { lat, lng } = req.query;
    const userId = req.user.id;

    // Verify artisan
    const artisan = await prisma.artisan.findUnique({
      where: { userId }
    });
    if (!artisan) return res.status(403).json({ error: "Only artisans can access nearby jobs" });

    const bookings = await prisma.booking.findMany({
      where: {
        bookingStatus: 'pending',
        OR: [
          { artisanId: null },
          { artisanId: artisan.id }
        ],
        service: {
          categoryId: artisan.categoryId
        }
      },
      include: {
        service: { select: { title: true, categoryId: true } },
        client: { select: { name: true, avatarUrl: true } }
      }
    });

    const artisanLat = lat ? parseFloat(lat as string) : Number(artisan.latitude);
    const artisanLng = lng ? parseFloat(lng as string) : Number(artisan.longitude);
    const radius = Number(artisan.serviceRadius) || 10;
    const preferredCities = Array.isArray(artisan.preferredCities) ? artisan.preferredCities : [];

    const nearbyBookings = bookings.filter((b: any) => {
      // 1. Check by distance if location is available
      if (b.locationLat && b.locationLng && artisanLat && artisanLng) {
        const distance = calculateDistance(artisanLat, artisanLng, Number(b.locationLat), Number(b.locationLng));
        if (distance <= radius) return true;
      }

      // 2. Check by preferred cities
      if (b.city && preferredCities.length > 0) {
        if (preferredCities.some((city: string) => city.toLowerCase() === b.city.toLowerCase())) {
          return true;
        }
      }
      
      return false;
    }).map((b: any) => ({
      ...b,
      service_title: b.service?.title,
      client_name: b.client?.name,
      client_avatar: b.client?.avatarUrl,
      category_id: b.service?.categoryId
    }));

    res.json(nearbyBookings);
  } catch (error) {
    console.error("Fetch nearby jobs error:", error);
    res.status(500).json({ error: "Failed to fetch nearby jobs" });
  }
});

// Artisan submits a proposal
router.patch("/:id/proposal", authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { proposedPrice, materialCost, requiredMaterials, comments } = req.body;
    const userId = req.user.id;

    // Verify artisan is the one assigned and is verified
    const artisan = await prisma.artisan.findUnique({
      where: { userId },
      select: { id: true, isVerified: true, categoryId: true }
    });
    if (!artisan) return res.status(403).json({ error: "Only artisans can submit proposals" });
    if (!artisan.isVerified) return res.status(403).json({ error: "Your account must be verified to submit proposals" });

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { service: { select: { categoryId: true } } }
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    
    // If booking is already assigned, verify it's the same artisan
    if (booking.artisanId && booking.artisanId !== artisan.id) {
      return res.status(403).json({ error: "You are not assigned to this booking" });
    }

    // If it's an open booking, check if artisan category matches
    if (!booking.artisanId) {
      if (booking.service?.categoryId !== artisan.categoryId) {
        return res.status(403).json({ error: "This job request does not match your category" });
      }
      
      // Claim the booking
      await prisma.booking.update({
        where: { id },
        data: { artisanId: artisan.id }
      });
    }

    if (booking.bookingStatus !== 'pending') return res.status(400).json({ error: "Proposals can only be submitted for pending bookings" });

    await prisma.booking.update({
      where: { id },
      data: {
        artisanProposedPrice: proposedPrice,
        materialCost: materialCost || 0,
        requiredMaterials: JSON.stringify(requiredMaterials),
        artisanProposalComments: comments,
        bookingStatus: 'proposal_submitted'
      }
    });

    // Notify client
    await sendNotification(
      booking.clientId,
      "notif_proposal_received_title",
      "notif_proposal_received_msg",
      'push',
      `/bookings/${id}`
    );

    res.json({ message: "Proposal submitted successfully" });
  } catch (error) {
    console.error("Submit proposal error:", error);
    res.status(500).json({ error: "Failed to submit proposal" });
  }
});

// Client approves artisan proposal
router.patch("/:id/approve-proposal", authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { materialHandling } = req.body; // 'client_provides', 'artisan_provides', 'buy_from_store'
    const clientId = req.user.id;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: {
          include: {
            category: { select: { commissionRate: true } }
          }
        }
      }
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.clientId !== clientId) return res.status(403).json({ error: "Only the client can approve the proposal" });
    if (booking.bookingStatus !== 'proposal_submitted') return res.status(400).json({ error: "No proposal to approve" });

    const handling = (materialHandling as MaterialHandling) || booking.materialHandling;
    
    // Calculate commission based on proposed price
    const servicePrice = Number(booking.artisanProposedPrice || 0);
    const materialCost = (handling === 'artisan_provides') ? Number(booking.materialCost || 0) : 0;
    
    const commissionSetting = await prisma.setting.findUnique({ where: { key: 'commission_rate' } });
    const materialCommissionSetting = await prisma.setting.findUnique({ where: { key: 'commission_material_rate' } });
    
    // Use category rate if set, otherwise use global setting
    const commissionRate = (booking.service?.category?.commissionRate !== null) 
      ? Number(booking.service?.category?.commissionRate || 0) * 100 
      : (commissionSetting ? Number(commissionSetting.value) : 10);
    
    const materialCommissionRate = materialCommissionSetting ? Number(materialCommissionSetting.value) : 5;

    const serviceCommission = (servicePrice * commissionRate) / 100;
    const materialCommission = (materialCost * materialCommissionRate) / 100;
    
    const adminAmount = serviceCommission + materialCommission;
    const totalPrice = servicePrice + materialCost;
    const artisanAmount = totalPrice - adminAmount;

    await prisma.booking.update({
      where: { id },
      data: {
        clientApprovedProposal: true,
        materialHandling: handling,
        bookingStatus: 'proposal_approved',
        price: totalPrice,
        adminAmount,
        artisanAmount
      }
    });

    // Notify artisan
    if (booking.artisanId) {
      const artisan = await prisma.artisan.findUnique({
        where: { id: booking.artisanId },
        select: { userId: true }
      });
      if (artisan) {
        await sendNotification(
          artisan.userId,
          "notif_proposal_approved_title",
          "notif_proposal_approved_msg",
          'push',
          `/bookings/${id}`
        );
      }
    }

    res.json({ message: "Proposal approved successfully" });
  } catch (error) {
    console.error("Approve proposal error:", error);
    res.status(500).json({ error: "Failed to approve proposal" });
  }
});

// Update booking status
router.patch("/:id/status", authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status, attachments } = req.body;
    const userId = req.user.id;

    const validStatuses = ['pending', 'proposal_submitted', 'proposal_approved', 'en_route', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid booking status" });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { artisan: { select: { id: true, userId: true } } }
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Basic permission check (client or artisan)
    const isArtisan = booking.artisan && booking.artisan.userId === userId;
    const isClient = userId === booking.clientId;

    if (!isArtisan && !isClient) {
      return res.status(403).json({ error: "Unauthorized to update this booking" });
    }

    // Mandatory proof checks for completion
    if (status === 'completed') {
      if (!booking.proofDuringService || !booking.proofAfterService) {
        return res.status(400).json({ error: "Mandatory proofs (during and after service) must be uploaded before completion" });
      }
    }

    await prisma.booking.update({
      where: { id },
      data: {
        bookingStatus: status as BookingStatus,
        attachments: attachments ? JSON.stringify(attachments) : booking.attachments
      }
    });

    // Notify other party
    let recipientId;
    if (isClient) {
      recipientId = booking.artisan?.userId;
    } else {
      recipientId = booking.clientId;
    }
    
    if (recipientId) {
      const lang = await getPreferredLanguage(req);
      await sendNotification(
        recipientId,
        "notif_status_updated_title",
        "notif_status_updated_msg",
        'push',
        `/bookings/${id}`,
        { status: await t(`status_${status}`, lang) }
      );
    }

    res.json({ message: `Booking status updated to ${status}`, id, booking_status: status });
  } catch (error) {
    console.error("Update booking status error:", error);
    res.status(500).json({ error: "Failed to update booking status" });
  }
});

// Upload during/after service proofs
router.post("/:id/proof", authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { type, url, attachments } = req.body; // type: 'during', 'after'
    const userId = req.user.id;

    if (!['during', 'after'].includes(type)) {
      return res.status(400).json({ error: "Invalid proof type. Use 'during' or 'after'." });
    }

    const artisan = await prisma.artisan.findUnique({
      where: { userId },
      select: { id: true }
    });
    if (!artisan) return res.status(403).json({ error: "Only artisans can upload service proofs" });

    const booking = await prisma.booking.findUnique({
      where: { id }
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.artisanId !== artisan.id) return res.status(403).json({ error: "You are not assigned to this booking" });

    const field = type === 'during' ? 'proofDuringService' : 'proofAfterService';
    
    await prisma.booking.update({
      where: { id },
      data: {
        [field]: url,
        attachments: attachments ? JSON.stringify(attachments) : booking.attachments
      }
    });

    // Notify client
    await sendNotification(
      booking.clientId,
      "notif_proof_uploaded_title",
      "notif_proof_uploaded_msg",
      'push',
      `/bookings/${id}`
    );

    res.json({ message: `Proof ${type} service uploaded successfully` });
  } catch (error) {
    console.error("Upload proof error:", error);
    res.status(500).json({ error: "Failed to upload proof" });
  }
});

// Update payment status (pending -> paid)
router.patch("/:id/payment", authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'paid', 'failed'
    const userId = req.user.id;

    if (!['paid', 'failed'].includes(status)) {
      return res.status(400).json({ error: "Invalid payment status. Must be 'paid' or 'failed'." });
    }

    // Verify booking exists and user is the artisan (only assigned artisan or admin can confirm payment)
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { artisan: { select: { userId: true } } }
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const role = req.user.role;
    const isAssignedArtisan = booking.artisan && booking.artisan.userId === userId;
    
    if (role !== 'admin' && !isAssignedArtisan) {
      return res.status(403).json({ error: "Only the assigned artisan or an admin can confirm payment" });
    }

    await prisma.booking.update({
      where: { id },
      data: { paymentStatus: status }
    });

    await auditService.log(userId, 'PAYMENT_STATUS_UPDATED', 'booking', id, { status }, req.ip);
    res.json({ message: `Payment status updated to ${status}`, id, payment_status: status });
  } catch (error) {
    console.error("Update payment error:", error);
    res.status(500).json({ error: "Failed to update payment status" });
  }
});

// Settings routes (Commission)
router.get("/settings/commission", authenticateToken, async (req, res) => {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'commission_rate' } });
    res.json({ commission_rate: setting ? Number(setting.value) : 0 });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch commission rate" });
  }
});

router.patch("/settings/commission", authenticateToken, async (req: any, res) => {
  try {
    const { commission_rate } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    if (role !== 'admin') {
      return res.status(403).json({ error: "Only admins can update commission rate" });
    }

    if (typeof commission_rate !== 'number' || commission_rate < 0 || commission_rate > 100) {
      return res.status(400).json({ error: "Invalid commission rate. Must be a number between 0 and 100." });
    }

    await prisma.setting.upsert({
      where: { key: 'commission_rate' },
      update: { value: commission_rate.toString() },
      create: { key: 'commission_rate', value: commission_rate.toString() }
    });

    res.json({ message: "Commission rate updated successfully", commission_rate });
  } catch (error) {
    console.error("Update commission error:", error);
    res.status(500).json({ error: "Failed to update commission rate" });
  }
});

// Leave a review
router.post("/:id/review", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { stars, review } = req.body;
  const clientId = req.user.id;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id }
    });
    if (!booking || booking.clientId !== clientId || booking.bookingStatus !== 'completed') {
      return res.status(400).json({ error: "Invalid booking for review" });
    }

    // Check if review already exists
    const existingReview = await prisma.rating.findFirst({
      where: { orderId: id }
    });
    if (existingReview) return res.status(400).json({ error: "Review already exists for this booking" });

    await prisma.rating.create({
      data: {
        orderId: id,
        clientId,
        artisanId: booking.artisanId!,
        stars,
        review
      }
    });

    // Update artisan average rating
    const stats = await prisma.rating.aggregate({
      where: { artisanId: booking.artisanId! },
      _avg: { stars: true },
      _count: { stars: true }
    });

    await prisma.artisan.update({
      where: { id: booking.artisanId! },
      data: {
        rating: stats._avg.stars || 0,
        reviewCount: stats._count.stars
      }
    });

    await auditService.log(clientId, 'REVIEW_SUBMITTED', 'booking', id, { stars }, req.ip);
    res.json({ success: true });
  } catch (error) {
    console.error("Submit review error:", error);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

// Get market data for AI pricing
router.get("/market-data", authenticateToken, async (req, res) => {
  try {
    const { categoryId, city } = req.query;
    if (!categoryId || !city) {
      return res.status(400).json({ error: "categoryId and city are required" });
    }

    // 1. Average historical price for this category in this city
    const historicalStats = await prisma.booking.aggregate({
      where: {
        service: { categoryId: categoryId as string },
        city: city as string,
        bookingStatus: 'completed',
        price: { not: null }
      },
      _avg: { price: true },
      _count: { id: true }
    });

    // 2. Current demand (pending/proposal_submitted in last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const demandStats = await prisma.booking.count({
      where: {
        service: { categoryId: categoryId as string },
        city: city as string,
        bookingStatus: { in: ['pending', 'proposal_submitted'] },
        createdAt: { gte: oneDayAgo }
      }
    });

    // 3. Artisan availability
    const onlineArtisans = await prisma.artisan.count({
      where: {
        categoryId: categoryId as string,
        isOnline: true,
        OR: [
          { city: city as string }
        ]
      }
    });

    res.json({
      avgHistoricalPrice: historicalStats._avg.price || 0,
      totalCompleted: historicalStats._count.id,
      activeRequests: demandStats,
      onlineArtisans: onlineArtisans,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Market data error:", error);
    res.status(500).json({ error: "Failed to fetch market data" });
  }
});

export default router;
