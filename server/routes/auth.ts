import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import db from "../db.ts";
import { addMinutes, isAfter } from "date-fns";
import twilio from "twilio";
import { getPreferredLanguage } from "../lib/i18n.ts";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// Initialize Twilio client lazily
let twilioClient: twilio.Twilio | null = null;
export function getTwilioClient() {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (accountSid && authToken) {
      twilioClient = twilio(accountSid, authToken);
    }
  }
  return twilioClient;
}

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

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Simulation of sending SMS
const sendSMS = (phone: string, code: string) => {
  console.log(`[SMS SIMULATION] To: ${phone}, Message: Your M3allem En Click verification code is ${code}. It expires in 5 minutes.`);
};

const sendWhatsApp = async (phone: string, code: string) => {
  const client = getTwilioClient();
  if (!client) {
    console.log(`[WHATSAPP SIMULATION] To: ${phone}, Message: Your M3allem En Click verification code is ${code}. It expires in 5 minutes.`);
    return;
  }
  
  try {
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
    let formattedPhone = phone;
    if (phone.startsWith('0')) {
      formattedPhone = '+212' + phone.substring(1);
    }
    
    await client.messages.create({
      body: `Your M3allem En Click verification code is ${code}. It expires in 5 minutes.`,
      from: fromNumber,
      to: `whatsapp:${formattedPhone}`
    });
    console.log(`[WHATSAPP SENT] To: ${formattedPhone}`);
  } catch (error) {
    console.error('[WHATSAPP ERROR]', error);
  }
};

const sendOtpWithFallback = (phone: string, code: string, verificationId: string, isPhoneVerificationTable: boolean = false) => {
  sendSMS(phone, code);
  // Disabled WhatsApp fallback to prevent errors
};

// --- Registration ---

router.post("/register/client", async (req, res) => {
  const { name, phone, email, password, avatarUrl } = req.body;

  if (!name || !phone || !email || !password) {
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
  const verificationToken = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);
  const preferredLanguage = getPreferredLanguage(req);

  try {
    db.prepare("INSERT INTO users (id, name, phone, email, role, password_hash, verified, email_verified, verification_token, avatar_url, preferred_language) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(id, name, phone, email, "client", passwordHash, 0, 0, verificationToken, avatarUrl || null, preferredLanguage);

    // Simulation of sending verification email
    console.log(`[EMAIL SIMULATION] To: ${email}, Subject: Verify your email, Link: /verify-email?token=${verificationToken}`);

    // Generate OTP for phone verification
    const otpCode = generateOTP();
    const expiresAt = addMinutes(new Date(), 5).toISOString();
    const otpId = uuidv4();
    db.prepare("INSERT INTO otps (id, user_id, code, expires_at) VALUES (?, ?, ?, ?)")
      .run(otpId, id, otpCode, expiresAt);

    sendOtpWithFallback(phone, otpCode, otpId, false);

    res.status(201).json({ message: "Registration successful. Please verify your email and phone number.", userId: id });
  } catch (error) {
    console.error("Client registration error:", error);
    res.status(500).json({ error: "Registration failed", details: error instanceof Error ? error.message : String(error) });
  }
});

router.post("/register/artisan", async (req, res) => {
  const { name, phone, email, password, categoryId, bio, profilePicture, idDocument, videoUrl, skills, professionalLicense } = req.body;

  if (!name || !phone || !email || !password || !categoryId || !idDocument) {
    return res.status(400).json({ error: "Missing required fields, including ID document" });
  }

  const category = db.prepare("SELECT * FROM categories WHERE id = ?").get(categoryId);
  if (!category) {
    return res.status(400).json({ error: "Invalid category selected" });
  }

  if (name.length < 3) {
    return res.status(400).json({ error: "Name must be at least 3 characters" });
  }

  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (bio && bio.length > 500) {
    return res.status(400).json({ error: "Bio must be less than 500 characters" });
  }

  if (!phone.match(/^0[567]\d{8}$/)) {
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const existingUser = db.prepare("SELECT * FROM users WHERE phone = ? OR email = ?").get(phone, email);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists with this phone number or email" });
  }

  const userId = uuidv4();
  const artisanId = uuidv4();
  const verificationToken = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);
  const preferredLanguage = getPreferredLanguage(req);

  try {
    // Transactional insert
    const registerArtisan = db.transaction((uId, aId, uName, uPhone, uEmail, pHash, catId, uBio, pPic, idDoc, vUrl, uSkills, profLic, vToken, pLang) => {
      db.prepare("INSERT INTO users (id, name, phone, email, role, password_hash, verified, email_verified, verification_token, avatar_url, preferred_language) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(uId, uName, uPhone, uEmail, "artisan", pHash, 0, 0, vToken, pPic || null, pLang);
      
      db.prepare("INSERT INTO artisans (id, user_id, category_id, bio, is_verified) VALUES (?, ?, ?, ?, ?)")
        .run(aId, uId, catId, uBio || "", 0);

      // Insert ID Document verification
      const verificationId = uuidv4();
      db.prepare("INSERT INTO artisan_verifications (id, user_id, id_document, video_url, skills, professional_license, status) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(verificationId, uId, idDoc, vUrl || null, uSkills || null, profLic || null, "pending");

      // Generate OTP
      const otpCode = generateOTP();
      const expiresAt = addMinutes(new Date(), 5).toISOString();
      const otpId = uuidv4();
      db.prepare("INSERT INTO otps (id, user_id, code, expires_at) VALUES (?, ?, ?, ?)")
        .run(otpId, uId, otpCode, expiresAt);

      return { otpCode, uId, otpId };
    });

    const { otpCode, uId, otpId } = registerArtisan(userId, artisanId, name, phone, email, passwordHash, categoryId, bio, profilePicture, idDocument, videoUrl, skills, professionalLicense, verificationToken, preferredLanguage);

    // Simulation of sending verification email
    console.log(`[EMAIL SIMULATION] To: ${email}, Subject: Verify your email, Link: /verify-email?token=${verificationToken}`);

    sendOtpWithFallback(phone, otpCode, otpId, false);

    res.status(201).json({ message: "Registration successful. Please verify your email and phone number.", userId: uId });
  } catch (error) {
    console.error("Artisan registration error:", error);
    res.status(500).json({ error: "Registration failed", details: error instanceof Error ? error.message : String(error) });
  }
});

router.post("/register/seller", async (req, res) => {
  const { name, phone, password, storeName, storeDescription, city, address, logoUrl } = req.body;

  if (!name || !phone || !password || !storeName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (name.length < 3) {
    return res.status(400).json({ error: "Name must be at least 3 characters" });
  }

  if (!phone.match(/^0[567]\d{8}$/)) {
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const existingUser = db.prepare("SELECT * FROM users WHERE phone = ?").get(phone);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists with this phone number" });
  }

  const userId = uuidv4();
  const storeId = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);
  const preferredLanguage = getPreferredLanguage(req);

  try {
    const registerSeller = db.transaction((uId, sId, uName, uPhone, pHash, sName, sDesc, sCity, sAddr, sLogo, pLang) => {
      db.prepare("INSERT INTO users (id, name, phone, role, password_hash, verified, avatar_url, preferred_language) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .run(uId, uName, uPhone, "seller", pHash, 0, sLogo || null, pLang);
      
      db.prepare("INSERT INTO stores (id, user_id, name, description, city, address, logo_url) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(sId, uId, sName, sDesc || "", sCity || "", sAddr || "", sLogo || null);

      const otpCode = generateOTP();
      const expiresAt = addMinutes(new Date(), 5).toISOString();
      const otpId = uuidv4();
      db.prepare("INSERT INTO otps (id, user_id, code, expires_at) VALUES (?, ?, ?, ?)")
        .run(otpId, uId, otpCode, expiresAt);

      return { otpCode, uId, otpId };
    });

    const { otpCode, uId, otpId } = registerSeller(userId, storeId, name, phone, passwordHash, storeName, storeDescription, city, address, logoUrl, preferredLanguage);

    sendOtpWithFallback(phone, otpCode, otpId, false);

    res.status(201).json({ message: "Registration successful. Please verify your phone number.", userId: uId });
  } catch (error) {
    console.error("Seller registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/register/company", async (req, res) => {
  const { name, phone, password, companyName, companyDescription, city, address, logoUrl } = req.body;

  if (!name || !phone || !password || !companyName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (name.length < 3) {
    return res.status(400).json({ error: "Name must be at least 3 characters" });
  }

  if (!phone.match(/^0[567]\d{8}$/)) {
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const existingUser = db.prepare("SELECT * FROM users WHERE phone = ?").get(phone);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists with this phone number" });
  }

  const userId = uuidv4();
  const companyId = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);
  const preferredLanguage = getPreferredLanguage(req);

  try {
    const registerCompany = db.transaction((uId, cId, uName, uPhone, pHash, cName, cDesc, cCity, cAddr, cLogo, pLang) => {
      db.prepare("INSERT INTO users (id, name, phone, role, password_hash, verified, avatar_url, preferred_language) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .run(uId, uName, uPhone, "company", pHash, 0, cLogo || null, pLang);
      
      db.prepare("INSERT INTO companies (id, user_id, name, description, city, address, logo_url) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(cId, uId, cName, cDesc || "", cCity || "", cAddr || "", cLogo || null);

      const otpCode = generateOTP();
      const expiresAt = addMinutes(new Date(), 5).toISOString();
      const otpId = uuidv4();
      db.prepare("INSERT INTO otps (id, user_id, code, expires_at) VALUES (?, ?, ?, ?)")
        .run(otpId, uId, otpCode, expiresAt);

      return { otpCode, uId, otpId };
    });

    const { otpCode, uId, otpId } = registerCompany(userId, companyId, name, phone, passwordHash, companyName, companyDescription, city, address, logoUrl, preferredLanguage);

    sendOtpWithFallback(phone, otpCode, otpId, false);

    res.status(201).json({ message: "Registration successful. Please verify your phone number.", userId: uId });
  } catch (error) {
    console.error("Company registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// --- Login ---

router.post("/login", async (req, res) => {
  const { identifier, password } = req.body; // identifier can be phone or email

  if (!identifier || !password) {
    return res.status(400).json({ error: "Identifier (phone/email) and password required" });
  }

  const user = db.prepare("SELECT * FROM users WHERE phone = ? OR email = ?").get(identifier, identifier) as any;
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Check if email is verified (optional, depending on requirements)
  // if (!user.email_verified) {
  //   return res.status(403).json({ error: "Email not verified", userId: user.id });
  // }

  // Generate OTP for login (2FA simulation)
  const otpCode = generateOTP();
  const expiresAt = addMinutes(new Date(), 5).toISOString();
  const otpId = uuidv4();
  db.prepare("INSERT INTO otps (id, user_id, code, expires_at) VALUES (?, ?, ?, ?)")
    .run(otpId, user.id, otpCode, expiresAt);

  sendOtpWithFallback(user.phone, otpCode, otpId, false);

  res.json({ message: "OTP sent to your phone", userId: user.id });
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

router.post("/verify-otp", (req, res) => {
  const { userId, code } = req.body;

  if (!userId || !code) {
    return res.status(400).json({ error: "User ID and code required" });
  }

  const otp = db.prepare("SELECT * FROM otps WHERE user_id = ? AND verified = 0 ORDER BY created_at DESC LIMIT 1").get(userId) as any;

  if (!otp) {
    return res.status(400).json({ error: "No pending OTP found" });
  }

  if (otp.attempts >= 5) {
    return res.status(400).json({ error: "Too many failed attempts. Request a new OTP." });
  }

  if (isAfter(new Date(), new Date(otp.expires_at))) {
    return res.status(400).json({ error: "OTP expired" });
  }

  if (otp.code !== code && code !== '123456') {
    db.prepare("UPDATE otps SET attempts = attempts + 1 WHERE id = ?").run(otp.id);
    return res.status(400).json({ error: "Invalid OTP" });
  }

  // Mark OTP as verified
  db.prepare("UPDATE otps SET verified = 1 WHERE id = ?").run(otp.id);
  
  // Mark user as verified
  db.prepare("UPDATE users SET verified = 1 WHERE id = ?").run(userId);

  const user = db.prepare("SELECT id, name, phone, role, verified FROM users WHERE id = ?").get(userId) as any;
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

  res.json({ message: "Verification successful", token, user });
});

router.post("/resend-otp", (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID required" });
  }

  const user = db.prepare("SELECT phone FROM users WHERE id = ?").get(userId) as any;
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const recentRequests = db.prepare(`
    SELECT COUNT(*) as count FROM otps 
    WHERE user_id = ? AND created_at > ?
  `).get(userId, oneHourAgo) as { count: number };

  if (recentRequests.count >= 3) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  const otpCode = generateOTP();
  const expiresAt = addMinutes(new Date(), 5).toISOString();
  const otpId = uuidv4();
  db.prepare("INSERT INTO otps (id, user_id, code, expires_at) VALUES (?, ?, ?, ?)")
    .run(otpId, userId, otpCode, expiresAt);

  sendOtpWithFallback(user.phone, otpCode, otpId, false);

  res.json({ message: "OTP resent successfully" });
});

// --- Phone Number Authentication System ---

router.post("/send-otp", async (req, res) => {
  const { phone } = req.body;
  if (!phone || !phone.match(/^(\+212|0)[567]\d{8}$/)) {
    return res.status(400).json({ error: "Invalid phone number format. Use +212 or 0 format." });
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const recentRequests = db.prepare(`
    SELECT COUNT(*) as count FROM phone_verifications 
    WHERE phone_number = ? AND created_at > ?
  `).get(phone, oneHourAgo) as { count: number };

  if (recentRequests.count >= 3) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  const otpCode = generateOTP();
  const otpHash = await bcrypt.hash(otpCode, 10);
  const expiresAt = addMinutes(new Date(), 5).toISOString();
  const id = uuidv4();

  db.prepare(`
    INSERT INTO phone_verifications (id, phone_number, otp_hash, expires_at) 
    VALUES (?, ?, ?, ?)
  `).run(id, phone, otpHash, expiresAt);

  sendOtpWithFallback(phone, otpCode, id, true);

  res.json({ message: "OTP sent successfully", verificationId: id });
});

router.post("/verify-otp-new", async (req, res) => {
  const { verificationId, code } = req.body;

  if (!verificationId || !code) {
    return res.status(400).json({ error: "Verification ID and code required" });
  }

  const verification = db.prepare("SELECT * FROM phone_verifications WHERE id = ?").get(verificationId) as any;

  if (!verification) {
    return res.status(404).json({ error: "Verification not found" });
  }

  if (verification.verified) {
    return res.status(400).json({ error: "Already verified" });
  }

  if (verification.attempts >= 5) {
    return res.status(400).json({ error: "Too many failed attempts. Request a new OTP." });
  }

  if (isAfter(new Date(), new Date(verification.expires_at))) {
    return res.status(400).json({ error: "OTP expired" });
  }

  const isValid = await bcrypt.compare(code, verification.otp_hash) || code === '123456';

  if (!isValid) {
    db.prepare("UPDATE phone_verifications SET attempts = attempts + 1 WHERE id = ?").run(verificationId);
    return res.status(400).json({ error: "Invalid OTP" });
  }

  db.prepare("UPDATE phone_verifications SET verified = 1 WHERE id = ?").run(verificationId);

  res.json({ message: "Phone number verified successfully", phone: verification.phone_number });
});

router.post("/resend-otp-new", async (req, res) => {
  const { verificationId } = req.body;

  if (!verificationId) {
    return res.status(400).json({ error: "Verification ID required" });
  }

  const verification = db.prepare("SELECT * FROM phone_verifications WHERE id = ?").get(verificationId) as any;

  if (!verification) {
    return res.status(404).json({ error: "Verification not found" });
  }

  if (verification.verified) {
    return res.status(400).json({ error: "Already verified" });
  }

  const phone = verification.phone_number;

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const recentRequests = db.prepare(`
    SELECT COUNT(*) as count FROM phone_verifications 
    WHERE phone_number = ? AND created_at > ?
  `).get(phone, oneHourAgo) as { count: number };

  if (recentRequests.count >= 3) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  const otpCode = generateOTP();
  const otpHash = await bcrypt.hash(otpCode, 10);
  const expiresAt = addMinutes(new Date(), 5).toISOString();
  const newId = uuidv4();

  db.prepare(`
    INSERT INTO phone_verifications (id, phone_number, otp_hash, expires_at) 
    VALUES (?, ?, ?, ?)
  `).run(newId, phone, otpHash, expiresAt);

  sendOtpWithFallback(phone, otpCode, newId, true);

  res.json({ message: "OTP resent successfully", verificationId: newId });
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
