import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.ts";
import { addMinutes, isAfter, differenceInDays } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { getPreferredLanguage } from "../lib/i18n.ts";
import { OtpService } from "../services/otpService.ts";
import { auditService } from "../services/auditService.ts";
import { registerClientSchema, loginSchema } from "../lib/schemas.ts";
type Role = string;

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "m3allem_secure_fallback_secret_2024_prod";
const DISABLE_OTP = false; // [TEMPORARY DISABLE OTP]

// Middleware to verify JWT
export const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access denied" });

  jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, role: true, preferredLanguage: true }
      });
      if (!user) return res.status(404).json({ error: "User not found" });
      
      req.user = user;
      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });
};

async function cleanupUnverifiedUser(userId: string) {
  try {
    await prisma.otp.deleteMany({ where: { userId } });
    await prisma.artisanVerification.deleteMany({ where: { userId } });
    const artisans = await prisma.artisan.findMany({ where: { userId } });
    for (const artisan of artisans) {
       await prisma.artisanPortfolio.deleteMany({ where: { artisanId: artisan.id } });
       await prisma.service.deleteMany({ where: { artisanId: artisan.id } });
    }
    await prisma.artisan.deleteMany({ where: { userId } });
    await prisma.store.deleteMany({ where: { userId } });
    await prisma.company.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  } catch (e) {
    console.error("Failed to cleanup unverified user", e);
  }
}

// --- Registration ---

router.post("/register/client", async (req, res) => {
  try {
    const validatedData = registerClientSchema.parse(req.body);
    const { name, phone, email, password, avatarUrl, otpChannel } = validatedData;

    let existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ phone: phone || undefined }, { email: email || undefined }]
      }
    });

    if (existingUser) {
      if (existingUser.verified) {
        return res.status(400).json({ error: "User already exists with this phone number or email" });
      }
      await cleanupUnverifiedUser(existingUser.id);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const preferredLanguage = await getPreferredLanguage(req);
    
    // Bootstrap Admin
    const role: Role = (email === 'mohammedboucherouite@gmail.com') ? 'admin' : 'client';
    const isVerified = DISABLE_OTP || (email === 'mohammedboucherouite@gmail.com');

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        role,
        passwordHash,
        verified: isVerified,
        emailVerified: isVerified,
        avatarUrl: avatarUrl || null,
        preferredLanguage
      }
    });

    let token = null;
    let userData = null;

    if (isVerified) {
      token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
      userData = { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone, 
        role: user.role, 
        verified: true, 
        avatar_url: user.avatarUrl, 
        preferred_language: user.preferredLanguage 
      };
      if (user.email) {
        try {
          await OtpService.sendWelcomeEmail(user.email, user.name || "User");
        } catch (err) {
          console.error("Failed to send welcome email:", err);
        }
      }
    } else {
      const otpResult = await OtpService.sendOTP(user.id, otpChannel);
      if (!otpResult.success) {
        return res.status(500).json({ error: otpResult.error });
      }
    }

    res.status(201).json({ 
      message: role === 'admin' ? "Admin account created successfully." : "Registration successful. Please verify your account.", 
      userId: user.id,
      token,
      user: userData
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: (error as any).errors[0].message });
    }
    console.error("Client registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/register/artisan", async (req, res) => {
  try {
    const { name, phone, email, password, categoryId, bio, profilePicture, idDocument, videoUrl, skills, professionalLicense, otpChannel } = req.body;

    if (!name || !phone || !email || !password || !categoryId || !idDocument || !otpChannel) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ phone: phone || undefined }, { email: email || undefined }]
      }
    });

    if (existingUser) {
      if (existingUser.verified) {
        return res.status(400).json({ error: "User already exists" });
      }
      await cleanupUnverifiedUser(existingUser.id);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const preferredLanguage = await getPreferredLanguage(req);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          phone,
          email,
          role: 'artisan',
          passwordHash,
          avatarUrl: profilePicture || null,
          preferredLanguage
        }
      });

      await tx.artisan.create({
        data: {
          userId: user.id,
          categoryId,
          bio: bio || ""
        }
      });

      await tx.artisanVerification.create({
        data: {
          userId: user.id,
          idDocument,
          videoUrl: videoUrl || null,
          skills: skills || null,
          professionalLicense: professionalLicense || null
        }
      });

      return user;
    });

    if (DISABLE_OTP) {
      await prisma.user.update({ where: { id: result.id }, data: { verified: true, emailVerified: true, lastVerified: new Date() } });
      const token = jwt.sign({ id: result.id, role: 'artisan' }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ message: "Registration successful", userId: result.id, token, user: { id: result.id, name, role: 'artisan', verified: true } });
    }

    const otpResult = await OtpService.sendOTP(result.id, otpChannel);
    if (!otpResult.success) {
      return res.status(500).json({ error: otpResult.error });
    }

    res.status(201).json({ message: "Registration successful. Please verify your account.", userId: result.id });
  } catch (error) {
    console.error("Artisan registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/register/seller", async (req, res) => {
  try {
    const { name, phone, password, storeName, storeDescription, city, address, logoUrl, otpChannel } = req.body;

    if (!name || !phone || !password || !storeName || !otpChannel) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      if (existingUser.verified) {
        return res.status(400).json({ error: "User already exists" });
      }
      await cleanupUnverifiedUser(existingUser.id);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const preferredLanguage = await getPreferredLanguage(req);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          phone,
          role: 'seller',
          passwordHash,
          avatarUrl: logoUrl || null,
          preferredLanguage
        }
      });

      await tx.store.create({
        data: {
          userId: user.id,
          name: storeName,
          description: storeDescription || "",
          city: city || "",
          address: address || "",
          logoUrl: logoUrl || null
        }
      });

      return user;
    });

    if (DISABLE_OTP) {
      await prisma.user.update({ where: { id: result.id }, data: { verified: true, emailVerified: true, lastVerified: new Date() } });
      const token = jwt.sign({ id: result.id, role: 'seller' }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ message: "Registration successful", userId: result.id, token, user: { id: result.id, name, role: 'seller', verified: true } });
    }

    const otpResult = await OtpService.sendOTP(result.id, otpChannel);
    if (!otpResult.success) {
      return res.status(500).json({ error: otpResult.error });
    }

    res.status(201).json({ message: "Registration successful. Please verify your account.", userId: result.id });
  } catch (error) {
    console.error("Seller registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/register/company", async (req, res) => {
  try {
    const { name, phone, password, companyName, companyDescription, city, address, logoUrl, otpChannel } = req.body;

    if (!name || !phone || !password || !companyName || !otpChannel) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      if (existingUser.verified) {
        return res.status(400).json({ error: "User already exists" });
      }
      await cleanupUnverifiedUser(existingUser.id);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const preferredLanguage = await getPreferredLanguage(req);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          phone,
          role: 'company',
          passwordHash,
          avatarUrl: logoUrl || null,
          preferredLanguage
        }
      });

      await tx.company.create({
        data: {
          userId: user.id,
          name: companyName,
          description: companyDescription || "",
          city: city || "",
          address: address || "",
          logoUrl: logoUrl || null
        }
      });

      return user;
    });

    if (DISABLE_OTP) {
      await prisma.user.update({ where: { id: result.id }, data: { verified: true, emailVerified: true, lastVerified: new Date() } });
      const token = jwt.sign({ id: result.id, role: 'company' }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ message: "Registration successful", userId: result.id, token, user: { id: result.id, name, role: 'company', verified: true } });
    }

    const otpResult = await OtpService.sendOTP(result.id, otpChannel);
    if (!otpResult.success) {
      return res.status(500).json({ error: otpResult.error });
    }

    res.status(201).json({ message: "Registration successful. Please verify your account.", userId: result.id });
  } catch (error) {
    console.error("Company registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// --- Login ---

router.post("/login", async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { identifier, password, otpChannel } = validatedData;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ phone: identifier }, { email: identifier }]
      }
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash!);
    if (!isPasswordValid) {
      await auditService.log(null, 'LOGIN_FAILED', 'user', user.id, { identifier }, req.ip);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Bootstrap Admin Promotion
    if (user.email === 'mohammedboucherouite@gmail.com' && user.role !== 'admin') {
      console.log(`[Auth] Promoting ${user.email} to admin role`);
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'admin', verified: true }
      });
      user.role = 'admin';
      user.verified = true;
    }

    // Check if user is verified
    if (!DISABLE_OTP && !user.verified) {
      await auditService.log(user.id, 'LOGIN_UNVERIFIED', 'user', user.id, null, req.ip);
      return res.status(403).json({ 
        error: "Account not verified", 
        userId: user.id,
        requiresVerification: true 
      });
    }

    // Check 15-day inactivity rule
    const lastVerified = user.lastVerified || user.createdAt;
    const daysSinceVerification = differenceInDays(new Date(), lastVerified);

    if (!DISABLE_OTP && daysSinceVerification >= 15) {
      if (!otpChannel) {
        await auditService.log(user.id, 'REVERIFICATION_REQUIRED', 'user', user.id, { reason: 'inactivity' }, req.ip);
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

      await auditService.log(user.id, 'OTP_SENT_REVERIFY', 'user', user.id, { channel: otpChannel }, req.ip);
      return res.json({ 
        message: "OTP sent for re-verification", 
        userId: user.id,
        requiresOtp: true 
      });
    }

    if (DISABLE_OTP && !user.verified) {
        await prisma.user.update({ where: { id: user.id }, data: { verified: true, emailVerified: true } });
        user.verified = true;
    }

    // Update last_verified to current time (as a "login activity" update)
    await prisma.user.update({
      where: { id: user.id },
      data: { lastVerified: new Date() }
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    await auditService.log(user.id, 'LOGIN_SUCCESS', 'user', user.id, null, req.ip);
    res.json({ 
      message: "Login successful", 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email,
        phone: user.phone,
        role: user.role,
        verified: user.verified,
        avatar_url: user.avatarUrl,
        preferred_language: user.preferredLanguage,
        city: user.city,
        address: user.address
      } 
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: (error as any).errors[0].message });
    }
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// --- Email Verification ---

router.post("/verify-email", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Verification token required" });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token }
    });
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired verification token" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null }
    });

    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ error: "Verification failed" });
  }
});

// --- Password Reset ---

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // For security, don't reveal if email exists
      return res.json({ message: "If an account exists with this email, a reset link has been sent." });
    }

    const resetToken = uuidv4();
    const expiresAt = addMinutes(new Date(), 60); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpires: expiresAt }
    });

    // Simulation of sending reset email
    console.log(`[EMAIL SIMULATION] To: ${email}, Subject: Reset your password, Link: /reset-password?token=${resetToken}`);

    res.json({ message: "If an account exists with this email, a reset link has been sent." });
  } catch (error) {
    res.status(500).json({ error: "Failed to process forgot password" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token and new password required" });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { resetToken: token }
    });
    if (!user || (user.resetTokenExpires && isAfter(new Date(), user.resetTokenExpires))) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpires: null }
    });

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to reset password" });
  }
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

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { verified: true, lastVerified: new Date() },
      select: { id: true, name: true, email: true, phone: true, role: true, verified: true, avatarUrl: true, preferredLanguage: true, city: true, address: true }
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    if (user.email) {
      try {
        await OtpService.sendWelcomeEmail(user.email, user.name || "User");
      } catch (err) {
        console.error("Failed to send welcome email:", err);
      }
    }

    res.json({ 
      message: "Verification successful", 
      token, 
      user: {
        ...user,
        avatar_url: user.avatarUrl,
        preferred_language: user.preferredLanguage
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Verification failed" });
  }
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
router.get("/verify-status/:userId", authenticateToken, async (req: any, res) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user.id;
    const role = req.user.role;

    if (role !== 'admin' && requesterId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const verification = await prisma.artisanVerification.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(verification || { status: "none" });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch verification status" });
  }
});

router.post("/verify-artisan/upload", authenticateToken, async (req: any, res) => {
  const { idDocument } = req.body;
  const userId = req.user.id;

  if (!idDocument) {
    return res.status(400).json({ error: "ID document required" });
  }

  try {
    await prisma.artisanVerification.create({
      data: {
        userId,
        idDocument,
        status: 'pending'
      }
    });

    res.json({ message: "Verification document uploaded. Waiting for admin approval." });
  } catch (error) {
    res.status(500).json({ error: "Upload failed" });
  }
});

// --- User Management ---

router.get("/users/me", authenticateToken, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, phone: true, role: true, verified: true, avatarUrl: true, points: true, preferredLanguage: true, city: true, address: true }
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      ...user,
      avatar_url: user.avatarUrl,
      preferred_language: user.preferredLanguage
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.patch("/users/:id/language", authenticateToken, async (req: any, res) => {
  const { language } = req.body;
  if (req.user.id !== req.params.id) return res.status(403).json({ error: "Unauthorized" });

  try {
    const langExists = await prisma.language.findFirst({
      where: { code: language, isActive: true }
    });
    if (!langExists) {
      return res.status(400).json({ error: "Invalid or inactive language" });
    }

    await prisma.user.update({
      where: { id: req.params.id },
      data: { preferredLanguage: language }
    });

    res.json({ success: true, message: "Language preference updated" });
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

router.get("/users/:id", authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const requesterId = req.user.id;
    const role = req.user.role;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, phone: true, role: true, verified: true, avatarUrl: true, points: true, preferredLanguage: true, city: true, address: true }
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    // If not admin and not the user themselves, return only public info
    if (role !== 'admin' && requesterId !== id) {
      return res.json({
        id: user.id,
        name: user.name,
        role: user.role,
        avatar_url: user.avatarUrl,
        verified: user.verified,
        city: user.city
      });
    }

    res.json({
      ...user,
      avatar_url: user.avatarUrl,
      preferred_language: user.preferredLanguage
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.put("/users/:id", authenticateToken, async (req: any, res) => {
  const { name, avatarUrl, city, address } = req.body;
  if (req.user.id !== req.params.id) return res.status(403).json({ error: "Unauthorized" });

  try {
    await prisma.user.update({
      where: { id: req.params.id },
      data: {
        name,
        avatarUrl,
        city: city || null,
        address: address || null
      }
    });

    res.json({ message: "Profile updated" });
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

router.get("/artisans", async (req, res) => {
  try {
    const artisans = await prisma.artisan.findMany({
      where: {
        user: { role: 'artisan' }
      },
      include: {
        user: {
          select: { id: true, name: true, phone: true }
        },
        category: {
          select: { name: true }
        }
      }
    });

    const formatted = artisans.map(a => ({
      id: a.user?.id,
      name: a.user?.name,
      phone: a.user?.phone,
      bio: a.bio,
      rating: a.rating,
      is_verified: a.isVerified,
      category: a.category?.name
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch artisans" });
  }
});

export default router;
