import express from "express";
import prisma from "../lib/prisma.ts";
type Role = string;
import { authenticateToken } from "./auth.ts";

const router = express.Router();

router.use((req, res, next) => {
  console.log(`[Admin Router] Request received: ${req.method} ${req.url}`);
  next();
});

// Admin middleware
const authenticateAdmin = (req: any, res: any, next: any) => {
  console.log(`[Admin Auth] Attempting to access: ${req.method} ${req.originalUrl}`);
  authenticateToken(req, res, () => {
    if (!req.user) {
      console.error("[Admin Auth] No user found in request after authenticateToken");
      return res.status(401).json({ 
        error: "Authentication failed", 
        details: "No user found in request context" 
      });
    }
    if (req.user.role !== 'admin') {
      console.error(`[Admin Auth] User ${req.user.id} with role ${req.user.role} attempted to access admin route`);
      return res.status(403).json({ 
        error: "Admin access required", 
        currentRole: req.user.role,
        userId: req.user.id
      });
    }
    console.log(`[Admin Auth] Access granted for user: ${req.user.id}`);
    next();
  });
};

// Admin logout
router.post("/logout", authenticateAdmin, async (req, res) => {
  res.json({ message: "Logged out successfully" });
});

// Get admin dashboard stats
router.get("/stats", authenticateAdmin, async (req, res) => {
  try {
    const [totalUsers, totalArtisans, totalBookings, totalRevenue, activeArtisans] = await Promise.all([
      prisma.user.count(),
      prisma.artisan.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({
        _sum: { adminAmount: true },
        where: { bookingStatus: 'completed' }
      }),
      prisma.artisan.count({ where: { isOnline: true } })
    ]);
    
    res.json({
      totalUsers,
      totalArtisans,
      totalBookings,
      totalRevenue: totalRevenue._sum.adminAmount || 0,
      activeArtisans
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
});

// Get platform analytics
router.get("/analytics", authenticateAdmin, async (req, res) => {
  try {
    // 1. Revenue Trends (Last 7 months)
    const revenueTrends = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      
      const revenue = await prisma.booking.aggregate({
        _sum: { adminAmount: true },
        where: {
          bookingStatus: 'completed',
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      });
      
      revenueTrends.push({
        name: monthName,
        revenue: revenue._sum.adminAmount || 0
      });
    }

    // 2. Booking Status Summary
    const bookingSummaryRaw = await prisma.booking.groupBy({
      by: ['bookingStatus'],
      _count: { _all: true }
    });
    const bookingSummary = bookingSummaryRaw.map(row => ({
      name: row.bookingStatus,
      value: row._count._all
    }));

    // 3. Recent Users
    const recentUsers = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json({
      revenueTrends,
      bookingSummary,
      recentUsers
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// Manage categories and commission rates
router.get("/categories", authenticateAdmin, async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.post("/categories", authenticateAdmin, async (req, res) => {
  try {
    const { name, icon, commission_rate } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    
    const category = await prisma.category.create({
      data: {
        name,
        icon: icon || null,
        commissionRate: commission_rate ? Number(commission_rate) : null
      }
    });
    
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: "Failed to create category" });
  }
});

router.delete("/categories/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete category" });
  }
});

router.patch("/categories/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { commission_rate } = req.body;
    
    const rate = (commission_rate === null || commission_rate === undefined) ? null : Number(commission_rate);
    
    await prisma.category.update({
      where: { id },
      data: { commissionRate: rate }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update category" });
  }
});

router.post("/categories/:id/toggle-active", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return res.status(404).json({ error: "Category not found" });

    const updated = await prisma.category.update({
      where: { id },
      data: { isActive: !category.isActive }
    });
    res.json({ success: true, is_active: updated.isActive });
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle category status" });
  }
});

// Artisan verification
router.get("/verifications", authenticateAdmin, async (req, res) => {
  try {
    const verifications = await prisma.artisanVerification.findMany({
      where: { status: 'pending' },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            artisan: { select: { id: true } }
          }
        }
      }
    });
    
    const formatted = verifications.map(v => ({
      ...v,
      name: v.user?.name,
      phone: v.user?.phone,
      artisan_id: v.user?.artisan?.id
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch verifications" });
  }
});

router.post("/verifications/:id/approve", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const verification = await prisma.artisanVerification.findUnique({
      where: { id }
    });
    if (!verification) return res.status(404).json({ error: "Verification not found" });

    await prisma.$transaction([
      prisma.artisanVerification.update({
        where: { id },
        data: { status: 'approved' }
      }),
      prisma.artisan.update({
        where: { userId: verification.userId || "" },
        data: { isVerified: true }
      }),
      prisma.user.update({
        where: { id: verification.userId || "" },
        data: { verified: true }
      })
    ]);
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error approving verification:", error);
    res.status(500).json({ error: "Failed to approve verification" });
  }
});

router.post("/verifications/:id/reject", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.artisanVerification.update({
      where: { id },
      data: { status: 'rejected' }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to reject verification" });
  }
});

// User management
router.get("/users", authenticateAdmin, async (req, res) => {
  try {
    const { role } = req.query;
    const users = await prisma.user.findMany({
      where: role ? { role: role as Role } : {},
      select: { id: true, name: true, phone: true, role: true, verified: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.delete("/users/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

router.patch("/users/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, role, verified } = req.body;
    
    await prisma.user.update({
      where: { id },
      data: {
        name: name ?? undefined,
        phone: phone ?? undefined,
        role: role ?? undefined,
        verified: verified !== undefined ? !!verified : undefined
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Artisan management
router.get("/artisans", authenticateAdmin, async (req, res) => {
  try {
    const artisans = await prisma.artisan.findMany({
      include: {
        user: { select: { name: true, phone: true, avatarUrl: true } },
        category: { select: { name: true } }
      }
    });
    
    const formatted = artisans.map(a => ({
      ...a,
      name: a.user.name,
      phone: a.user.phone,
      avatar_url: a.user.avatarUrl,
      category_name: a.category?.name
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch artisans" });
  }
});

router.post("/artisans/:id/toggle-featured", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const artisan = await prisma.artisan.findUnique({ where: { id } });
    if (!artisan) return res.status(404).json({ error: "Artisan not found" });

    const updated = await prisma.artisan.update({
      where: { id },
      data: { isFeatured: !artisan.isFeatured }
    });
    res.json({ success: true, is_featured: updated.isFeatured });
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle featured status" });
  }
});

router.post("/artisans/:id/verify", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;
    await prisma.artisan.update({
      where: { id },
      data: { isVerified: !!verified }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify artisan" });
  }
});

// Company management
router.get("/companies", authenticateAdmin, async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      include: { user: { select: { email: true, phone: true } } }
    });
    
    const formatted = companies.map(c => ({
      ...c,
      email: c.user.email,
      phone: c.user.phone
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
});

router.post("/companies", authenticateAdmin, async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Name and email are required" });

    const company = await prisma.$transaction(async (tx) => {
      // 1. Create a user for the company if it doesn't exist
      let user = await tx.user.findFirst({
        where: { OR: [{ email }, { phone }] }
      });
      
      if (!user) {
        user = await tx.user.create({
          data: {
            name,
            email,
            phone,
            role: 'company',
            verified: true
          }
        });
      }

      // 2. Create the company record
      return tx.company.create({
        data: {
          userId: user.id,
          name,
          address,
          isVerified: true
        },
        include: { user: { select: { email: true, phone: true } } }
      });
    });

    const formatted = {
      ...company,
      email: company.user.email,
      phone: company.user.phone
    };

    res.status(201).json(formatted);
  } catch (error) {
    console.error("Error in create company route:", error);
    res.status(500).json({ error: "Failed to create company" });
  }
});

// Wallets
router.get("/wallets", authenticateAdmin, async (req, res) => {
  try {
    const wallets = await prisma.wallet.findMany({
      include: { user: { select: { name: true, avatarUrl: true } } }
    });
    
    const formatted = wallets.map(w => ({
      ...w,
      name: w.user.name,
      avatar_url: w.user.avatarUrl
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch wallets" });
  }
});

router.get("/transactions", authenticateAdmin, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        wallet: {
          include: { user: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    const formatted = transactions.map(t => ({
      ...t,
      user_name: t.wallet.user.name
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Disputes
router.get("/disputes", authenticateAdmin, async (req, res) => {
  try {
    const disputes = await prisma.dispute.findMany({
      include: {
        client: { select: { name: true } },
        artisan: {
          include: { user: { select: { name: true } } }
        }
      }
    });
    
    const formatted = disputes.map(d => ({
      ...d,
      client_name: d.client.name,
      artisan_name: d.artisan.user.name
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch disputes" });
  }
});

router.post("/disputes/:id/resolve", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;
    await prisma.dispute.update({
      where: { id },
      data: { status: 'resolved', resolution }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to resolve dispute" });
  }
});

// Cities
router.get("/cities", authenticateAdmin, async (req, res) => {
  try {
    const cities = await prisma.city.findMany();
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cities" });
  }
});

router.post("/cities", authenticateAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    const city = await prisma.city.create({
      data: { name }
    });
    res.json(city);
  } catch (error) {
    res.status(500).json({ error: "Failed to add city" });
  }
});

router.delete("/cities/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.city.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete city" });
  }
});

router.post("/cities/:id/toggle-active", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const city = await prisma.city.findUnique({ where: { id } });
    if (!city) return res.status(404).json({ error: "City not found" });
    
    const updated = await prisma.city.update({
      where: { id },
      data: { isActive: !city.isActive }
    });
    res.json({ success: true, is_active: updated.isActive });
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle city status" });
  }
});

// Subscriptions
router.get("/subscriptions", authenticateAdmin, async (req, res) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subscription plans" });
  }
});

// Audit Logs
router.get("/audit-logs", authenticateAdmin, async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    
    const formatted = logs.map(l => ({
      ...l,
      user_name: l.user?.name
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

// Notifications
router.get("/notifications/all", authenticateAdmin, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    
    const formatted = notifications.map(n => ({
      ...n,
      user_name: n.user.name
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

router.post("/notifications/send", authenticateAdmin, async (req, res) => {
  try {
    const { userId, title, message, type, link } = req.body;
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: type || 'push',
        link: link || null
      }
    });
    res.json({ success: true, id: notification.id });
  } catch (error) {
    res.status(500).json({ error: "Failed to send notification" });
  }
});

// Cash Collections
router.get("/cash-collections", authenticateAdmin, async (req, res) => {
  try {
    const collections = await prisma.booking.groupBy({
      by: ['artisanId'],
      where: {
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        bookingStatus: 'completed'
      },
      _sum: {
        price: true,
        adminAmount: true
      }
    });

    const formatted = await Promise.all(collections.map(async (c) => {
      const artisan = await prisma.artisan.findUnique({
        where: { id: c.artisanId },
        include: { user: { select: { name: true, avatarUrl: true } } }
      });
      return {
        artisan_id: c.artisanId,
        artisan_name: artisan?.user.name,
        avatar_url: artisan?.user.avatarUrl,
        total_cash_handled: c._sum.price || 0,
        commission_owed: c._sum.adminAmount || 0
      };
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cash collections" });
  }
});

router.post("/cash-collections/:id/record-payment", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  res.json({ success: true, amount });
});

// Booking management
router.get("/bookings", authenticateAdmin, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        client: { select: { name: true } },
        artisan: { include: { user: { select: { name: true } } } },
        service: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const formatted = bookings.map(b => ({
      ...b,
      client_name: b.client.name,
      artisan_name: b.artisan.user.name,
      service_title: b.service?.title
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Alias /orders to /bookings
router.get("/orders", authenticateAdmin, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        client: { select: { name: true } },
        artisan: { include: { user: { select: { name: true } } } },
        service: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const formatted = bookings.map(b => ({
      ...b,
      client_name: b.client.name,
      artisan_name: b.artisan.user.name,
      service_title: b.service?.title
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.patch("/bookings/:id/admin_override", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { booking_status, payment_status, price, admin_amount, artisan_amount } = req.body;
    
    await prisma.booking.update({
      where: { id },
      data: {
        bookingStatus: booking_status ?? undefined,
        paymentStatus: payment_status ?? undefined,
        price: price !== undefined ? Number(price) : undefined,
        adminAmount: admin_amount !== undefined ? Number(admin_amount) : undefined,
        artisanAmount: artisan_amount !== undefined ? Number(artisan_amount) : undefined
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to override booking" });
  }
});

// Settings management
router.get("/settings", authenticateAdmin, async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsMap);
  } catch (error) {
    console.error("[Admin Router] Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.post("/settings", authenticateAdmin, async (req, res) => {
  try {
    const settings = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: "Invalid settings data" });
    }

    await prisma.$transaction(
      Object.entries(settings).map(([key, value]) => 
        prisma.setting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) }
        })
      )
    );

    res.json({ success: true });
  } catch (error) {
    console.error("[Admin Router] Error updating settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// Language management
router.get("/languages", authenticateAdmin, async (req, res) => {
  try {
    const languages = await prisma.language.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(languages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch languages" });
  }
});

router.post("/languages", authenticateAdmin, async (req, res) => {
  try {
    const { code, name, native_name, is_rtl } = req.body;
    if (!code || !name || !native_name) {
      return res.status(400).json({ error: "Code, name, and native name are required" });
    }
    
    const language = await prisma.language.create({
      data: {
        code,
        name,
        nativeName: native_name,
        isRtl: !!is_rtl
      }
    });
    
    res.status(201).json(language);
  } catch (error) {
    console.error("Error adding language:", error);
    res.status(500).json({ error: "Failed to add language" });
  }
});

router.post("/languages/:code/toggle", authenticateAdmin, async (req, res) => {
  try {
    const { code } = req.params;
    const { is_active } = req.body;
    await prisma.language.update({
      where: { code },
      data: { isActive: !!is_active }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle language status" });
  }
});

// Translation management
router.get("/translations", authenticateAdmin, async (req, res) => {
  try {
    const translations = await prisma.translation.findMany({
      orderBy: [{ key: 'asc' }, { languageCode: 'asc' }]
    });
    res.json(translations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch translations" });
  }
});

router.post("/translations", authenticateAdmin, async (req, res) => {
  try {
    const { key, language_code, value } = req.body;
    if (!key || !language_code || !value) {
      return res.status(400).json({ error: "Key, language_code, and value required" });
    }

    await prisma.translation.upsert({
      where: {
        key_languageCode: {
          key,
          languageCode: language_code
        }
      },
      update: { value },
      create: {
        key,
        languageCode: language_code,
        value
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error saving translation:", error);
    res.status(500).json({ error: "Failed to save translation" });
  }
});

router.delete("/translations/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.translation.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete translation" });
  }
});

router.put("/translations/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body;
    if (!value) {
      return res.status(400).json({ error: "Value required" });
    }
    await prisma.translation.update({
      where: { id },
      data: { value }
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating translation:", error);
    res.status(500).json({ error: "Failed to update translation" });
  }
});

// Material Sellers
router.get("/material-sellers", authenticateAdmin, async (req, res) => {
  try {
    const sellers = await prisma.user.findMany({
      where: { role: 'seller' },
      include: {
        stores: {
          include: {
            _count: { select: { products: true } }
          }
        }
      }
    });
    
    const formatted = sellers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      is_verified: u.verified,
      store_name: u.stores[0]?.name,
      category: u.stores[0]?.city, // category was used as city in some places or vice versa? 
      product_count: u.stores[0]?._count.products || 0,
      rating: 4.5
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error("Error fetching material sellers:", error);
    res.status(500).json({ error: "Failed to fetch material sellers" });
  }
});

router.post("/material-sellers", authenticateAdmin, async (req, res) => {
  try {
    const { name, email, phone, category } = req.body;
    
    const seller = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          phone,
          role: 'seller',
          verified: true
        }
      });

      await tx.store.create({
        data: {
          userId: user.id,
          name,
          city: category, // category was used as city in the original SQL
          isVerified: true
        }
      });
      
      return user;
    });

    res.status(201).json({ ...seller, is_verified: true, category });
  } catch (error) {
    console.error("Error creating material seller:", error);
    res.status(500).json({ error: "Failed to create material seller" });
  }
});

// Fraud Alerts
router.get("/fraud-alerts", authenticateAdmin, async (req, res) => {
  try {
    const alerts = await prisma.fraudAlert.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    const formatted = alerts.map(f => ({
      ...f,
      user_name: f.user?.name
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch fraud alerts" });
  }
});

// Escrows
router.get("/escrows", authenticateAdmin, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      take: 10,
      include: {
        order: {
          include: {
            client: { select: { name: true } },
            artisan: { include: { user: { select: { name: true } } } }
          }
        }
      }
    });
    
    const formatted = payments.map(p => ({
      id: p.id,
      project_name: `Project ${p.orderId}`,
      parties: `${p.order?.client?.name} & ${p.order?.artisan?.user?.name}`,
      amount: p.amount,
      release_date: p.createdAt,
      status: 'locked'
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error("Error fetching escrows:", error);
    res.status(500).json({ error: "Failed to fetch escrows" });
  }
});

export default router;
