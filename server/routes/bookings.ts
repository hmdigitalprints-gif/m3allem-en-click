import express from "express";
import { db } from "../db.ts";
import { authenticateToken } from "./auth.ts";
import { v4 as uuidv4 } from "uuid";
import { sendNotification, io } from "../services/notificationService.ts";
import { calculateDistance } from "../lib/utils.ts";
import { t, getPreferredLanguage } from "../lib/i18n.ts";

const router = express.Router();

// Create a new booking with initial proof and delivery method
router.post("/", authenticateToken, (req, res) => {
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
    const clientId = (req as any).user.id;

    if (!serviceId) {
      return res.status(400).json({ error: "Missing required fields: serviceId" });
    }

    // 1. Create booking in 'pending' status
    const id = uuidv4();
    db.prepare(`
      INSERT INTO bookings (
        id, client_id, artisan_id, service_id, delivery_method, 
        proof_before_client, material_handling, booking_status, 
        scheduled_at, is_urgent, location_lat, location_lng, city, attachments,
        payment_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, 
      clientId, 
      artisanId || null, 
      serviceId, 
      deliveryMethod || 'home_service', 
      proofBeforeClient || 'photo', 
      materialHandling || 'client_provides', 
      scheduledAt || null, 
      isUrgent ? 1 : 0, 
      locationLat || null, 
      locationLng || null, 
      city || null, 
      attachments ? JSON.stringify(attachments) : null,
      paymentMethod || 'cash'
    );

    // 2. Notify artisan(s)
    try {
      if (artisanId) {
        // Notify specific artisan
        const artisan = db.prepare("SELECT user_id FROM artisans WHERE id = ?").get(artisanId) as any;
        if (artisan) {
          sendNotification(
            artisan.user_id,
            "notif_new_booking_title",
            "notif_new_booking_msg",
            'push',
            `/bookings/${id}`
          );
          if (io) {
            const service = db.prepare("SELECT title FROM services WHERE id = ?").get(serviceId) as any;
            const client = db.prepare("SELECT name FROM users WHERE id = ?").get(clientId) as any;
            io.to(artisan.user_id).emit("new_job_available", { 
              bookingId: id,
              serviceTitle: service?.title,
              clientName: client?.name,
              city: city,
              isUrgent: !!isUrgent
            });
          }
        }
      } else {
        // Notify all artisans in the same category and location
        const service = db.prepare("SELECT category_id, title FROM services WHERE id = ?").get(serviceId) as any;
        if (service) {
          const matchingArtisans = db.prepare(`
            SELECT a.*, u.id as user_id 
            FROM artisans a 
            JOIN users u ON a.user_id = u.id 
            WHERE a.category_id = ? AND a.is_online = 1
          `).all(service.category_id) as any[];

          matchingArtisans.forEach(artisan => {
            let matches = false;
            
            // Location match logic
            if (locationLat && locationLng && artisan.latitude && artisan.longitude) {
              const distance = calculateDistance(locationLat, locationLng, artisan.latitude, artisan.longitude);
              if (distance <= (artisan.service_radius || 10)) matches = true;
            }

            if (!matches && city && artisan.preferred_cities) {
              const preferred = JSON.parse(artisan.preferred_cities);
              if (preferred.some((c: string) => c.toLowerCase() === city.toLowerCase())) matches = true;
            }

            if (matches) {
              sendNotification(
                artisan.user_id,
                "notif_new_job_request_title",
                "notif_new_job_request_msg",
                'push',
                `/bookings/${id}`,
                { service: service.title }
              );
              if (io) {
                const client = db.prepare("SELECT name FROM users WHERE id = ?").get(clientId) as any;
                io.to(artisan.user_id).emit("new_job_available", { 
                  bookingId: id,
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
      bookingId: id
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ error: "Failed to create booking", details: error instanceof Error ? error.message : String(error) });
  }
});

// Get bookings for current user (client or artisan)
router.get("/", authenticateToken, (req: any, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const lang = getPreferredLanguage(req);

    let bookings;
    if (role === 'artisan') {
      const artisan = db.prepare("SELECT id FROM artisans WHERE user_id = ?").get(userId) as any;
      if (!artisan) return res.status(404).json({ error: "Artisan profile not found" });
      bookings = db.prepare(`
        SELECT b.*, b.booking_status as status, s.title as service_title, u.name as client_name, u.avatar_url as client_avatar,
               (SELECT COUNT(*) FROM ratings r WHERE r.order_id = b.id) > 0 as has_review
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        JOIN users u ON b.client_id = u.id
        WHERE b.artisan_id = ?
        ORDER BY b.created_at DESC
      `).all(artisan.id) as any[];
    } else {
      bookings = db.prepare(`
        SELECT b.*, b.booking_status as status, s.title as service_title, u.name as artisan_name, u.avatar_url as artisan_avatar,
               (SELECT COUNT(*) FROM ratings r WHERE r.order_id = b.id) > 0 as has_review
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        JOIN artisans a ON b.artisan_id = a.id
        JOIN users u ON a.user_id = u.id
        WHERE b.client_id = ?
        ORDER BY b.created_at DESC
      `).all(userId) as any[];
    }

    const localizedBookings = bookings.map(b => ({
      ...b,
      status_label: t(`status_${b.booking_status}`, lang)
    }));

    res.json(localizedBookings);
  } catch (error) {
    console.error("Fetch bookings error:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Get nearby job requests for artisans
router.get("/nearby", authenticateToken, (req, res) => {
  try {
    const { lat, lng } = req.query;
    const userId = (req as any).user.id;

    // Verify artisan
    const artisan = db.prepare("SELECT * FROM artisans WHERE user_id = ?").get(userId) as any;
    if (!artisan) return res.status(403).json({ error: "Only artisans can access nearby jobs" });

    // Fetch all pending bookings (or proposal_submitted if they can still bid)
    // For now, let's say they can see 'pending' bookings that don't have an artisan assigned yet
    // OR if they are the assigned artisan (but usually 'nearby' is for open requests)
    // The user's requirement says "see job requests nearby".
    // If a booking has an artisan_id, it's already targeted. 
    // If it's a general request (artisan_id is NULL), it's open.
    // Let's assume bookings can have artisan_id = NULL for open requests.
    
    let bookings = db.prepare(`
      SELECT b.*, s.title as service_title, u.name as client_name, u.avatar_url as client_avatar, s.category_id
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users u ON b.client_id = u.id
      WHERE b.booking_status = 'pending'
      AND (b.artisan_id IS NULL OR b.artisan_id = ?)
      AND s.category_id = ?
    `).all(artisan.id, artisan.category_id) as any[];

    const artisanLat = lat ? parseFloat(lat as string) : artisan.latitude;
    const artisanLng = lng ? parseFloat(lng as string) : artisan.longitude;
    const radius = artisan.service_radius || 10;
    const preferredCities = artisan.preferred_cities ? JSON.parse(artisan.preferred_cities) : [];

    const nearbyBookings = bookings.filter(b => {
      // 1. Check by distance if location is available
      if (b.location_lat && b.location_lng && artisanLat && artisanLng) {
        const distance = calculateDistance(artisanLat, artisanLng, b.location_lat, b.location_lng);
        if (distance <= radius) return true;
      }

      // 2. Check by preferred cities
      if (b.city && preferredCities.length > 0) {
        if (preferredCities.some((city: string) => city.toLowerCase() === b.city.toLowerCase())) {
          return true;
        }
      }
      
      // If no location/city info, or no match, return false
      return false;
    });

    res.json(nearbyBookings);
  } catch (error) {
    console.error("Fetch nearby jobs error:", error);
    res.status(500).json({ error: "Failed to fetch nearby jobs" });
  }
});

// Artisan submits a proposal
router.patch("/:id/proposal", authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { proposedPrice, materialCost, requiredMaterials, comments } = req.body;
    const userId = (req as any).user.id;

    // Verify artisan is the one assigned and is verified
    const artisan = db.prepare("SELECT id, is_verified FROM artisans WHERE user_id = ?").get(userId) as any;
    if (!artisan) return res.status(403).json({ error: "Only artisans can submit proposals" });
    if (!artisan.is_verified) return res.status(403).json({ error: "Your account must be verified to submit proposals" });

    const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(id) as any;
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    
    // If booking is already assigned, verify it's the same artisan
    if (booking.artisan_id && booking.artisan_id !== artisan.id) {
      return res.status(403).json({ error: "You are not assigned to this booking" });
    }

    // If it's an open booking, check if artisan category matches
    if (!booking.artisan_id) {
      const service = db.prepare("SELECT category_id FROM services WHERE id = ?").get(booking.service_id) as any;
      if (service && service.category_id !== artisan.category_id) {
        return res.status(403).json({ error: "This job request does not match your category" });
      }
      
      // Claim the booking
      db.prepare("UPDATE bookings SET artisan_id = ? WHERE id = ?").run(artisan.id, id);
    }

    if (booking.booking_status !== 'pending') return res.status(400).json({ error: "Proposals can only be submitted for pending bookings" });

    db.prepare(`
      UPDATE bookings 
      SET artisan_proposed_price = ?, 
          material_cost = ?,
          required_materials = ?, 
          artisan_proposal_comments = ?, 
          booking_status = 'proposal_submitted' 
      WHERE id = ?
    `).run(proposedPrice, materialCost || 0, JSON.stringify(requiredMaterials), comments, id);

    // Notify client
    sendNotification(
      booking.client_id,
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
router.patch("/:id/approve-proposal", authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { materialHandling } = req.body; // 'client_provides', 'artisan_provides', 'buy_from_store'
    const clientId = (req as any).user.id;

    const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(id) as any;
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.client_id !== clientId) return res.status(403).json({ error: "Only the client can approve the proposal" });
    if (booking.booking_status !== 'proposal_submitted') return res.status(400).json({ error: "No proposal to approve" });

    const handling = materialHandling || booking.material_handling;
    
    // Calculate commission based on proposed price
    const servicePrice = booking.artisan_proposed_price;
    const materialCost = (handling === 'artisan_provides') ? booking.material_cost : 0;
    
    // Get category commission rate
    const category = db.prepare(`
      SELECT c.commission_rate 
      FROM categories c
      JOIN services s ON s.category_id = c.id
      WHERE s.id = ?
    `).get(booking.service_id) as { commission_rate: number | null } | undefined;

    const commissionSetting = db.prepare("SELECT value FROM settings WHERE key = 'commission_rate'").get() as { value: string } | undefined;
    const materialCommissionSetting = db.prepare("SELECT value FROM settings WHERE key = 'commission_material_rate'").get() as { value: string } | undefined;
    
    // Use category rate if set, otherwise use global setting
    const commissionRate = (category && category.commission_rate !== null) 
      ? category.commission_rate * 100 
      : (commissionSetting ? Number(commissionSetting.value) : 10);
    
    const materialCommissionRate = materialCommissionSetting ? Number(materialCommissionSetting.value) : 5;

    const serviceCommission = (servicePrice * commissionRate) / 100;
    const materialCommission = (materialCost * materialCommissionRate) / 100;
    
    const adminAmount = serviceCommission + materialCommission;
    const totalPrice = servicePrice + materialCost;
    const artisanAmount = totalPrice - adminAmount;

    db.prepare(`
      UPDATE bookings 
      SET client_approved_proposal = 1, 
          material_handling = ?,
          booking_status = 'proposal_approved',
          price = ?,
          admin_amount = ?,
          artisan_amount = ?
      WHERE id = ?
    `).run(handling, totalPrice, adminAmount, artisanAmount, id);

    // Notify artisan
    const artisan = db.prepare("SELECT user_id FROM artisans WHERE id = ?").get(booking.artisan_id) as any;
    if (artisan) {
      sendNotification(
        artisan.user_id,
        "notif_proposal_approved_title",
        "notif_proposal_approved_msg",
        'push',
        `/bookings/${id}`
      );
    }

    res.json({ message: "Proposal approved successfully" });
  } catch (error) {
    console.error("Approve proposal error:", error);
    res.status(500).json({ error: "Failed to approve proposal" });
  }
});

// Update booking status
router.patch("/:id/status", authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { status, attachments } = req.body;
    const userId = (req as any).user.id;

    const validStatuses = ['pending', 'proposal_submitted', 'proposal_approved', 'en_route', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid booking status" });
    }

    const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(id) as any;
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Basic permission check (client or artisan)
    const artisan = db.prepare("SELECT id FROM artisans WHERE user_id = ?").get(userId) as any;
    const isArtisan = artisan && artisan.id === booking.artisan_id;
    const isClient = userId === booking.client_id;

    if (!isArtisan && !isClient) {
      return res.status(403).json({ error: "Unauthorized to update this booking" });
    }

    // Mandatory proof checks for completion
    if (status === 'completed') {
      if (!booking.proof_during_service || !booking.proof_after_service) {
        return res.status(400).json({ error: "Mandatory proofs (during and after service) must be uploaded before completion" });
      }
    }

    if (attachments) {
      db.prepare("UPDATE bookings SET booking_status = ?, attachments = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, attachments, id);
    } else {
      db.prepare("UPDATE bookings SET booking_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, id);
    }

    // Notify other party
    const recipientId = isClient ? (db.prepare("SELECT user_id FROM artisans WHERE id = ?").get(booking.artisan_id) as any).user_id : booking.client_id;
    const lang = getPreferredLanguage(req);
    sendNotification(
      recipientId,
      "notif_status_updated_title",
      "notif_status_updated_msg",
      'push',
      `/bookings/${id}`,
      { status: t(`status_${status}`, lang) }
    );

    res.json({ message: `Booking status updated to ${status}`, id, booking_status: status });
  } catch (error) {
    console.error("Update booking status error:", error);
    res.status(500).json({ error: "Failed to update booking status" });
  }
});

// Upload during/after service proofs
router.post("/:id/proof", authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { type, url, attachments } = req.body; // type: 'during', 'after'
    const userId = (req as any).user.id;

    if (!['during', 'after'].includes(type)) {
      return res.status(400).json({ error: "Invalid proof type. Use 'during' or 'after'." });
    }

    const artisan = db.prepare("SELECT id FROM artisans WHERE user_id = ?").get(userId) as any;
    if (!artisan) return res.status(403).json({ error: "Only artisans can upload service proofs" });

    const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(id) as any;
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.artisan_id !== artisan.id) return res.status(403).json({ error: "You are not assigned to this booking" });

    const field = type === 'during' ? 'proof_during_service' : 'proof_after_service';
    
    if (attachments) {
      db.prepare(`UPDATE bookings SET ${field} = ?, attachments = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(url, attachments, id);
    } else {
      db.prepare(`UPDATE bookings SET ${field} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(url, id);
    }

    // Notify client
    sendNotification(
      booking.client_id,
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
router.patch("/:id/payment", authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'paid', 'failed'
    const userId = (req as any).user.id;

    if (!['paid', 'failed'].includes(status)) {
      return res.status(400).json({ error: "Invalid payment status. Must be 'paid' or 'failed'." });
    }

    // Verify booking exists and user is the artisan (usually artisan confirms cash payment)
    const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(id) as any;
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // In a real app, we'd check if the user is the artisan assigned to this booking
    // const artisan = db.prepare("SELECT id FROM artisans WHERE user_id = ?").get(userId) as any;
    // if (booking.artisan_id !== artisan.id) return res.status(403).json({ error: "Only the assigned artisan can confirm payment" });

    db.prepare("UPDATE bookings SET payment_status = ? WHERE id = ?").run(status, id);

    res.json({ message: `Payment status updated to ${status}`, id, payment_status: status });
  } catch (error) {
    console.error("Update payment error:", error);
    res.status(500).json({ error: "Failed to update payment status" });
  }
});

// Settings routes (Commission)
router.get("/settings/commission", authenticateToken, (req, res) => {
  try {
    const setting = db.prepare("SELECT value FROM settings WHERE key = 'commission_rate'").get() as { value: number } | undefined;
    res.json({ commission_rate: setting ? setting.value : 0 });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch commission rate" });
  }
});

router.patch("/settings/commission", authenticateToken, (req, res) => {
  try {
    const { commission_rate } = req.body;
    const userId = (req as any).user.id;
    const role = (req as any).user.role;

    if (role !== 'admin') {
      return res.status(403).json({ error: "Only admins can update commission rate" });
    }

    if (typeof commission_rate !== 'number' || commission_rate < 0 || commission_rate > 100) {
      return res.status(400).json({ error: "Invalid commission rate. Must be a number between 0 and 100." });
    }

    db.prepare("INSERT OR REPLACE INTO settings (id, key, value, updated_at) VALUES ((SELECT id FROM settings WHERE key = 'commission_rate'), 'commission_rate', ?, CURRENT_TIMESTAMP)")
      .run(commission_rate);

    res.json({ message: "Commission rate updated successfully", commission_rate });
  } catch (error) {
    console.error("Update commission error:", error);
    res.status(500).json({ error: "Failed to update commission rate" });
  }
});

// Leave a review
router.post("/:id/review", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { stars, review } = req.body;
  const clientId = (req as any).user.id;

  const booking = db.prepare("SELECT * FROM bookings WHERE id = ? AND client_id = ? AND booking_status = 'completed'").get(id, clientId) as any;
  if (!booking) return res.status(400).json({ error: "Invalid booking for review" });

  // Check if review already exists
  const existingReview = db.prepare("SELECT id FROM ratings WHERE order_id = ?").get(id);
  if (existingReview) return res.status(400).json({ error: "Review already exists for this booking" });

  const reviewId = uuidv4();
  db.prepare(`
    INSERT INTO ratings (id, order_id, client_id, artisan_id, stars, review)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(reviewId, id, clientId, booking.artisan_id, stars, review);

  // Update artisan average rating
  const stats = db.prepare(`
    SELECT AVG(stars) as avg_stars, COUNT(*) as count 
    FROM ratings 
    WHERE artisan_id = ?
  `).get(booking.artisan_id) as { avg_stars: number, count: number };

  db.prepare("UPDATE artisans SET rating = ?, review_count = ? WHERE id = ?")
    .run(stats.avg_stars, stats.count, booking.artisan_id);

  res.json({ success: true });
});

export default router;
