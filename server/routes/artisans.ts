import express from "express";
import { db } from "../db.ts";
import { authenticateToken } from "./auth.ts";
import { v4 as uuidv4 } from "uuid";
import { sendNotification } from "../services/notificationService.ts";
import { calculateDistance } from "../lib/utils.ts";

const router = express.Router();

// Get nearby artisans
router.get("/nearby", (req, res) => {
  try {
    const { lat, lng, categoryId } = req.query;
    // Simple mock: return all artisans for now
    let query = `
      SELECT a.*, u.name, u.avatar_url, c.name as category_name 
      FROM artisans a 
      JOIN users u ON a.user_id = u.id 
      JOIN categories c ON a.category_id = c.id
      WHERE a.is_online = 1
    `;
    const params: any[] = [];
    
    if (categoryId) {
      query += " AND a.category_id = ?";
      params.push(categoryId);
    }

    const artisans = db.prepare(query).all(...params) as any[];

    if (lat && lng) {
      const uLat = parseFloat(lat as string);
      const uLng = parseFloat(lng as string);
      
      const nearbyArtisans = artisans.filter(a => {
        // Check preferred cities first
        if (a.preferred_cities && req.query.city) {
          try {
            const preferred = JSON.parse(a.preferred_cities);
            if (Array.isArray(preferred) && preferred.some((c: string) => c.toLowerCase() === (req.query.city as string).toLowerCase())) {
              return true;
            }
          } catch (e) {}
        }

        if (a.latitude && a.longitude) {
          const distance = calculateDistance(uLat, uLng, a.latitude, a.longitude);
          // Use artisan's service radius or default to 10km
          return distance <= (a.service_radius || 10);
        }
        return false;
      });
      return res.json(nearbyArtisans);
    }

    res.json(artisans);
  } catch (error) {
    console.error("Fetch nearby artisans error:", error);
    res.status(500).json({ error: "Failed to fetch nearby artisans" });
  }
});

// Get current artisan profile
router.get("/me", authenticateToken, (req, res) => {
  try {
    const userId = (req as any).user.id;
    const artisan = db.prepare(`
      SELECT a.*, u.name, u.avatar_url, c.name as category_name 
      FROM artisans a 
      JOIN users u ON a.user_id = u.id 
      JOIN categories c ON a.category_id = c.id
      WHERE a.user_id = ?
    `).get(userId) as any;

    if (!artisan) {
      return res.status(404).json({ error: "Artisan profile not found" });
    }

    res.json(artisan);
  } catch (error) {
    console.error("Fetch current artisan error:", error);
    res.status(500).json({ error: "Failed to fetch artisan profile" });
  }
});

// Get artisan by ID
router.get("/:id", (req, res) => {
  try {
    const artisan = db.prepare(`
      SELECT a.*, u.name, u.avatar_url, c.name as category_name 
      FROM artisans a 
      JOIN users u ON a.user_id = u.id 
      JOIN categories c ON a.category_id = c.id
      WHERE a.id = ?
    `).get(req.params.id) as any;

    if (!artisan) {
      return res.status(404).json({ error: "Artisan not found" });
    }

    const portfolio = db.prepare("SELECT * FROM artisan_portfolio WHERE artisan_id = ?").all(req.params.id);
    const services = db.prepare("SELECT * FROM services WHERE category_id = ?").all(artisan.category_id);
    const reviews = db.prepare(`
      SELECT r.*, u.name as client_name, u.avatar_url as client_avatar
      FROM ratings r
      JOIN users u ON r.client_id = u.id
      WHERE r.artisan_id = ?
      ORDER BY r.created_at DESC
    `).all(req.params.id);

    res.json({ ...artisan, portfolio, services, reviews });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch artisan details" });
  }
});

// Get current artisan portfolio
router.get("/me/portfolio", authenticateToken, (req, res) => {
  try {
    const userId = (req as any).user.id;
    const artisan = db.prepare("SELECT id FROM artisans WHERE user_id = ?").get(userId) as any;
    if (!artisan) return res.status(404).json({ error: "Artisan profile not found" });

    const portfolio = db.prepare("SELECT * FROM artisan_portfolio WHERE artisan_id = ? ORDER BY created_at DESC").all(artisan.id);
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch portfolio" });
  }
});

// Add portfolio item
router.post("/me/portfolio", authenticateToken, (req, res) => {
  try {
    const { title, description, imageUrl, videoUrl } = req.body;
    const userId = (req as any).user.id;

    const artisan = db.prepare("SELECT id FROM artisans WHERE user_id = ?").get(userId) as any;
    if (!artisan) return res.status(403).json({ error: "Only artisans can add portfolio items" });

    const id = uuidv4();
    db.prepare(`
      INSERT INTO artisan_portfolio (id, artisan_id, title, description, image_url, video_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, artisan.id, title, description, imageUrl || null, videoUrl || null);

    res.json({ id, title, description, image_url: imageUrl, video_url: videoUrl });
  } catch (error) {
    console.error("Add portfolio item error:", error);
    res.status(500).json({ error: "Failed to add portfolio item" });
  }
});

// Delete portfolio item
router.delete("/me/portfolio/:id", authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const artisan = db.prepare("SELECT id FROM artisans WHERE user_id = ?").get(userId) as any;
    if (!artisan) return res.status(403).json({ error: "Only artisans can delete portfolio items" });

    const result = db.prepare("DELETE FROM artisan_portfolio WHERE id = ? AND artisan_id = ?").run(id, artisan.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: "Portfolio item not found or unauthorized" });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete portfolio item" });
  }
});

// Artisan submits verification data
router.post("/verify", authenticateToken, (req, res) => {
  try {
    const { idDocument, videoUrl, skills } = req.body;
    const userId = (req as any).user.id;

    // Check if artisan exists
    const artisan = db.prepare("SELECT id FROM artisans WHERE user_id = ?").get(userId) as any;
    if (!artisan) return res.status(403).json({ error: "Only artisans can submit verification" });

    // Check if already pending
    const existing = db.prepare("SELECT id FROM artisan_verifications WHERE user_id = ? AND status = 'pending'").get(userId);
    if (existing) return res.status(400).json({ error: "Verification already pending" });

    const id = uuidv4();
    db.prepare(`
      INSERT INTO artisan_verifications (id, user_id, id_document, video_url, skills, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `).run(id, userId, idDocument, videoUrl, skills);

    res.json({ message: "Verification submitted successfully. Admin will review it." });
  } catch (error) {
    console.error("Artisan verification submission error:", error);
    res.status(500).json({ error: "Failed to submit verification" });
  }
});

// Admin gets pending verifications
router.get("/admin/verifications", authenticateToken, (req, res) => {
  try {
    const role = (req as any).user.role;
    if (role !== 'admin') return res.status(403).json({ error: "Unauthorized" });

    const verifications = db.prepare(`
      SELECT av.*, u.name, u.email 
      FROM artisan_verifications av
      JOIN users u ON av.user_id = u.id
      WHERE av.status = 'pending'
    `).all();
    res.json(verifications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch verifications" });
  }
});

// Admin approves/rejects artisan verification
router.patch("/verifications/:id", authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved', 'rejected'
    const role = (req as any).user.role;

    if (role !== 'admin') return res.status(403).json({ error: "Unauthorized" });
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: "Invalid status" });

    const verification = db.prepare("SELECT * FROM artisan_verifications WHERE id = ?").get(id) as any;
    if (!verification) return res.status(404).json({ error: "Verification not found" });

    db.prepare("UPDATE artisan_verifications SET status = ? WHERE id = ?").run(status, id);

    if (status === 'approved') {
      db.prepare("UPDATE artisans SET is_verified = 1 WHERE user_id = ?").run(verification.user_id);
      
      // Update artisan skills if provided in verification
      if (verification.skills) {
        db.prepare("UPDATE artisans SET expertise = ? WHERE user_id = ?").run(verification.skills, verification.user_id);
      }
    }

    // Notify artisan
    sendNotification(
      verification.user_id,
      "Verification Update",
      `Your artisan verification has been ${status}.`,
      'push',
      '/profile'
    );

    res.json({ message: `Verification ${status} successfully` });
  } catch (error) {
    console.error("Admin verification update error:", error);
    res.status(500).json({ error: "Failed to update verification" });
  }
});

// Update artisan location and service settings
router.patch("/settings", authenticateToken, (req, res) => {
  try {
    const { latitude, longitude, city, serviceRadius, preferredCities, workingHours, isOnline } = req.body;
    const userId = (req as any).user.id;

    const artisan = db.prepare("SELECT id FROM artisans WHERE user_id = ?").get(userId) as any;
    if (!artisan) return res.status(403).json({ error: "Only artisans can update settings" });

    db.prepare(`
      UPDATE artisans 
      SET latitude = COALESCE(?, latitude), 
          longitude = COALESCE(?, longitude), 
          city = COALESCE(?, city), 
          service_radius = COALESCE(?, service_radius), 
          preferred_cities = COALESCE(?, preferred_cities),
          working_hours = COALESCE(?, working_hours),
          is_online = COALESCE(?, is_online)
      WHERE id = ?
    `).run(
      latitude || null, 
      longitude || null, 
      city || null, 
      serviceRadius || null, 
      preferredCities ? JSON.stringify(preferredCities) : null, 
      workingHours ? JSON.stringify(workingHours) : null,
      isOnline !== undefined ? isOnline : null,
      artisan.id
    );

    res.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Update artisan settings error:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

export default router;
