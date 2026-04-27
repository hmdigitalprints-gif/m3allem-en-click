import express from "express";
import prisma from "../lib/prisma.ts";
import { authenticateToken } from "./auth.ts";

const router = express.Router();

// GET all services (with search and filter)
router.get("/", async (req, res) => {
  try {
    const { category, search, artisanId } = req.query;
    
    const services = await prisma.service.findMany({
      where: {
        AND: [
          category ? { categoryName: category as string } : {},
          artisanId ? { artisanId: artisanId as string } : {},
          search ? {
            OR: [
              { title: { contains: search as string } },
              { description: { contains: search as string } }
            ]
          } : {}
        ]
      }
    });

    res.json(services);
  } catch (error) {
    console.error("Fetch services error:", error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// GET services by category
router.get("/by-category/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const services = await prisma.service.findMany({
      where: { categoryId }
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch services by category" });
  }
});

// POST a new service (Artisan only)
router.post("/", authenticateToken, async (req: any, res) => {
  try {
    const { title, description, price, categoryName, imageUrl, categoryId } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    if (role !== 'artisan' && role !== 'admin') {
      return res.status(403).json({ error: "Only artisans can create services" });
    }

    // Get artisan ID from user ID
    const artisan = await prisma.artisan.findUnique({
      where: { userId },
      select: { id: true }
    });
    
    if (!artisan && role !== 'admin') {
      return res.status(403).json({ error: "Artisan profile not found" });
    }

    const service = await prisma.service.create({
      data: {
        title,
        description,
        price: Number(price),
        categoryName,
        imageUrl,
        artisanId: artisan?.id || req.body.artisanId,
        categoryId
      }
    });

    res.status(201).json(service);
  } catch (error) {
    console.error("Create service error:", error);
    res.status(500).json({ error: "Failed to create service" });
  }
});

// PATCH a service
router.patch("/:id", authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, categoryName, imageUrl } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) return res.status(404).json({ error: "Service not found" });

    // Check ownership if not admin
    if (role !== 'admin') {
      const artisan = await prisma.artisan.findUnique({
        where: { userId },
        select: { id: true }
      });
      if (!artisan || service.artisanId !== artisan.id) {
        return res.status(403).json({ error: "You can only edit your own services" });
      }
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        title: title ?? undefined,
        description: description ?? undefined,
        price: price !== undefined ? Number(price) : undefined,
        categoryName: categoryName ?? undefined,
        imageUrl: imageUrl ?? undefined
      }
    });

    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ error: "Failed to update service" });
  }
});

// DELETE a service
router.delete("/:id", authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) return res.status(404).json({ error: "Service not found" });

    // Check ownership if not admin
    if (role !== 'admin') {
      const artisan = await prisma.artisan.findUnique({
        where: { userId },
        select: { id: true }
      });
      if (!artisan || service.artisanId !== artisan.id) {
        return res.status(403).json({ error: "You can only delete your own services" });
      }
    }

    await prisma.service.delete({ where: { id } });
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete service" });
  }
});

export default router;
