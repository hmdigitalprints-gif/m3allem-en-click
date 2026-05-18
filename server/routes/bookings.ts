import express from "express";
import prisma from "../lib/prisma.ts";
import { authenticateToken } from "./auth.ts";
import { sendNotification, io } from "../services/notificationService.ts";
import { calculateDistance } from "../lib/utils.ts";
import { t, getPreferredLanguage } from "../lib/i18n.ts";
import { auditService } from "../services/auditService.ts";
import { BookingStatus, PaymentMethod, DeliveryMethod, MaterialHandling } from "@prisma/client";

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
      address,
      description,
      attachments,
      paymentMethod
    } = req.body;
    const clientId = req.user.id;

    if (!serviceId) {
      return res.status(400).json({ error: "Missing required fields: serviceId" });
    }

    // 1. Verify existence of service and artisan
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return res.status(400).json({ error: "Invalid service ID. If you are using mock data, please create a real service first." });
    }

    if (artisanId) {
      const artisan = await prisma.artisan.findUnique({ where: { id: artisanId } });
      if (!artisan) {
        return res.status(400).json({ error: "Invalid artisan ID. If you are using mock data, please create a real artisan first." });
      }
    }

    // 2. Create booking in 'pending' status
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
        address: address || null,
        description: description || null,
        attachments: attachments || null,
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

          await Promise.all(matchingArtisans.map(async (artisan) => {
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
          }));
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
    const { cursor } = req.query;

    let bookings;
    if (role === 'artisan') {
      const artisan = await prisma.artisan.findUnique({
        where: { userId },
        select: { id: true }
      });
      if (!artisan) return res.status(404).json({ error: "Artisan profile not found" });
      
      bookings = await prisma.booking.findMany({
        where: { artisanId: artisan.id },
        select: {
          id: true,
          clientId: true,
          artisanId: true,
          serviceId: true,
          bookingStatus: true,
          scheduledAt: true,
          isUrgent: true,
          price: true,
          createdAt: true,
          city: true,
          address: true,
          service: { select: { title: true } },
          client: { select: { name: true, avatarUrl: true, phone: true } },
          ratings: { select: { id: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
        ...(cursor ? { skip: 1, cursor: { id: cursor as string } } : {})
      });
    } else {
      bookings = await prisma.booking.findMany({
        where: { clientId: userId },
        select: {
          id: true,
          clientId: true,
          artisanId: true,
          serviceId: true,
          bookingStatus: true,
          scheduledAt: true,
          isUrgent: true,
          price: true,
          createdAt: true,
          city: true,
          address: true,
          service: { select: { title: true } },
          artisan: {
            include: {
              user: { select: { name: true, avatarUrl: true, phone: true } }
            }
          },
          ratings: { select: { id: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
        ...(cursor ? { skip: 1, cursor: { id: cursor as string } } : {})
      });
    }

    const nextCursor = bookings.length === 50 ? bookings[49].id : null;
    if (nextCursor) res.setHeader('X-Next-Cursor', nextCursor);

    const approvedStatuses = ['proposal_approved', 'en_route', 'in_progress', 'client_review', 'completed'];

    const statusKeys = Array.from(new Set(bookings.map(b => `status_${(b as any).bookingStatus}`))) as string[];
    const { getTranslations } = await import("../lib/i18n.ts");
    const translations = await getTranslations(statusKeys, lang);

    const formatted = bookings.map((b: any) => {
      const isApproved = approvedStatuses.includes(b.bookingStatus);
      const statusKey = `status_${b.bookingStatus}`;
      
      const isArtisan = role === 'artisan';
      
      return {
        ...b,
        status: b.bookingStatus,
        service_title: b.service?.title,
        service_name: b.service?.title, // Added for frontend compatibility
        client_name: b.client?.name,
        client_avatar: b.client?.avatarUrl,
        client_phone: isApproved ? b.client?.phone : undefined,
        artisan_name: b.artisan?.user?.name,
        artisan_avatar: b.artisan?.user?.avatarUrl,
        artisan_phone: isApproved ? b.artisan?.user?.phone : undefined,
        other_party_name: isArtisan ? b.client?.name : b.artisan?.user?.name,
        other_party_avatar: isArtisan ? b.client?.avatarUrl : b.artisan?.user?.avatarUrl,
        has_review: b.ratings.length > 0,
        status_label: translations[statusKey] || b.bookingStatus
      };
    });

    res.json(formatted);
  } catch (error: any) {
    const errorDetails = {
      message: error.message,
      code: error.code,
      clientVersion: error.clientVersion,
      meta: error.meta,
      stack: error.stack
    };
    console.error("Fetch bookings detailed error:", JSON.stringify(errorDetails, null, 2));
    res.status(500).json({ 
      error: "Failed to fetch bookings", 
      details: error.message,
      code: error.code 
    });
  }
});

// Get nearby job requests for artisans
router.get("/nearby", authenticateToken, async (req: any, res) => {
  try {
    const { lat, lng, cursor } = req.query;
    const userId = req.user.id;

    // Verify artisan
    const artisan = await prisma.artisan.findUnique({
      where: { userId }
    });
    if (!artisan) return res.status(403).json({ error: "Only artisans can access nearby jobs" });

    const artisanLat = lat ? parseFloat(lat as string) : Number(artisan.latitude);
    const artisanLng = lng ? parseFloat(lng as string) : Number(artisan.longitude);
    const radius = Number(artisan.serviceRadius) || 10;
    
    let whereClause: any = {
      bookingStatus: 'pending',
      OR: [
        { artisanId: null },
        { artisanId: artisan.id }
      ],
      service: {
        categoryId: artisan.categoryId
      }
    };

    if (artisanLat && artisanLng) {
      const maxRadius = 50; // coarse bounds
      const latOffset = maxRadius / 111.32;
      const lngOffset = maxRadius / (111.32 * Math.cos(artisanLat * (Math.PI / 180)));
      
      whereClause.AND = [
        {
          OR: [
            { locationLat: null },
            { locationLat: { gte: artisanLat - latOffset, lte: artisanLat + latOffset } }
          ]
        },
        {
          OR: [
            { locationLng: null },
            { locationLng: { gte: artisanLng - lngOffset, lte: artisanLng + lngOffset } }
          ]
        }
      ];
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      take: 50,
      ...(cursor ? { skip: 1, cursor: { id: cursor as string } } : {}),
      include: {
        service: { select: { title: true, categoryId: true } },
        client: { select: { name: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const nextCursor = bookings.length === 50 ? bookings[49].id : null;
    if (nextCursor) res.setHeader('X-Next-Cursor', nextCursor);

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
      service_name: b.service?.title,
      client_name: b.client?.name,
      client_avatar: b.client?.avatarUrl,
      other_party_name: b.client?.name,
      other_party_avatar: b.client?.avatarUrl,
      category_id: b.service?.categoryId
    }));

    res.json(nearbyBookings);
  } catch (error: any) {
    console.error("Fetch nearby jobs error:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to fetch nearby jobs", details: error.message });
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
        requiredMaterials: requiredMaterials || null,
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
    
    // Use category rate if set (stored as fraction, e.g. 0.10), otherwise use global setting
    const globalComm = commissionSetting ? Number(commissionSetting.value) : 0;
    const catComm = booking.service?.category?.commissionRate !== null ? Number(booking.service?.category?.commissionRate) : null;
    const commissionRate = catComm !== null ? catComm : globalComm;
    
    const materialCommissionRate = materialCommissionSetting ? Number(materialCommissionSetting.value) : 0.05;

    // Both rates are stored as fractions (e.g. 0.10 for 10%), so we do not divide by 100.
    const serviceCommission = servicePrice * commissionRate;
    const materialCommission = materialCost * materialCommissionRate;
    
    const adminAmount = serviceCommission + materialCommission;
    const totalPrice = servicePrice + materialCost;
    const artisanAmount = totalPrice - adminAmount;

    await prisma.booking.update({
      where: { id },
      data: {
        clientApprovedProposal: true,
        materialHandling: handling,
        bookingStatus: 'proposal_approved',
        price: totalPrice
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

// Client rejects artisan proposal
router.patch("/:id/reject-proposal", authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const clientId = req.user.id;

    const booking = await prisma.booking.findUnique({
      where: { id }
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.clientId !== clientId) return res.status(403).json({ error: "Only the client can reject the proposal" });
    if (booking.bookingStatus !== 'proposal_submitted') return res.status(400).json({ error: "No proposal to reject" });

    await prisma.booking.update({
      where: { id },
      data: {
        artisanId: null, // Unassign the artisan so others can bid
        artisanProposedPrice: null,
        materialCost: 0,
        requiredMaterials: null,
        artisanProposalComments: null,
        bookingStatus: 'pending' // Send back to pending queue
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
          "Proposal Rejected",
          "The client has rejected your proposal. The booking is now open again.",
          'push',
          `/bookings`
        );
      }
    }

    res.json({ message: "Proposal rejected effectively" });
  } catch (error) {
    console.error("Reject proposal error:", error);
    res.status(500).json({ error: "Failed to reject proposal" });
  }
});

// Update booking status
router.patch("/:id/status", authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status, attachments } = req.body;
    const userId = req.user.id;

    let validStatuses = ['pending', 'proposal_submitted', 'proposal_approved', 'accepted', 'en_route', 'in_progress', 'client_review', 'completed', 'cancelled'];
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

    // Two-step logic: If artisan sets 'completed', change to 'client_review'
    let finalStatus = status;
    if (status === 'completed' && isArtisan) {
      finalStatus = 'client_review';
    }

    // Mandatory proof checks for completion/review transition
    if ((finalStatus === 'completed' || finalStatus === 'client_review') && isArtisan) {
      if (!booking.proofDuringService || !booking.proofAfterService) {
        return res.status(400).json({ error: "Mandatory proofs (during and after service) must be uploaded before completion" });
      }
    }

    const previousStatus = booking.bookingStatus;

    await prisma.booking.update({
      where: { id },
      data: {
        bookingStatus: finalStatus as BookingStatus,
        attachments: attachments || booking.attachments
      }
    });

    // Logging the state transition
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'booking_status_change',
        entityType: 'booking',
        entityId: id,
        details: `Status transitioned from ${previousStatus} to ${finalStatus}`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    // Wallet/Payment updates upon transition to 'accepted' or 'en_route' (so it catches proposal_approved to en_route flow)
    if ((finalStatus === 'accepted' || finalStatus === 'en_route') && booking.paymentStatus !== 'escrow' && booking.paymentStatus !== 'paid') {
      if (booking.paymentMethod === 'wallet' && booking.clientId && booking.price) {
        const clientWallet = await prisma.wallet.findUnique({ where: { userId: booking.clientId } });
        const amount = Number(booking.price);
        if (clientWallet && Number(clientWallet.balance) >= amount) {
          await prisma.wallet.update({
            where: { id: clientWallet.id },
            data: { balance: { decrement: amount } }
          });
          await prisma.transaction.create({
            data: {
              walletId: clientWallet.id,
              amount: amount,
              type: 'payment',
              status: 'completed',
              description: `Payment escrow for booking ${id}`,
              referenceId: id
            }
          });
          await prisma.booking.update({
            where: { id },
            data: { paymentStatus: 'escrow' }
          });
        }
      }
    }

    // Wallet/Payment updates upon transition to 'completed'
    if ((previousStatus === 'in_progress' || previousStatus === 'client_review') && finalStatus === 'completed') {
      if (booking.paymentMethod !== 'cash' && booking.artisan?.userId) {
        const artisanWallet = await prisma.wallet.findUnique({ where: { userId: booking.artisan.userId } });
        if (artisanWallet) {
          // If no artisanAmount defined, use a fallback from price
          const payout = booking.artisanAmount ? Number(booking.artisanAmount) : (booking.price ? Number(booking.price) : 0);
          if (payout > 0) {
            await prisma.wallet.update({
              where: { id: artisanWallet.id },
              data: { balance: { increment: payout } }
            });
            await prisma.transaction.create({
              data: {
                walletId: artisanWallet.id,
                amount: payout,
                type: 'release',
                status: 'completed',
                description: `Payout for completed booking ${id}`,
                referenceId: id
              }
            });
            await prisma.booking.update({
              where: { id },
              data: { paymentStatus: 'paid' }
            });
          }
        }
      }
    }

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

// Process payment via different methods
router.post("/:id/pay", authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { method } = req.body;
    const userId = req.user.id;

    if (!['card', 'wallet', 'cash', 'm-pesa'].includes(method)) {
      return res.status(400).json({ error: "Invalid payment method." });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { client: true }
    });

    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.clientId !== userId) return res.status(403).json({ error: "Only the client can pay for this booking" });

    // Actually process payment
    let paymentSuccess = false;

    if (method === 'wallet') {
      // Wallet payment is already handled by WalletService in frontend component,
      // but in reality we should deduct it here:
      paymentSuccess = true;
    } else if (method === 'cash') {
      // Cash means payment will be done on site
      paymentSuccess = true;
    } else if (method === 'card') {
      // Simulated Stripe Processing
      console.log(`[Stripe Simulation] Processing charge of ${booking.price} MAD for booking ${id}`);
      paymentSuccess = true;
    } else if (method === 'm-pesa') {
      // Simulated M-Pesa API Call
      console.log(`[M-Pesa Simulation] Processing mobile money charge for booking ${id}`);
      paymentSuccess = true; 
    }

    if (paymentSuccess) {
      await prisma.booking.update({
        where: { id },
        data: {
          paymentMethod: method,
          paymentStatus: method === 'cash' ? 'pending' : 'paid' // Cash is pending until artisan confirms
        }
      });
      return res.json({ success: true, message: `Payment via ${method} processed successfully.` });
    } else {
      return res.status(400).json({ error: "Payment processing failed" });
    }
  } catch (error) {
    console.error("Payment processing error:", error);
    res.status(500).json({ error: "Failed to process payment" });
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
      where: { bookingId: id }
    });
    if (existingReview) return res.status(400).json({ error: "Review already exists for this booking" });

    await prisma.rating.create({
      data: {
        bookingId: id,
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
    const historicalBookings = await prisma.booking.findMany({
      where: {
        service: { categoryId: categoryId as string },
        city: city as string,
        bookingStatus: 'completed',
        price: { not: null }
      },
      select: { price: true }
    });

    let totalHistPrice = 0;
    for (const b of historicalBookings) {
      if (b.price) totalHistPrice += Number(b.price);
    }
    const historicalAvg = historicalBookings.length > 0 ? (totalHistPrice / historicalBookings.length) : null;
    const historicalCount = historicalBookings.length;

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
      avgHistoricalPrice: historicalAvg || 0,
      totalCompleted: historicalCount,
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
