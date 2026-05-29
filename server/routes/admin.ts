import express from "express";
import prisma from "../lib/prisma.ts";
import { Role } from "@prisma/client";
import { authenticateToken, authenticateAdmin } from "./auth.ts";
import { WithdrawalService } from "../modules/wallet/withdrawal.service.ts";

const router = express.Router();

router.use((req, res, next) => {
  console.log(`[Admin Router] Request received: ${req.method} ${req.url}`);
  next();
});

// Admin logout
router.post("/logout", authenticateAdmin, async (req, res) => {
  res.json({ message: "Logged out successfully" });
});

import { AnalyticsService } from "../modules/analytics/analytics.service.ts";

// Get admin dashboard stats
router.get("/stats", authenticateAdmin, async (req, res) => {
  try {
    const stats = await AnalyticsService.getPlatformStats();
    const activeArtisans = await prisma.artisan.count({ where: { isOnline: true } });
    
    res.json({
      totalUsers: stats.totalUsers,
      totalArtisans: stats.totalArtisans,
      totalBookings: stats.totalBookings,
      totalRevenue: stats.totalCommission > 0 ? stats.totalCommission : (stats.totalRevenue * 0.15), // Fallback
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
    const sevenMonthsAgo = new Date();
    sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 6);
    sevenMonthsAgo.setDate(1);
    sevenMonthsAgo.setHours(0, 0, 0, 0);
    
    // Efficiently group by month using database grouping if possible, 
    // or at least optimize the query
    const revenueDataRaw = await prisma.booking.findMany({
      where: {
        bookingStatus: 'completed',
        createdAt: { gte: sevenMonthsAgo }
      },
      select: {
        createdAt: true,
        price: true
      }
    });

    // Since Prisma groupBy doesn't directly support month grouping in all versions, 
    // we'll keep the logic but optimize it to use the aggregated data
    const revenueTrends = [];
    const now = new Date();
    const COMMISSION_RATE = 0.15; // 15% fallback commission

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const monthYear = d.getFullYear();
      const monthIndex = d.getMonth();
      
      const monthRevenue = revenueDataRaw
        .filter(b => {
          const date = new Date(b.createdAt);
          return date.getFullYear() === monthYear && date.getMonth() === monthIndex;
        })
        .reduce((sum, b) => sum + Number(b.price || 0) * COMMISSION_RATE, 0);
      
      revenueTrends.push({
        name: monthName,
        revenue: monthRevenue
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
        category: { select: { name: true } },
        _count: {
          select: { bookings: true }
        }
      }
    });
    
    const formatted = artisans.map(a => ({
      ...a,
      name: a.user.name,
      phone: a.user.phone,
      avatar_url: a.user.avatarUrl,
      category_name: a.category?.name,
      total_jobs: a._count.bookings
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
      user_name: t.wallet?.user?.name
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

router.get("/wallet-diagnostics", authenticateAdmin, async (req, res) => {
  try {
    const wallets = await prisma.wallet.findMany({
      include: {
        user: { select: { name: true } },
        transactions: true
      }
    });

    const diagnostics = wallets.map(w => {
      let calcBalance = 0;
      let calcLocked = 0;
      
      for (const t of w.transactions) {
        if (t.status === 'completed' || t.status === 'successful' || t.status === 'success' || !t.status) {
          if (t.type === 'topup' || t.type === 'refund' || t.type === 'release') {
            calcBalance += Number(t.amount || 0);
          } else if (t.type === 'payment' || t.type === 'withdrawal' || t.type === 'commission') {
            calcBalance -= Number(t.amount || 0);
          }
        } else if (t.status === 'pending') {
          if (t.type === 'withdrawal' || t.type === 'payment') {
            calcLocked += Number(t.amount || 0);
          }
        }
      }

      const actualBalance = Number(w.balance || 0);
      const actualLocked = Number(w.lockedBalance || 0);
      
      return {
        wallet_id: w.id,
        user_id: w.userId,
        user_name: w.user?.name || 'Unknown',
        actual_balance: actualBalance,
        calculated_balance: calcBalance,
        balance_discrepancy: actualBalance - calcBalance,
        actual_locked: actualLocked,
        calculated_locked: calcLocked,
        locked_discrepancy: actualLocked - calcLocked,
        transaction_count: w.transactions.length,
        is_synchronized: (actualBalance === calcBalance) && (actualLocked === calcLocked)
      };
    });

    res.json(diagnostics);
  } catch (error) {
    console.error("Diagnostic error:", error);
    res.status(500).json({ error: "Failed to generate wallet diagnostic report" });
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
        bookingStatus: 'completed',
        artisanId: { not: null }
      },
      _sum: {
        price: true
      }
    });

    const artisanIds = collections.map(c => c.artisanId).filter((id): id is string => id !== null);
    const artisans = await prisma.artisan.findMany({
      where: { id: { in: artisanIds } },
      include: { user: { select: { name: true, avatarUrl: true } } }
    });

    const artisanMap = artisans.reduce((acc, a) => {
      acc[a.id] = a;
      return acc;
    }, {} as Record<string, any>);

    const COMMISSION_RATE = 0.15;
    const formatted = collections.map(c => {
      const artisan = artisanMap[c.artisanId!];
      return {
        artisan_id: c.artisanId,
        artisan_name: artisan?.user.name,
        avatar_url: artisan?.user.avatarUrl,
        total_cash_handled: c._sum.price || 0,
        commission_owed: Number(c._sum.price || 0) * COMMISSION_RATE
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Cash collections error:", error);
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
        price: price !== undefined ? Number(price) : undefined
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

// ─── Payment Settings (super admin only) ─────────────────────────────────────
import {
  encryptValue,
  decryptValue,
  invalidateStripeCache,
  getStripe,
} from "../modules/payment/payment.service.ts";
import { auditService } from "../services/auditService.ts";

const PAYMENT_SETTING_KEYS = [
  "stripe_secret_key",
  "stripe_webhook_secret",
  "stripe_public_key",
  "stripe_enabled",
];

router.get("/payment-settings", authenticateAdmin, async (req: any, res) => {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: PAYMENT_SETTING_KEYS } },
    });

    // Never return actual secret values to the frontend — return masked versions
    const safeSettings: Record<string, any> = {};
    for (const s of settings) {
      if (s.key === "stripe_enabled") {
        safeSettings[s.key] = s.value;
      } else if (s.value) {
        // Show only last 4 chars so admin knows a value is set
        try {
          const plain = decryptValue(s.value);
          safeSettings[s.key] = plain.length > 4
            ? `${"*".repeat(plain.length - 4)}${plain.slice(-4)}`
            : "****";
          safeSettings[`${s.key}_set`] = true;
        } catch {
          safeSettings[s.key] = "****";
          safeSettings[`${s.key}_set`] = true;
        }
      } else {
        safeSettings[s.key] = null;
        safeSettings[`${s.key}_set`] = false;
      }
    }

    // Ensure all keys are present even if not yet saved
    for (const key of PAYMENT_SETTING_KEYS) {
      if (!(key in safeSettings)) {
        safeSettings[key] = key === "stripe_enabled" ? "false" : null;
        safeSettings[`${key}_set`] = false;
      }
    }

    res.json(safeSettings);
  } catch (error) {
    console.error("Fetch payment settings error:", error);
    res.status(500).json({ error: "Failed to fetch payment settings" });
  }
});

router.put("/payment-settings", authenticateAdmin, async (req: any, res) => {
  try {
    const { stripe_secret_key, stripe_webhook_secret, stripe_public_key, stripe_enabled } =
      req.body;
    const adminId = req.user.id;

    const updates: { key: string; value: string }[] = [];

    // Only update keys that were actually provided (not undefined)
    if (stripe_secret_key !== undefined && stripe_secret_key !== "") {
      if (!stripe_secret_key.startsWith("sk_")) {
        return res.status(400).json({ error: "Invalid Stripe secret key format (must start with sk_)" });
      }
      updates.push({ key: "stripe_secret_key", value: encryptValue(stripe_secret_key) });
    }

    if (stripe_webhook_secret !== undefined && stripe_webhook_secret !== "") {
      if (!stripe_webhook_secret.startsWith("whsec_")) {
        return res.status(400).json({ error: "Invalid webhook secret format (must start with whsec_)" });
      }
      updates.push({ key: "stripe_webhook_secret", value: encryptValue(stripe_webhook_secret) });
    }

    if (stripe_public_key !== undefined && stripe_public_key !== "") {
      if (!stripe_public_key.startsWith("pk_")) {
        return res.status(400).json({ error: "Invalid Stripe public key format (must start with pk_)" });
      }
      // Public key not encrypted (safe to expose to frontend)
      updates.push({ key: "stripe_public_key", value: stripe_public_key });
    }

    if (stripe_enabled !== undefined) {
      updates.push({ key: "stripe_enabled", value: stripe_enabled ? "true" : "false" });
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No valid fields provided" });
    }

    await prisma.$transaction(
      updates.map((u) =>
        prisma.setting.upsert({
          where: { key: u.key },
          update: { value: u.value },
          create: { key: u.key, value: u.value },
        })
      )
    );

    // Invalidate cached Stripe instance so next request picks up new keys
    invalidateStripeCache();

    await auditService.log(adminId, "PAYMENT_SETTINGS_UPDATED", "settings", null, {
      updatedKeys: updates.map((u) => u.key),
    });

    res.json({ success: true, updatedKeys: updates.map((u) => u.key) });
  } catch (error) {
    console.error("Update payment settings error:", error);
    res.status(500).json({ error: "Failed to update payment settings" });
  }
});

// Test Stripe connection with the currently saved keys
router.post("/payment-settings/test-stripe", authenticateAdmin, async (_req, res) => {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      return res.status(400).json({
        success: false,
        message: "Stripe is not configured. Please add your secret key first.",
      });
    }

    // Lightweight test: list 1 payment intent — confirms key works
    await stripe.paymentIntents.list({ limit: 1 });
    res.json({ success: true, message: "Stripe connection successful." });
  } catch (error: any) {
    const msg = error?.message || "Stripe connection failed";
    console.error("Stripe test error:", error);
    res.status(400).json({ success: false, message: msg });
  }
});

// Delete a specific payment key (e.g. rotate a key)
router.delete("/payment-settings/:key", authenticateAdmin, async (req: any, res) => {
  try {
    const { key } = req.params;
    if (!PAYMENT_SETTING_KEYS.includes(key)) {
      return res.status(400).json({ error: "Invalid setting key" });
    }

    await prisma.setting.deleteMany({ where: { key } });
    invalidateStripeCache();

    await auditService.log(req.user.id, "PAYMENT_KEY_DELETED", "settings", null, { key });

    res.json({ success: true });
  } catch (error) {
    console.error("Delete payment key error:", error);
    res.status(500).json({ error: "Failed to delete key" });
  }
});

// Admin: list all withdrawal requests
router.get("/withdrawals", authenticateAdmin, async (_req, res) => {
  try {
    const requests = await (prisma as any).withdrawalRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, role: true } },
      },
    });
    res.json(requests);
  } catch (error) {
    console.error("Admin withdrawals error:", error);
    res.status(500).json({ error: "Failed to fetch withdrawals" });
  }
});

// Admin: approve or reject a withdrawal request
router.patch("/withdrawals/:id", authenticateAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body; // "approved" | "rejected"
    const adminId = req.user.id;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
    }

    if (status === "approved") {
      await WithdrawalService.approveWithdrawal(id, adminId, note);
    } else {
      await WithdrawalService.rejectWithdrawal(id, adminId, note || "Rejected by admin");
    }

    res.json({ success: true, status });
  } catch (error: any) {
    console.error("Process withdrawal error:", error);
    res.status(500).json({ error: error?.message || "Failed to process withdrawal" });
  }
});

export default router;
