import express from "express";
import { db } from "../db.ts";
import { authenticateToken } from "./auth.ts";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// GET all services (with search and filter)
router.get("/", (req, res) => {
  try {
    const { category, search, artisanId } = req.query;
    let query = "SELECT * FROM services WHERE 1=1";
    const params: any[] = [];

    if (category) {
      query += " AND category_name = ?";
      params.push(category);
    }

    if (artisanId) {
      query += " AND artisan_id = ?";
      params.push(artisanId);
    }

    if (search) {
      query += " AND (title LIKE ? OR description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    const services = db.prepare(query).all(...params);
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// GET services by category
router.get("/by-category/:categoryId", (req, res) => {
  try {
    const { categoryId } = req.params;
    const services = db.prepare("SELECT * FROM services WHERE category_id = ?").all(categoryId);
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch services by category" });
  }
});

// POST a new service (Artisan only)
router.post("/", authenticateToken, (req, res) => {
  try {
    const { title, description, price, categoryName, imageUrl, categoryId } = req.body;
    const userId = (req as any).user.id;
    const role = (req as any).user.role;

    if (role !== 'artisan' && role !== 'admin') {
      return res.status(403).json({ error: "Only artisans can create services" });
    }

    // Get artisan ID from user ID
    const artisan = db.prepare("SELECT id FROM artisans WHERE user_id = ?").get(userId) as any;
    if (!artisan && role !== 'admin') {
      return res.status(403).json({ error: "Artisan profile not found" });
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO services (id, title, description, price, category_name, image_url, artisan_id, category_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, description, price, categoryName, imageUrl, artisan?.id || req.body.artisanId, categoryId);

    const service = db.prepare("SELECT * FROM services WHERE id = ?").get(id);
    res.status(201).json(service);
  } catch (error) {
    console.error("Create service error:", error);
    res.status(500).json({ error: "Failed to create service" });
  }
});

// PATCH a service
router.patch("/:id", authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, categoryName, imageUrl } = req.body;
    const userId = (req as any).user.id;
    const role = (req as any).user.role;

    const service = db.prepare("SELECT * FROM services WHERE id = ?").get(id) as any;
    if (!service) return res.status(404).json({ error: "Service not found" });

    // Check ownership if not admin
    if (role !== 'admin') {
      const artisan = db.prepare("SELECT id FROM artisans WHERE user_id = ?").get(userId) as any;
      if (!artisan || service.artisan_id !== artisan.id) {
        return res.status(403).json({ error: "You can only edit your own services" });
      }
    }

    db.prepare(`
      UPDATE services 
      SET title = COALESCE(?, title), 
          description = COALESCE(?, description), 
          price = COALESCE(?, price), 
          category_name = COALESCE(?, category_name), 
          image_url = COALESCE(?, image_url)
      WHERE id = ?
    `).run(title, description, price, categoryName, imageUrl, id);

    const updatedService = db.prepare("SELECT * FROM services WHERE id = ?").get(id);
    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ error: "Failed to update service" });
  }
});

// DELETE a service
router.delete("/:id", authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const role = (req as any).user.role;

    const service = db.prepare("SELECT * FROM services WHERE id = ?").get(id) as any;
    if (!service) return res.status(404).json({ error: "Service not found" });

    // Check ownership if not admin
    if (role !== 'admin') {
      const artisan = db.prepare("SELECT id FROM artisans WHERE user_id = ?").get(userId) as any;
      if (!artisan || service.artisan_id !== artisan.id) {
        return res.status(403).json({ error: "You can only delete your own services" });
      }
    }

    db.prepare("DELETE FROM services WHERE id = ?").run(id);
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete service" });
  }
});

export default router;
