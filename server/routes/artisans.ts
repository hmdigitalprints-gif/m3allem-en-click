import express from "express";
import prisma from "../lib/prisma.ts";
import { authenticateToken } from "./auth.ts";
import { sendNotification } from "../services/notificationService.ts";
import { calculateDistance } from "../lib/utils.ts";

const router = express.Router();

// Get nearby artisans
router.get("/nearby", async (req, res) => {
  try {
    const { lat, lng, categoryId, city } = req.query;
    
    const artisans = await prisma.artisan.findMany({
      where: {
        isOnline: true,
        ...(categoryId ? { categoryId: categoryId as string } : {})
      },
      include: {
        user: { select: { name: true, avatarUrl: true } },
        category: { select: { name: true } }
      }
    });

    const formatted = artisans.map(a => ({
      ...a,
      name: a.user?.name,
      avatar_url: a.user?.avatarUrl,
      category_name: a.category?.name
    }));

    if (lat && lng) {
      const uLat = parseFloat(lat as string);
      const uLng = parseFloat(lng as string);
      
      const nearbyArtisans = formatted.filter(a => {
        // Check preferred cities first
        if (a.preferredCities && city) {
          try {
            const preferred = a.preferredCities;
            if (Array.isArray(preferred) && preferred.some((c: any) => String(c).toLowerCase() === (city as string).toLowerCase())) {
              return true;
            }
          } catch (e) {}
        }

        if (a.latitude && a.longitude) {
          const distance = calculateDistance(uLat, uLng, Number(a.latitude), Number(a.longitude));
          // Use artisan's service radius or default to 10km
          return distance <= (Number(a.serviceRadius) || 10);
        }
        return false;
      });
      return res.json(nearbyArtisans);
    }

    res.json(formatted);
  } catch (error) {
    console.error("Fetch nearby artisans error:", error);
    res.status(500).json({ error: "Failed to fetch nearby artisans" });
  }
});

// Get current artisan profile
router.get("/me", authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const artisan = await prisma.artisan.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, avatarUrl: true } },
        category: { select: { name: true } }
      }
    });

    if (!artisan) {
      return res.status(404).json({ error: "Artisan profile not found" });
    }

    res.json({
      ...artisan,
      name: artisan.user?.name,
      avatar_url: artisan.user?.avatarUrl,
      category_name: artisan.category?.name
    });
  } catch (error) {
    console.error("Fetch current artisan error:", error);
    res.status(500).json({ error: "Failed to fetch artisan profile" });
  }
});

// Get artisan by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const artisan = await prisma.artisan.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, avatarUrl: true } },
        category: { select: { name: true } },
        portfolio: { orderBy: { createdAt: 'desc' } },
        ratings: {
          include: { client: { select: { name: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!artisan) {
      return res.status(404).json({ error: "Artisan not found" });
    }

    const services = await prisma.service.findMany({
      where: { categoryId: artisan.categoryId }
    });

    res.json({ 
      ...artisan,
      name: artisan.user?.name,
      avatar_url: artisan.user?.avatarUrl,
      category_name: artisan.category?.name,
      portfolio: artisan.portfolio,
      services,
      reviews: artisan.ratings.map(r => ({
        ...r,
        client_name: r.client?.name,
        client_avatar: r.client?.avatarUrl
      }))
    });
  } catch (error) {
    console.error("Fetch artisan details error:", error);
    res.status(500).json({ error: "Failed to fetch artisan details" });
  }
});

// Get current artisan portfolio
router.get("/me/portfolio", authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const artisan = await prisma.artisan.findUnique({
      where: { userId },
      select: { id: true }
    });
    if (!artisan) return res.status(404).json({ error: "Artisan profile not found" });

    const portfolio = await prisma.artisanPortfolio.findMany({
      where: { artisanId: artisan.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch portfolio" });
  }
});

// Get current artisan reviews
router.get("/me/reviews", authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const artisan = await prisma.artisan.findUnique({
      where: { userId },
      select: { id: true }
    });
    if (!artisan) return res.status(404).json({ error: "Artisan profile not found" });

    const reviews = await prisma.rating.findMany({
      where: { artisanId: artisan.id },
      include: { client: { select: { name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    const formatted = reviews.map(r => ({
      ...r,
      client_name: r.client.name,
      client_avatar: r.client.avatarUrl
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// Get current artisan transactions
router.get("/me/transactions", authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { id: true }
    });
    if (!wallet) return res.json([]);

    const transactions = await prisma.transaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Update artisan profile
router.patch("/me/profile", authenticateToken, async (req: any, res) => {
  try {
    const { bio, expertise, yearsExperience, certifications, serviceRadius } = req.body;
    const userId = req.user.id;

    const artisan = await prisma.artisan.findUnique({
      where: { userId },
      select: { id: true }
    });
    if (!artisan) return res.status(404).json({ error: "Artisan profile not found" });

    await prisma.artisan.update({
      where: { id: artisan.id },
      data: {
        bio: bio ?? undefined,
        expertise: expertise ?? undefined,
        yearsExperience: yearsExperience ?? undefined,
        certifications: certifications ?? undefined,
        serviceRadius: serviceRadius ?? undefined
      }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Add portfolio item
router.post("/me/portfolio", authenticateToken, async (req: any, res) => {
  try {
    const { title, description, imageUrl, videoUrl } = req.body;
    const userId = req.user.id;

    const artisan = await prisma.artisan.findUnique({
      where: { userId },
      select: { id: true }
    });
    if (!artisan) return res.status(403).json({ error: "Only artisans can add portfolio items" });

    const item = await prisma.artisanPortfolio.create({
      data: {
        artisanId: artisan.id,
        title,
        description,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null
      }
    });

    res.json(item);
  } catch (error) {
    console.error("Add portfolio item error:", error);
    res.status(500).json({ error: "Failed to add portfolio item" });
  }
});

// Delete portfolio item
router.delete("/me/portfolio/:id", authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const artisan = await prisma.artisan.findUnique({
      where: { userId },
      select: { id: true }
    });
    if (!artisan) return res.status(403).json({ error: "Only artisans can delete portfolio items" });

    const deleted = await prisma.artisanPortfolio.deleteMany({
      where: { id, artisanId: artisan.id }
    });
    
    if (deleted.count === 0) {
      return res.status(404).json({ error: "Portfolio item not found or unauthorized" });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete portfolio item" });
  }
});

// Artisan submits verification data
router.post("/verify", authenticateToken, async (req: any, res) => {
  try {
    const { idDocument, videoUrl, skills } = req.body;
    const userId = req.user.id;

    // Check if artisan exists
    const artisan = await prisma.artisan.findUnique({
      where: { userId },
      select: { id: true }
    });
    if (!artisan) return res.status(403).json({ error: "Only artisans can submit verification" });

    // Check if already pending
    const existing = await prisma.artisanVerification.findFirst({
      where: { userId, status: 'pending' }
    });
    if (existing) return res.status(400).json({ error: "Verification already pending" });

    await prisma.artisanVerification.create({
      data: {
        userId,
        idDocument,
        videoUrl,
        skills,
        status: 'pending'
      }
    });

    res.json({ message: "Verification submitted successfully. Admin will review it." });
  } catch (error) {
    console.error("Artisan verification submission error:", error);
    res.status(500).json({ error: "Failed to submit verification" });
  }
});

// Admin gets pending verifications
router.get("/admin/verifications", authenticateToken, async (req: any, res) => {
  try {
    const role = req.user.role;
    if (role !== 'admin') return res.status(403).json({ error: "Unauthorized" });

    const verifications = await prisma.artisanVerification.findMany({
      where: { status: 'pending' },
      include: { user: { select: { name: true, email: true } } }
    });
    
    const formatted = verifications.map(v => ({
      ...v,
      name: v.user.name,
      email: v.user.email
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch verifications" });
  }
});

// Admin approves/rejects artisan verification
router.patch("/verifications/:id", authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved', 'rejected'
    const role = req.user.role;

    if (role !== 'admin') return res.status(403).json({ error: "Unauthorized" });
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: "Invalid status" });

    const verification = await prisma.artisanVerification.findUnique({
      where: { id }
    });
    if (!verification) return res.status(404).json({ error: "Verification not found" });

    await prisma.$transaction(async (tx) => {
      await tx.artisanVerification.update({
        where: { id },
        data: { status }
      });

      if (status === 'approved') {
        await tx.artisan.update({
          where: { userId: verification.userId },
          data: {
            isVerified: true,
            expertise: verification.skills || undefined
          }
        });
      }
    });

    // Notify artisan
    sendNotification(
      verification.userId,
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
router.patch("/settings", authenticateToken, async (req: any, res) => {
  try {
    const { latitude, longitude, city, serviceRadius, preferredCities, workingHours, isOnline } = req.body;
    const userId = req.user.id;

    const artisan = await prisma.artisan.findUnique({
      where: { userId },
      select: { id: true }
    });
    if (!artisan) return res.status(403).json({ error: "Only artisans can update settings" });

    await prisma.artisan.update({
      where: { id: artisan.id },
      data: {
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        city: city ?? undefined,
        serviceRadius: serviceRadius ?? undefined,
        preferredCities: preferredCities ? JSON.stringify(preferredCities) : undefined,
        workingHours: workingHours ? JSON.stringify(workingHours) : undefined,
        isOnline: isOnline !== undefined ? isOnline : undefined
      }
    });

    res.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Update artisan settings error:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// Withdraw funds
router.post("/withdraw", authenticateToken, async (req: any, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    const transaction = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet || wallet.balance < amount) {
        throw new Error("Insufficient funds");
      }

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } }
      });

      return tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type: 'withdrawal',
          status: 'pending',
          description: 'Withdrawal request'
        }
      });
    });

    res.json({ success: true, transactionId: transaction.id });
  } catch (error) {
    if (error instanceof Error && error.message === "Insufficient funds") {
      return res.status(400).json({ error: error.message });
    }
    console.error("Withdrawal error:", error);
    res.status(500).json({ error: "Failed to process withdrawal" });
  }
});

// Delete a service
router.delete('/me/services/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const artisan = await prisma.artisan.findUnique({
      where: { userId },
      select: { id: true }
    });
    if (!artisan) return res.status(403).json({ error: "Unauthorized" });

    const deleted = await prisma.service.deleteMany({
      where: { id, artisanId: artisan.id }
    });
    
    if (deleted.count > 0) {
      res.json({ message: 'Service deleted successfully' });
    } else {
      res.status(404).json({ error: 'Service not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// Delete a portfolio item
router.delete('/me/portfolio/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const artisan = await prisma.artisan.findUnique({
      where: { userId },
      select: { id: true }
    });
    if (!artisan) return res.status(403).json({ error: "Unauthorized" });

    const deleted = await prisma.artisanPortfolio.deleteMany({
      where: { id, artisanId: artisan.id }
    });
    
    if (deleted.count > 0) {
      res.json({ message: 'Portfolio item deleted successfully' });
    } else {
      res.status(404).json({ error: 'Portfolio item not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete portfolio item' });
  }
});

export default router;
