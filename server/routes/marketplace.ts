import express from "express";
import prisma from "../lib/prisma.ts";
import { authenticateToken } from "./auth.ts";
import { getPreferredLanguage, t } from "../lib/i18n.ts";
import { getCache, setCache } from "../lib/redis.ts";

const router = express.Router();

// Get all artisans with optional filters
router.get("/artisans", async (req, res) => {
  try {
    const lang = await getPreferredLanguage(req);
    const { categoryId, category, city, search, isOnline, minRating, minPrice, maxPrice, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};

    const selCatVal = (categoryId || category) as string;
    if (selCatVal && selCatVal !== 'All' && selCatVal !== '') {
      // If the category value contains spaces, it's likely a name, so let's resolve its ID
      if (selCatVal.includes(' ') || selCatVal.includes('&')) {
        const foundCat = await prisma.category.findFirst({
          where: {
            OR: [
              { name: { contains: selCatVal, mode: 'insensitive' } },
              { id: { contains: selCatVal, mode: 'insensitive' } }
            ]
          }
        });
        if (foundCat) {
          where.categoryId = foundCat.id;
        }
      } else {
        // Fallback or exact ID lookup or fallback by matching any category starting with/containing the ID
        const foundCat = await prisma.category.findFirst({
          where: {
            OR: [
              { id: selCatVal },
              { id: { contains: selCatVal, mode: 'insensitive' } },
              { name: { contains: selCatVal, mode: 'insensitive' } }
            ]
          }
        });
        if (foundCat) {
          where.categoryId = foundCat.id;
        } else {
          where.categoryId = selCatVal;
        }
      }
    }

    if (city) {
      where.city = { contains: city as string, mode: 'insensitive' };
    }
    
    if (isOnline === 'true') {
      where.isOnline = true;
    }
    
    if (minRating) {
      where.rating = { gte: Number(minRating) };
    }

    if (search) {
      where.OR = [
        { bio: { contains: search as string, mode: 'insensitive' } },
        { expertise: { contains: search as string, mode: 'insensitive' } },
        { user: { name: { contains: search as string, mode: 'insensitive' } } }
      ];
    }
    
    if (minPrice || maxPrice) {
      where.services = {
        some: {
          price: {
            ...(minPrice ? { gte: Number(minPrice) } : {}),
            ...(maxPrice ? { lte: Number(maxPrice) } : {})
          }
        }
      };
    }

    const artisans = await prisma.artisan.findMany({
      where,
      include: {
        user: { select: { name: true, avatarUrl: true } },
        category: { select: { name: true, id: true } },
        portfolio: { take: 1, orderBy: { createdAt: 'desc' } },
        services: true
      },
      orderBy: { rating: 'desc' },
      skip,
      take
    });

    // Batch translate categories to avoid N+1
    const categoryKeys = Array.from(new Set(artisans.map(a => `cat_${a.category?.id || 'unknown'}`))) as string[];
    const { getTranslations } = await import("../lib/i18n.ts");
    const translations = await getTranslations(categoryKeys, lang);

    const formatted = artisans.map(a => {
      const categoryNameKey = `cat_${a.category?.id || 'unknown'}`;
      const translatedCatName = translations[categoryNameKey];
      
      const artisanServices = a.services || [];
      const servicePrices = artisanServices.map(s => Number(s.price || 0)).filter(p => p > 0);
      const startingPrice = servicePrices.length > 0 ? Math.min(...servicePrices) : 150.00;
      
      return {
        ...a,
        name: a.user?.name,
        avatar_url: a.user?.avatarUrl,
        category_name: translatedCatName !== categoryNameKey ? translatedCatName : (a.category?.name || 'Artisan'),
        starting_price: startingPrice,
        price: startingPrice
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Fetch artisans error:", error);
    res.status(500).json({ error: "Failed to fetch artisans" });
  }
});

// Get artisan by ID
router.get("/artisans/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const lang = await getPreferredLanguage(req);
    const artisan = await prisma.artisan.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, avatarUrl: true } },
        category: { select: { name: true, id: true } },
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

    const categoryNameKey = `cat_${artisan.category?.id || 'unknown'}`;
    const translatedCatName = await t(categoryNameKey, lang);

    const services = await prisma.service.findMany({
      where: { 
        OR: [
          { artisanId: artisan.id },
          { categoryId: artisan.categoryId, artisanId: null }
        ]
      }
    });

    const servicePrices = services.map(s => Number(s.price || 0)).filter(p => p > 0);
    const startingPrice = servicePrices.length > 0 ? Math.min(...servicePrices) : 150.00;

    res.json({ 
      ...artisan,
      name: artisan.user?.name,
      avatar_url: artisan.user?.avatarUrl,
      category_name: translatedCatName !== categoryNameKey ? translatedCatName : (artisan.category?.name || 'Artisan'),
      portfolio: artisan.portfolio,
      services,
      starting_price: startingPrice,
      price: startingPrice,
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

// Favorites
router.get("/my-favorites", authenticateToken, async (req: any, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: { artisan: { include: { user: true, category: true } } },
    });
    const formatted = favorites.map(f => ({
      ...f.artisan,
      name: f.artisan.user?.name,
      avatar_url: f.artisan.user?.avatarUrl,
      category_name: f.artisan.category?.name
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

router.post("/favorites/add", authenticateToken, async (req: any, res) => {
  try {
    const { artisanId } = req.body;
    if (!artisanId)
      return res.status(400).json({ error: "artisanId is required" });

    const favorite = await prisma.favorite.create({
      data: { userId: req.user.id, artisanId },
    });
    res.json(favorite);
  } catch (error) {
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

router.delete("/favorites/remove", authenticateToken, async (req: any, res) => {
  try {
    const { artisanId } = req.body;
    if (!artisanId)
      return res.status(400).json({ error: "artisanId is required" });

    await prisma.favorite.deleteMany({
      where: { userId: req.user.id, artisanId },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});

// Get public marketplace products with filters
router.get("/products", async (req, res) => {
  try {
    const { category, city, minPrice, maxPrice, search, seller, page = "1", limit = "20" } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {
      store: {
        user: { role: "seller" }
      }
    };

    if (category) {
      where.category = category as string;
    }

    if (city) {
      where.store = { 
        ...where.store,
        city: city as string 
      };
    }

    if (seller) {
      where.store = {
        ...where.store,
        name: { contains: seller as string, mode: "insensitive" }
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } }
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        store: {
          select: {
            name: true,
            city: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take
    });

    const formatted = products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      stock: p.stock,
      image_url: p.imageUrl,
      seller_name: p.store?.name,
      seller_city: p.store?.city
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Marketplace products error:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get marketplace categories
router.get("/categories", async (req, res) => {
  try {
    const lang = await getPreferredLanguage(req);
    const cacheKey = `marketplace_categories_${lang}`;

    // Try reading from cache layer
    const cachedCategories = await getCache<any[]>(cacheKey);
    if (cachedCategories) {
      return res.json(cachedCategories);
    }

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
    });
    
    // Batch translate category names
    const categoryKeys = categories.map(cat => `cat_${cat.id}`);
    const { getTranslations } = await import("../lib/i18n.ts");
    const translations = await getTranslations(categoryKeys, lang);
    
    const translatedCategories = categories.map((cat) => {
      const key = `cat_${cat.id}`;
      return {
        ...cat,
        name: translations[key] || cat.name
      };
    });
    
    // Save to cache layer
    await setCache(cacheKey, translatedCategories, 3600);

    res.json(translatedCategories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

export default router;
