import crypto from "crypto";
import prisma from "../lib/prisma.ts";
import { addMinutes, isAfter } from "date-fns";
import twilio from "twilio";
import nodemailer from "nodemailer";
import { OtpChannel } from "@prisma/client";
import { auditService } from "./auditService.ts";

// Initialize Twilio client lazily
let twilioClient: twilio.Twilio | null = null;
function getTwilioClient() {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (accountSid && authToken) {
      twilioClient = twilio(accountSid, authToken);
    }
  }
  return twilioClient;
}

// Initialize Nodemailer transporter lazily
let mailTransporter: nodemailer.Transporter | null = null;
function getMailTransporter() {
  if (!mailTransporter) {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || "587");
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      mailTransporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }
  }
  return mailTransporter;
}

export const OTP_EXPIRY_MINUTES = 5;
export const MAX_OTP_ATTEMPTS = 3;
export const RESEND_COOLDOWN_SECONDS = 60;

export class OtpService {
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static hashOTP(otp: string): string {
    return crypto.createHash("sha256").update(otp).digest("hex");
  }

  static async sendOTP(userId: string, channel: OtpChannel): Promise<{ success: boolean; error?: string; isSimulation?: boolean; otp?: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true, email: true }
    });
    if (!user) return { success: false, error: "User not found" };

    // Check resend cooldown
    const lastOtp = await prisma.otp.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    if (lastOtp) {
      const now = new Date();
      const secondsSinceLast = (now.getTime() - lastOtp.createdAt.getTime()) / 1000;
      if (secondsSinceLast < RESEND_COOLDOWN_SECONDS) {
        return { success: false, error: `Please wait ${Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLast)} seconds before resending.` };
      }
    }

    let otp = this.generateOTP();
    let isSimulation = false;
    
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

    const isProduction = process.env.NODE_ENV === "production";

    if (channel === "sms") {
      if (!user.phone) {
        console.error(`[OTP Service] User ${userId} has no phone number for SMS delivery.`);
        return { success: false, error: "Phone number required for SMS verification" };
      }
      if (!accountSid || !authToken || !phoneNumber) {
        if (isProduction) {
          console.error(`[OTP Service] CRITICAL CONFIGURATION ERROR: Live Twilio credentials missing in production environment for User: ${userId}`);
          return { success: false, error: "SMS sending service is currently misconfigured. Please contact support." };
        }
        isSimulation = true;
        console.log(`[OTP Service] Twilio credentials incomplete. Falling back to SMS simulation for User: ${userId}`);
      }
    } else if (channel === "email") {
      if (!user.email) {
        console.error(`[OTP Service] User ${userId} has no email address for email delivery.`);
        return { success: false, error: "Email address required for email verification" };
      }
      if (!process.env.SMTP_HOST) {
        if (isProduction) {
          console.error(`[OTP Service] CRITICAL CONFIGURATION ERROR: Live SMTP credentials missing in production environment for User: ${userId}`);
          return { success: false, error: "Email sending service is currently misconfigured. Please contact support." };
        }
        isSimulation = true;
        console.log(`[OTP Service] SMTP credentials incomplete. Falling back to Email simulation for User: ${userId}`);
      }
    }

    if (isSimulation) {
      console.log(`[OTP Simulation] Generated OTP: ${otp} for User: ${userId} via ${channel}`);
    } else {
      console.log(`[OTP Service] Using live ${channel.toUpperCase()} for OTP delivery to User: ${userId}`);
    }

    const otpHash = this.hashOTP(otp);
    const expiresAt = addMinutes(new Date(), OTP_EXPIRY_MINUTES);

    // Store OTP
    await prisma.otp.create({
      data: {
        userId,
        otpHash,
        channel,
        expiresAt
      }
    });

    // Send OTP
    try {
      if (!isSimulation) {
        if (channel === "sms") {
          await this.sendSms(user.phone!, otp);
        } else if (channel === "email") {
          if (!user.email) return { success: false, error: "User email not found" };
          await this.sendEmail(user.email, otp);
        }
      }
      
      // Log successful OTP issue to AuditLog
      await auditService.log(
        userId,
        "OTP_ISSUED",
        "user",
        userId,
        { channel, isSimulation }
      );

      return { 
        success: true, 
        isSimulation, 
        otp: (isSimulation && !isProduction) ? otp : undefined 
      };
    } catch (error) {
      console.error(`Error sending OTP via ${channel}:`, error);
      
      await auditService.log(
        userId,
        "OTP_ISSUANCE_FAILED",
        "user",
        userId,
        { channel, error: String(error) }
      );

      return { success: false, error: "Failed to send verification code. Please try again." };
    }
  }

  private static async sendSms(phone: string, otp: string) {
    let formattedPhone = phone;
    // Basic E.164 formatting: If starts with 0 and doesn't start with +, assume Moroccan mobile
    if (formattedPhone.startsWith('0') && !formattedPhone.startsWith('+')) {
      formattedPhone = '+212' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    const client = getTwilioClient();
    if (!client) {
      console.log(`[SMS SIMULATION] To: ${formattedPhone}, OTP: ${otp}`);
      return;
    }

    const envFrom = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_WHATSAPP_NUMBER || "";
    const isWhatsApp = envFrom.startsWith('whatsapp:') || envFrom === '+14155238886';

    await client.messages.create({
      body: `Your M3allem-en-Click verification code is ${otp}. It expires in 5 minutes.`,
      from: isWhatsApp ? (envFrom.startsWith('whatsapp:') ? envFrom : `whatsapp:${envFrom}`) : envFrom,
      to: isWhatsApp ? `whatsapp:${formattedPhone}` : formattedPhone,
    });
  }

  private static async sendEmail(email: string, otp: string) {
    const transporter = getMailTransporter();
    if (!transporter) {
      console.log(`[EMAIL SIMULATION] To: ${email}, OTP: ${otp}`);
      return;
    }
    await transporter.sendMail({
      from: `"M3allem-en-Click" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Verification Code",
      text: `Your M3allem-en-Click verification code is ${otp}. It expires in 5 minutes.`,
      html: `<p>Your M3allem-en-Click verification code is <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
    });
  }

  static async sendWelcomeEmail(email: string, name: string) {
    const transporter = getMailTransporter();
    if (!transporter) {
      console.log(`[EMAIL SIMULATION] Welcome email to: ${email}`);
      return;
    }
    await transporter.sendMail({
      from: `"M3allem-en-Click" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Welcome to M3allem-en-Click!",
      text: `Hi ${name},\n\nWelcome to M3allem-en-Click! We are excited to have you on board.\n\nBest regards,\nThe M3allem-en-Click Team`,
      html: `<p>Hi ${name},</p><p>Welcome to M3allem-en-Click! We are excited to have you on board.</p><p>Best regards,<br>The M3allem-en-Click Team</p>`,
    });
  }

  static async sendPasswordResetEmail(email: string, resetLink: string) {
    const transporter = getMailTransporter();
    if (!transporter) {
      throw new Error("SMTP is not configured in environment variables. Cannot send password reset email.");
    }
    await transporter.sendMail({
      from: `"M3allem-en-Click" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset Request",
      text: `You requested a password reset. Please click the following link to reset your password: ${resetLink}`,
      html: `<p>You requested a password reset. Please click the following link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
    });
  }

  static async sendNotificationEmail(email: string, subject: string, message: string) {
    const transporter = getMailTransporter();
    if (!transporter) {
      console.log(`[EMAIL SIMULATION] Notification email to: ${email}, Subject: ${subject}`);
      return;
    }
    await transporter.sendMail({
      from: `"M3allem-en-Click" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      text: message,
      html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
    });
  }

  static async verifyOTP(userId: string, otp: string): Promise<{ success: boolean; error?: string }> {
    console.log(`[OTP Verification] Request for userId: ${userId}, input: "${otp}"`);
    
    if (!otp || otp.length !== 6) {
      console.log(`[OTP Verification] Invalid OTP length: ${otp?.length}`);
      await auditService.log(
        userId,
        "OTP_VERIFICATION_SUSPICIOUS",
        "user",
        userId,
        { reason: "Invalid OTP length/format", length: otp?.length || 0 }
      );
      return { success: false, error: "Verification code must be 6 digits" };
    }

    try {
      const latestOtp = await prisma.otp.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      if (!latestOtp) {
        console.warn(`[OTP Verification] Suspicious: No active OTP record in database for userId: ${userId}`);
        await auditService.log(
          userId,
          "OTP_VERIFICATION_FAILED_NO_OTP",
          "user",
          userId,
          { reason: "No OTP code exists in database" }
        );
        return { success: false, error: "No verification code found. Please request a new one." };
      }

      if (latestOtp.attempts >= MAX_OTP_ATTEMPTS) {
        console.warn(`[OTP Verification] Suspicious: OTP verification attempt on a code that exceeded max attempts. userId: ${userId}`);
        await auditService.log(
          userId,
          "OTP_VERIFICATION_SUSPICIOUS_BLOCKED",
          "user",
          userId,
          { reason: "Maximum attempts already reached", attempts: latestOtp.attempts }
        );
        return { success: false, error: "Maximum attempts reached. This code has been securely invalidated." };
      }

      if (latestOtp.expiresAt && isAfter(new Date(), latestOtp.expiresAt)) {
        console.log(`[OTP Verification] OTP expired. Expiry: ${latestOtp.expiresAt}, Now: ${new Date()}`);
        await auditService.log(
          userId,
          "OTP_VERIFICATION_FAILED_EXPIRED",
          "user",
          userId,
          { reason: "OTP expired", expiresAt: latestOtp.expiresAt }
        );
        return { success: false, error: "The verification code has expired. Please request a new one." };
      }

      const hashedInput = this.hashOTP(otp.trim());
      
      if (hashedInput !== latestOtp.otpHash) {
        console.log(`[OTP Verification] Hash mismatch for userId: ${userId}`);
        
        const newAttempts = latestOtp.attempts + 1;
        
        if (newAttempts >= MAX_OTP_ATTEMPTS) {
          // Cascade and delete the OTP record completely so they MUST request a new one (cannot keep guessing)
          await prisma.otp.delete({
            where: { id: latestOtp.id }
          });
          
          console.warn(`[OTP Verification] CRITICAL SECURITY ALERT: Maximum attempts reached for user ${userId}. OTP deleted from DB to prevent further guesses.`);
          await auditService.log(
            userId,
            "OTP_BRUTE_FORCE_EXCEEDED",
            "user",
            userId,
            { reason: "Max failed verification attempts exceeded. OTP invalidated.", totalAttempts: newAttempts }
          );
          
          return {
            success: false,
            error: "Invalid verification code. Maximum attempts reached. This verification code has been securely invalidated. Please request a new one."
          };
        } else {
          await prisma.otp.update({
            where: { id: latestOtp.id },
            data: { attempts: newAttempts }
          });
          
          await auditService.log(
            userId,
            "OTP_VERIFICATION_FAILED_WRONG_CODE",
            "user",
            userId,
            { reason: "Incorrect OTP entered", attempt: newAttempts }
          );

          const remaining = MAX_OTP_ATTEMPTS - newAttempts;
          return { 
            success: false, 
            error: `Invalid verification code. ${remaining} attempts remaining.` 
          };
        }
      }

      console.log(`[OTP Verification] SUCCESS for userId: ${userId}`);
      
      // Atomic success operations
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { 
            verified: true, 
            emailVerified: true, // Also verify email if they used email channel
            lastVerified: new Date() 
          }
        }),
        prisma.otp.deleteMany({
          where: { userId }
        })
      ]);

      await auditService.log(
        userId,
        "OTP_VERIFICATION_SUCCESS",
        "user",
        userId,
        { status: "successful_entry" }
      );

      return { success: true };
    } catch (error) {
      console.error("[OTP Verification] Database error:", error);
      return { success: false, error: "Internal server error during verification" };
    }
  }
}
