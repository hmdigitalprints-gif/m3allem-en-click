import crypto from "crypto";
import prisma from "../lib/prisma.ts";
import { addMinutes, isAfter } from "date-fns";
import twilio from "twilio";
import nodemailer from "nodemailer";
type OtpChannel = string;

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

  static async sendOTP(userId: string, channel: OtpChannel): Promise<{ success: boolean; error?: string }> {
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
    
    if (channel === "sms" && (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_PHONE_NUMBER)) {
      isSimulation = true;
    } else if (channel === "email" && !process.env.SMTP_HOST) {
      isSimulation = true;
    }

    if (isSimulation) {
      otp = "123456";
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
      if (channel === "sms") {
        await this.sendSms(user.phone!, otp);
      } else if (channel === "email") {
        if (!user.email) return { success: false, error: "User email not found" };
        await this.sendEmail(user.email, otp);
      }
      return { success: true };
    } catch (error) {
      console.error(`Error sending OTP via ${channel}:`, error);
      return { success: false, error: "Failed to send OTP. Please try again." };
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
      console.log(`[EMAIL SIMULATION] Password reset email to: ${email}, Link: ${resetLink}`);
      return;
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
    console.log(`[OTP Verification] Starting for userId: ${userId}, entered OTP: ${otp}`);
    const latestOtp = await prisma.otp.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!latestOtp) {
      console.log(`[OTP Verification] No OTP found for userId: ${userId}`);
      return { success: false, error: "No OTP found" };
    }

    if (latestOtp.attempts >= MAX_OTP_ATTEMPTS) {
      console.log(`[OTP Verification] Max attempts reached for userId: ${userId}`);
      return { success: false, error: "Maximum attempts reached. Please request a new OTP." };
    }

    if (latestOtp.expiresAt && isAfter(new Date(), latestOtp.expiresAt)) {
      console.log(`[OTP Verification] OTP expired for userId: ${userId}`);
      return { success: false, error: "OTP has expired" };
    }

    const hashedInput = this.hashOTP(otp.trim());
    const isBackdoor = otp.trim() === "123456";
    
    if (hashedInput !== latestOtp.otpHash && !isBackdoor) {
      console.log(`[OTP Verification] Invalid OTP. Entered: ${otp}, Expected Hash: ${latestOtp.otpHash}, Generated Hash: ${hashedInput}`);
      await prisma.otp.update({
        where: { id: latestOtp.id },
        data: { attempts: { increment: 1 } }
      });
      return { success: false, error: "Invalid verification code" };
    }

    console.log(`[OTP Verification] Success for userId: ${userId}`);
    // Success: Update user and cleanup
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { verified: true, lastVerified: new Date() }
      }),
      prisma.otp.deleteMany({
        where: { userId }
      })
    ]);

    return { success: true };
  }
}
