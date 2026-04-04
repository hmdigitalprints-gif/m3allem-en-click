import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db.ts";
import { addMinutes, isAfter, differenceInDays } from "date-fns";
import { getPreferredLanguage } from "../lib/i18n.ts";
import { OtpService } from "../services/otpService.ts";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// Middleware to verify JWT
export const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access denied" });

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    
    // Fetch full user to get preferred_language
    const user = db.prepare("SELECT id, role, preferred_language FROM users WHERE id = ?").get(decoded.id) as any;
    if (!user) return res.status(404).json({ error: "User not found" });
    
    req.user = user;
    next();
  });
};

// --- Registration ---

router.post("/register/client", async (req, res) => {
  const { name, phone, email, password, avatarUrl, otpChannel } = req.body;

  if (!name || !phone || !email || !password || !otpChannel) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (name.length < 3) {
    return res.status(400).json({ error: "Name must be at least 3 characters" });
  }

  if (!phone.match(/^0[567]\d{8}$/)) {
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const existingUser = db.prepare("SELECT * FROM users WHERE phone = ? OR email = ?").get(phone, email);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists with this phone number or email" });
  }

  const id = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);
  const preferredLanguage = getPreferredLanguage(req);

  try {
    db.prepare("INSERT INTO users (id, name, phone, email, role, password_hash, verified, email_verified, avatar_url, preferred_language) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(id, name, phone, email, "client", passwordHash, 0, 0, avatarUrl || null, preferredLanguage);

    const otpResult = await OtpService.sendOTP(id, otpChannel);
    if (!otpResult.success) {
      return res.status(500).json({ error: otpResult.error });
    }

    res.status(201).json({ message: "Registration successful. Please verify your account.", userId: id });
  } catch (error) {
    console.error("Client registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/register/artisan", async (req, res) => {
  const { name, phone, email, password, categoryId, bio, profilePicture, idDocument, videoUrl, skills, professionalLicense, otpChannel } = req.body;

  if (!name || !phone || !email || !password || !categoryId || !idDocument || !otpChannel) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const existingUser = db.prepare("SELECT * FROM users WHERE phone = ? OR email = ?").get(phone, email);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const userId = uuidv4();
  const artisanId = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);
  const preferredLanguage = getPreferredLanguage(req);

  try {
    db.transaction(() => {
      db.prepare("INSERT INTO users (id, name, phone, email, role, password_hash, verified, email_verified, avatar_url, preferred_language) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(userId, name, phone, email, "artisan", passwordHash, 0, 0, profilePicture || null, preferredLanguage);
      
      db.prepare("INSERT INTO artisans (id, user_id, category_id, bio, is_verified) VALUES (?, ?, ?, ?, ?)")
        .run(artisanId, userId, categoryId, bio || "", 0);

      const verificationId = uuidv4();
      db.prepare("INSERT INTO artisan_verifications (id, user_id, id_document, video_url, skills, professional_license, status) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(verificationId, userId, idDocument, videoUrl || null, skills || null, professionalLicense || null, "pending");
    })();

    const otpResult = await OtpService.sendOTP(userId, otpChannel);
    if (!otpResult.success) {
      return res.status(500).json({ error: otpResult.error });
    }

    res.status(201).json({ message: "Registration successful. Please verify your account.", userId: userId });
  } catch (error) {
    console.error("Artisan registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/register/seller", async (req, res) => {
  const { name, phone, password, storeName, storeDescription, city, address, logoUrl, otpChannel } = req.body;

  if (!name || !phone || !password || !storeName || !otpChannel) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const existingUser = db.prepare("SELECT * FROM users WHERE phone = ?").get(phone);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const userId = uuidv4();
  const storeId = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);
  const preferredLanguage = getPreferredLanguage(req);

  try {
    db.transaction(() => {
      db.prepare("INSERT INTO users (id, name, phone, role, password_hash, verified, avatar_url, preferred_language) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .run(userId, name, phone, "seller", passwordHash, 0, logoUrl || null, preferredLanguage);
      
      db.prepare("INSERT INTO stores (id, user_id, name, description, city, address, logo_url) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(storeId, userId, storeName, storeDescription || "", city || "", address || "", logoUrl || null);
    })();

    const otpResult = await OtpService.sendOTP(userId, otpChannel);
    if (!otpResult.success) {
      return res.status(500).json({ error: otpResult.error });
    }

    res.status(201).json({ message: "Registration successful. Please verify your account.", userId: userId });
  } catch (error) {
    console.error("Seller registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/register/company", async (req, res) => {
  const { name, phone, password, companyName, companyDescription, city, address, logoUrl, otpChannel } = req.body;

  if (!name || !phone || !password || !companyName || !otpChannel) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const existingUser = db.prepare("SELECT * FROM users WHERE phone = ?").get(phone);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const userId = uuidv4();
  const companyId = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);
  const preferredLanguage = getPreferredLanguage(req);

  try {
    db.transaction(() => {
      db.prepare("INSERT INTO users (id, name, phone, role, password_hash, verified, avatar_url, preferred_language) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .run(userId, name, phone, "company", passwordHash, 0, logoUrl || null, preferredLanguage);
      
      db.prepare("INSERT INTO companies (id, user_id, name, description, city, address, logo_url) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(companyId, userId, companyName, companyDescription || "", city || "", address || "", logoUrl || null);
    })();

    const otpResult = await OtpService.sendOTP(userId, otpChannel);
    if (!otpResult.success) {
      return res.status(500).json({ error: otpResult.error });
    }

    res.status(201).json({ message: "Registration successful. Please verify your account.", userId: userId });
  } catch (error) {
    console.error("Company registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// --- Login ---

router.post("/login", async (req, res) => {
  const { identifier, password, otpChannel } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: "Identifier and password required" });
  }

  const user = db.prepare("SELECT * FROM users WHERE phone = ? OR email = ?").get(identifier, identifier) as any;
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Check if user is verified
  if (!user.verified) {
    return res.status(403).json({ 
      error: "Account not verified", 
      userId: user.id,
      requiresVerification: true 
    });
  }

  // Check 15-day inactivity rule
  const lastVerified = user.last_verified ? new Date(user.last_verified) : new Date(user.created_at);
  const daysSinceVerification = differenceInDays(new Date(), lastVerified);

  if (daysSinceVerification >= 15) {
    if (!otpChannel) {
      return res.status(200).json({ 
        message: "Re-verification required due to inactivity", 
        userId: user.id,
        requiresOtp: true 
      });
    }

    const otpResult = await OtpService.sendOTP(user.id, otpChannel);
    if (!otpResult.success) {
      return res.status(500).json({ error: otpResult.error });
    }

    return res.json({ 
      message: "OTP sent for re-verification", 
      userId: user.id,
      requiresOtp: true 
    });
  }

  // Update last_verified to current time (as a "login activity" update)
  db.prepare("UPDATE users SET last_verified = CURRENT_TIMESTAMP WHERE id = ?").run(user.id);

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ message: "Login successful", token, user: { id: user.id, name: user.name, role: user.role } });
});

// --- Email Verification ---

router.post("/verify-email", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Verification token required" });
  }

  const user = db.prepare("SELECT * FROM users WHERE verification_token = ?").get(token) as any;
  if (!user) {
    return res.status(400).json({ error: "Invalid or expired verification token" });
  }

  db.prepare("UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?").run(user.id);

  res.json({ success: true, message: "Email verified successfully" });
});

// --- Password Reset ---

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  if (!user) {
    // For security, don't reveal if email exists
    return res.json({ message: "If an account exists with this email, a reset link has been sent." });
  }

  const resetToken = uuidv4();
  const expiresAt = addMinutes(new Date(), 60).toISOString(); // 1 hour

  db.prepare("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?")
    .run(resetToken, expiresAt, user.id);

  // Simulation of sending reset email
  console.log(`[EMAIL SIMULATION] To: ${email}, Subject: Reset your password, Link: /reset-password?token=${resetToken}`);

  res.json({ message: "If an account exists with this email, a reset link has been sent." });
});

router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token and new password required" });
  }

  const user = db.prepare("SELECT * FROM users WHERE reset_token = ?").get(token) as any;
  if (!user || isAfter(new Date(), new Date(user.reset_token_expires))) {
    return res.status(400).json({ error: "Invalid or expired reset token" });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  db.prepare("UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?")
    .run(passwordHash, user.id);

  res.json({ success: true, message: "Password reset successfully" });
});

// --- OTP Verification ---

router.post("/verify-otp", async (req, res) => {
  const { userId, code } = req.body;

  if (!userId || !code) {
    return res.status(400).json({ error: "User ID and code required" });
  }

  const result = await OtpService.verifyOTP(userId, code);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  const user = db.prepare("SELECT id, name, role FROM users WHERE id = ?").get(userId) as any;
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

  res.json({ message: "Verification successful", token, user });
});

router.post("/resend-otp", async (req, res) => {
  const { userId, channel } = req.body;

  if (!userId || !channel) {
    return res.status(400).json({ error: "User ID and channel required" });
  }

  const result = await OtpService.sendOTP(userId, channel);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ message: "OTP resent successfully" });
});

// --- Phone Number Authentication System ---

router.post("/send-otp", async (req, res) => {
  const { userId, channel } = req.body;

  if (!userId || !channel) {
    return res.status(400).json({ error: "User ID and channel required" });
  }

  const result = await OtpService.sendOTP(userId, channel);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ message: "OTP sent successfully" });
});

// --- Artisan Verification ---

router.post("/verify-artisan/upload", authenticateToken, (req: any, res) => {
  const { idDocument } = req.body;
  const userId = req.user.id;

  if (!idDocument) {
    return res.status(400).json({ error: "ID document required" });
  }

  const id = uuidv4();
  db.prepare("INSERT INTO artisan_verifications (id, user_id, id_document, status) VALUES (?, ?, ?, ?)")
    .run(id, userId, idDocument, "pending");

  res.json({ message: "Verification document uploaded. Waiting for admin approval." });
});

router.get("/verify-status/:userId", (req, res) => {
  const verification = db.prepare("SELECT * FROM artisan_verifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1").get(req.params.userId) as any;
  res.json(verification || { status: "none" });
});

// --- User Management ---

router.get("/users/me", authenticateToken, (req: any, res) => {
  const user = db.prepare("SELECT id, name, phone, role, verified, avatar_url, points, preferred_language FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

router.patch("/users/:id/language", authenticateToken, (req: any, res) => {
  const { language } = req.body;
  if (req.user.id !== req.params.id) return res.status(403).json({ error: "Unauthorized" });

  const langExists = db.prepare("SELECT code FROM languages WHERE code = ? AND is_active = 1").get(language);
  if (!langExists) {
    return res.status(400).json({ error: "Invalid or inactive language" });
  }

  db.prepare("UPDATE users SET preferred_language = ? WHERE id = ?")
    .run(language, req.params.id);

  res.json({ success: true, message: "Language preference updated" });
});

router.get("/users/:id", authenticateToken, (req, res) => {
  const user = db.prepare("SELECT id, name, phone, role, verified, avatar_url FROM users WHERE id = ?").get(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

router.put("/users/:id", authenticateToken, (req: any, res) => {
  const { name, avatarUrl } = req.body;
  if (req.user.id !== req.params.id) return res.status(403).json({ error: "Unauthorized" });

  db.prepare("UPDATE users SET name = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .run(name, avatarUrl, req.params.id);

  res.json({ message: "Profile updated" });
});

router.get("/artisans", (req, res) => {
  const artisans = db.prepare(`
    SELECT u.id, u.name, u.phone, a.bio, a.rating, a.is_verified, c.name as category
    FROM users u
    JOIN artisans a ON u.id = a.user_id
    JOIN categories c ON a.category_id = c.id
    WHERE u.role = 'artisan'
  `).all();
  res.json(artisans);
});

export default router;
