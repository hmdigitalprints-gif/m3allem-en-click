import express from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db.ts";
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
      return res.status(401).json({ error: "Authentication failed" });
    }
    if (req.user.role !== 'admin') {
      console.error(`[Admin Auth] User ${req.user.id} with role ${req.user.role} attempted to access admin route`);
      return res.status(403).json({ error: "Admin access required" });
    }
    console.log(`[Admin Auth] Access granted for user: ${req.user.id}`);
    next();
  });
};

// Admin logout
router.post("/logout", authenticateAdmin, (req, res) => {
  // In JWT, logout is primarily client-side (removing the token).
  // We can add server-side blacklisting here if needed.
  res.json({ message: "Logged out successfully" });
});

// Get admin dashboard stats
router.get("/stats", authenticateAdmin, (req, res) => {
  const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  const totalArtisans = db.prepare("SELECT COUNT(*) as count FROM artisans").get() as { count: number };
  const totalBookings = db.prepare("SELECT COUNT(*) as count FROM bookings").get() as { count: number };
  const totalRevenue = db.prepare("SELECT SUM(admin_amount) as total FROM bookings WHERE booking_status = 'completed'").get() as { total: number };
  const activeArtisans = db.prepare("SELECT COUNT(*) as count FROM artisans WHERE is_online = 1").get() as { count: number };
  
  res.json({
    totalUsers: totalUsers.count,
    totalArtisans: totalArtisans.count,
    totalBookings: totalBookings.count,
    totalRevenue: totalRevenue.total || 0,
    activeArtisans: activeArtisans.count
  });
});

// Get platform analytics
router.get("/analytics", authenticateAdmin, (req, res) => {
  // 1. Revenue Trends (Last 7 months)
  const revenueTrends = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = d.toLocaleString('default', { month: 'short' });
    const monthStr = d.toISOString().slice(0, 7); // YYYY-MM
    
    const revenue = db.prepare(`
      SELECT SUM(admin_amount) as total 
      FROM bookings 
      WHERE booking_status = 'completed' AND strftime('%Y-%m', created_at) = ?
    `).get(monthStr) as { total: number };
    
    revenueTrends.push({
      name: monthName,
      revenue: revenue.total || 0
    });
  }

  // 2. Booking Status Summary
  const bookingSummary = db.prepare(`
    SELECT booking_status as name, COUNT(*) as value
    FROM bookings
    GROUP BY booking_status
  `).all();

  // 3. Recent Users
  const recentUsers = db.prepare(`
    SELECT id, name, email, role, created_at
    FROM users
    ORDER BY created_at DESC
    LIMIT 10
  `).all();

  res.json({
    revenueTrends,
    bookingSummary,
    recentUsers
  });
});

// Manage categories and commission rates
router.get("/categories", authenticateAdmin, (req, res) => {
  const categories = db.prepare("SELECT * FROM categories").all();
  res.json(categories);
});

router.post("/categories", authenticateAdmin, (req, res) => {
  try {
    const { name, icon, commission_rate } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    
    const id = uuidv4();
    db.prepare("INSERT INTO categories (id, name, icon, commission_rate) VALUES (?, ?, ?, ?)")
      .run(id, name, icon || null, commission_rate || null);
    
    const category = db.prepare("SELECT * FROM categories WHERE id = ?").get(id);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: "Failed to create category" });
  }
});

router.delete("/categories/:id", authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM categories WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete category" });
  }
});

router.patch("/categories/:id", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { commission_rate } = req.body;
  
  // Allow null to reset to global commission
  const rate = (commission_rate === null || commission_rate === undefined) ? null : Number(commission_rate);
  
  db.prepare("UPDATE categories SET commission_rate = ? WHERE id = ?").run(rate, id);
  res.json({ success: true });
});

router.post("/categories/:id/toggle-active", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const category = db.prepare("SELECT is_active FROM categories WHERE id = ?").get(id) as any;
  if (!category) return res.status(404).json({ error: "Category not found" });

  const newStatus = category.is_active ? 0 : 1;
  db.prepare("UPDATE categories SET is_active = ? WHERE id = ?").run(newStatus, id);
  res.json({ success: true, is_active: newStatus });
});

// Artisan verification
router.get("/verifications", authenticateAdmin, (req, res) => {
  const verifications = db.prepare(`
    SELECT v.*, u.name, u.phone, a.id as artisan_id
    FROM artisan_verifications v
    JOIN users u ON v.user_id = u.id
    JOIN artisans a ON u.id = a.user_id
    WHERE v.status = 'pending'
  `).all();
  res.json(verifications);
});

router.post("/verifications/:id/approve", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const verification = db.prepare("SELECT * FROM artisan_verifications WHERE id = ?").get(id) as any;
  if (!verification) return res.status(404).json({ error: "Verification not found" });

  db.prepare("UPDATE artisan_verifications SET status = 'approved' WHERE id = ?").run(id);
  db.prepare("UPDATE artisans SET is_verified = 1 WHERE user_id = ?").run(verification.user_id);
  db.prepare("UPDATE users SET verified = 1 WHERE id = ?").run(verification.user_id);

  res.json({ success: true });
});

router.post("/verifications/:id/reject", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  db.prepare("UPDATE artisan_verifications SET status = 'rejected' WHERE id = ?").run(id);
  res.json({ success: true });
});

// User management
router.get("/users", authenticateAdmin, (req, res) => {
  const { role } = req.query;
  let query = "SELECT id, name, phone, role, verified, created_at FROM users";
  let params: any[] = [];

  if (role) {
    query += " WHERE role = ?";
    params.push(role);
  }

  const users = db.prepare(query).all(...params);
  res.json(users);
});

router.delete("/users/:id", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  // Simplified: just delete user. In real app, handle cascading.
  db.prepare("DELETE FROM users WHERE id = ?").run(id);
  res.json({ success: true });
});

router.patch("/users/:id", authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, role, verified } = req.body;
    
    db.prepare(`
      UPDATE users 
      SET name = COALESCE(?, name), 
          phone = COALESCE(?, phone), 
          role = COALESCE(?, role), 
          verified = COALESCE(?, verified)
      WHERE id = ?
    `).run(name, phone, role, verified !== undefined ? (verified ? 1 : 0) : null, id);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Artisan management
router.get("/artisans", authenticateAdmin, (req, res) => {
  const artisans = db.prepare(`
    SELECT a.*, u.name, u.phone, u.avatar_url, c.name as category_name
    FROM artisans a
    JOIN users u ON a.user_id = u.id
    JOIN categories c ON a.category_id = c.id
  `).all();
  res.json(artisans);
});

router.post("/artisans/:id/toggle-featured", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const artisan = db.prepare("SELECT is_featured FROM artisans WHERE id = ?").get(id) as any;
  if (!artisan) return res.status(404).json({ error: "Artisan not found" });

  const newStatus = artisan.is_featured ? 0 : 1;
  db.prepare("UPDATE artisans SET is_featured = ? WHERE id = ?").run(newStatus, id);
  res.json({ success: true, is_featured: newStatus });
});

router.post("/artisans/:id/verify", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { verified } = req.body;
  db.prepare("UPDATE artisans SET is_verified = ? WHERE id = ?").run(verified ? 1 : 0, id);
  res.json({ success: true });
});

// Wallets
router.get("/wallets", authenticateAdmin, (req, res) => {
  const wallets = db.prepare(`
    SELECT w.*, u.name, u.avatar_url
    FROM wallets w
    JOIN users u ON w.user_id = u.id
  `).all();
  res.json(wallets);
});

router.get("/transactions", authenticateAdmin, (req, res) => {
  const transactions = db.prepare(`
    SELECT t.*, u.name as user_name
    FROM transactions t
    JOIN wallets w ON t.wallet_id = w.id
    JOIN users u ON w.user_id = u.id
    ORDER BY t.created_at DESC
    LIMIT 50
  `).all();
  res.json(transactions);
});

// Disputes
router.get("/disputes", authenticateAdmin, (req, res) => {
  const disputes = db.prepare(`
    SELECT d.*, c_u.name as client_name, a_u.name as artisan_name
    FROM disputes d
    JOIN users c_u ON d.client_id = c_u.id
    JOIN artisans a ON d.artisan_id = a.id
    JOIN users a_u ON a.user_id = a_u.id
  `).all();
  res.json(disputes);
});

// Cities
router.get("/cities", authenticateAdmin, (req, res) => {
  const cities = db.prepare("SELECT * FROM cities").all();
  res.json(cities);
});

router.post("/cities", authenticateAdmin, (req, res) => {
  const { name } = req.body;
  const id = uuidv4();
  db.prepare("INSERT INTO cities (id, name) VALUES (?, ?)").run(id, name);
  res.json({ id, name });
});

router.delete("/cities/:id", authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM cities WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete city" });
  }
});

router.post("/cities/:id/toggle-active", authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const city = db.prepare("SELECT is_active FROM cities WHERE id = ?").get(id) as any;
    if (!city) return res.status(404).json({ error: "City not found" });
    
    const newStatus = city.is_active ? 0 : 1;
    db.prepare("UPDATE cities SET is_active = ? WHERE id = ?").run(newStatus, id);
    res.json({ success: true, is_active: newStatus });
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle city status" });
  }
});

// Subscriptions
router.get("/subscriptions", authenticateAdmin, (req, res) => {
  const plans = db.prepare("SELECT * FROM subscription_plans").all();
  res.json(plans);
});

// Audit Logs
router.get("/audit-logs", authenticateAdmin, (req, res) => {
  const logs = db.prepare(`
    SELECT l.*, u.name as user_name
    FROM audit_logs l
    LEFT JOIN users u ON l.user_id = u.id
    ORDER BY l.created_at DESC
    LIMIT 100
  `).all();
  res.json(logs);
});

// Notifications
router.get("/notifications/all", authenticateAdmin, (req, res) => {
  const notifications = db.prepare(`
    SELECT n.*, u.name as user_name
    FROM notifications n
    JOIN users u ON n.user_id = u.id
    ORDER BY n.created_at DESC
    LIMIT 100
  `).all();
  res.json(notifications);
});

router.post("/notifications/send", authenticateAdmin, (req, res) => {
  const { userId, title, message, type, link } = req.body;
  const id = uuidv4();
  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, link)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, userId, title, message, type || 'push', link || null);
  res.json({ success: true, id });
});

// Cash Collections
router.get("/cash-collections", authenticateAdmin, (req, res) => {
  const collections = db.prepare(`
    SELECT 
      a.id as artisan_id,
      u.name as artisan_name,
      u.avatar_url,
      SUM(b.price) as total_cash_handled,
      SUM(b.admin_amount) as commission_owed
    FROM bookings b
    JOIN artisans a ON b.artisan_id = a.id
    JOIN users u ON a.user_id = u.id
    WHERE b.payment_method = 'cash' AND b.payment_status = 'pending' AND b.booking_status = 'completed'
    GROUP BY a.id
  `).all();
  res.json(collections);
});

// Booking management
router.get("/bookings", authenticateAdmin, (req, res) => {
  const bookings = db.prepare(`
    SELECT b.*, c_u.name as client_name, a_u.name as artisan_name, s.title as service_title
    FROM bookings b
    JOIN users c_u ON b.client_id = c_u.id
    JOIN artisans a ON b.artisan_id = a.id
    JOIN users a_u ON a.user_id = a_u.id
    JOIN services s ON b.service_id = s.id
    ORDER BY b.created_at DESC
  `).all();
  res.json(bookings);
});

router.patch("/bookings/:id/admin_override", authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { booking_status, payment_status, price, admin_amount, artisan_amount } = req.body;
    
    db.prepare(`
      UPDATE bookings 
      SET booking_status = COALESCE(?, booking_status), 
          payment_status = COALESCE(?, payment_status), 
          price = COALESCE(?, price), 
          admin_amount = COALESCE(?, admin_amount), 
          artisan_amount = COALESCE(?, artisan_amount),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(booking_status, payment_status, price, admin_amount, artisan_amount, id);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to override booking" });
  }
});

// Settings management
router.get("/settings", authenticateAdmin, (req, res) => {
  try {
    console.log("[Admin Router] Fetching settings...");
    const settings = db.prepare("SELECT * FROM settings").all();
    const settingsMap = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    console.log(`[Admin Router] Found ${settings.length} settings`);
    res.json(settingsMap);
  } catch (error) {
    console.error("[Admin Router] Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings", details: error instanceof Error ? error.message : String(error) });
  }
});

router.post("/settings", authenticateAdmin, (req, res) => {
  try {
    const settings = req.body;
    console.log("[Admin Router] Updating settings:", settings);
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: "Invalid settings data" });
    }

    const updateSetting = db.prepare("INSERT OR REPLACE INTO settings (id, key, value, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)");
    
    const transaction = db.transaction((settingsObj) => {
      for (const [key, value] of Object.entries(settingsObj)) {
        const existing = db.prepare("SELECT id FROM settings WHERE key = ?").get(key) as { id: string } | undefined;
        const id = existing ? existing.id : uuidv4();
        updateSetting.run(id, key, String(value));
      }
    });

    transaction(settings);
    console.log("[Admin Router] Settings updated successfully");
    res.json({ success: true });
  } catch (error) {
    console.error("[Admin Router] Error updating settings:", error);
    res.status(500).json({ error: "Failed to update settings", details: error instanceof Error ? error.message : String(error) });
  }
});

// Language management
router.get("/languages", authenticateAdmin, (req, res) => {
  const languages = db.prepare("SELECT * FROM languages ORDER BY name").all();
  res.json(languages);
});

router.post("/languages", authenticateAdmin, (req, res) => {
  try {
    const { code, name, native_name, is_rtl } = req.body;
    if (!code || !name || !native_name) {
      return res.status(400).json({ error: "Code, name, and native name are required" });
    }
    
    db.prepare("INSERT INTO languages (code, name, native_name, is_rtl) VALUES (?, ?, ?, ?)")
      .run(code, name, native_name, is_rtl ? 1 : 0);
    
    const lang = db.prepare("SELECT * FROM languages WHERE code = ?").get(code);
    res.status(201).json(lang);
  } catch (error) {
    console.error("Error adding language:", error);
    res.status(500).json({ error: "Failed to add language" });
  }
});

router.post("/languages/:code/toggle", authenticateAdmin, (req, res) => {
  try {
    const { code } = req.params;
    const { is_active } = req.body;
    db.prepare("UPDATE languages SET is_active = ? WHERE code = ?").run(is_active ? 1 : 0, code);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle language status" });
  }
});

// Translation management
router.get("/translations", authenticateAdmin, (req, res) => {
  const translations = db.prepare("SELECT * FROM translations ORDER BY key, language_code").all();
  res.json(translations);
});

router.post("/translations", authenticateAdmin, (req, res) => {
  try {
    const { key, language_code, value } = req.body;
    if (!key || !language_code || !value) {
      return res.status(400).json({ error: "Key, language_code, and value required" });
    }

    // Use INSERT OR REPLACE since we have UNIQUE(key, language_code)
    db.prepare(`
      INSERT OR REPLACE INTO translations (id, key, language_code, value) 
      VALUES (?, ?, ?, ?)
    `).run(uuidv4(), key, language_code, value);

    res.json({ success: true });
  } catch (error) {
    console.error("Error saving translation:", error);
    res.status(500).json({ error: "Failed to save translation" });
  }
});

router.delete("/translations/:id", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  db.prepare("DELETE FROM translations WHERE id = ?").run(id);
  res.json({ success: true });
});

router.put("/translations/:id", authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body;
    if (!value) {
      return res.status(400).json({ error: "Value required" });
    }
    db.prepare("UPDATE translations SET value = ? WHERE id = ?").run(value, id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating translation:", error);
    res.status(500).json({ error: "Failed to update translation" });
  }
});

export default router;
