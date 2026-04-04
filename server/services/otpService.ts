import crypto from "crypto";
import { db } from "../db.ts";
import { v4 as uuidv4 } from "uuid";
import { addMinutes, isAfter, subSeconds } from "date-fns";
import twilio from "twilio";
import nodemailer from "nodemailer";

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

  static async sendOTP(userId: string, channel: "sms" | "whatsapp" | "email"): Promise<{ success: boolean; error?: string }> {
    const user = db.prepare("SELECT phone, email FROM users WHERE id = ?").get(userId) as any;
    if (!user) return { success: false, error: "User not found" };

    // Check resend cooldown
    const lastOtp = db.prepare("SELECT created_at FROM otps WHERE user_id = ? ORDER BY created_at DESC LIMIT 1").get(userId) as any;
    if (lastOtp) {
      const cooldownEnd = addMinutes(new Date(lastOtp.created_at), 0); // Placeholder for 60s
      const now = new Date();
      const secondsSinceLast = (now.getTime() - new Date(lastOtp.created_at).getTime()) / 1000;
      if (secondsSinceLast < RESEND_COOLDOWN_SECONDS) {
        return { success: false, error: `Please wait ${Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLast)} seconds before resending.` };
      }
    }

    const otp = this.generateOTP();
    const otpHash = this.hashOTP(otp);
    const expiresAt = addMinutes(new Date(), OTP_EXPIRY_MINUTES).toISOString();
    const id = uuidv4();

    // Store OTP
    db.prepare("INSERT INTO otps (id, user_id, otp_hash, channel, expires_at) VALUES (?, ?, ?, ?, ?)")
      .run(id, userId, otpHash, channel, expiresAt);

    // Send OTP
    try {
      if (channel === "sms") {
        await this.sendSms(user.phone, otp);
      } else if (channel === "whatsapp") {
        await this.sendWhatsApp(user.phone, otp);
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
    const client = getTwilioClient();
    if (!client) {
      console.log(`[SMS SIMULATION] To: ${phone}, OTP: ${otp}`);
      return;
    }
    await client.messages.create({
      body: `Your M3allem-en-Click verification code is ${otp}. It expires in 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
  }

  private static async sendWhatsApp(phone: string, otp: string) {
    const client = getTwilioClient();
    if (!client) {
      console.log(`[WHATSAPP SIMULATION] To: ${phone}, OTP: ${otp}`);
      return;
    }
    let formattedPhone = phone;
    if (phone.startsWith('0')) {
      formattedPhone = '+212' + phone.substring(1);
    }
    await client.messages.create({
      body: `Your M3allem-en-Click verification code is ${otp}. It expires in 5 minutes.`,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886'}`,
      to: `whatsapp:${formattedPhone}`,
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

  static async verifyOTP(userId: string, otp: string): Promise<{ success: boolean; error?: string }> {
    const latestOtp = db.prepare("SELECT * FROM otps WHERE user_id = ? ORDER BY created_at DESC LIMIT 1").get(userId) as any;

    if (!latestOtp) return { success: false, error: "No OTP found" };

    if (latestOtp.attempts >= MAX_OTP_ATTEMPTS) {
      return { success: false, error: "Maximum attempts reached. Please request a new OTP." };
    }

    if (isAfter(new Date(), new Date(latestOtp.expires_at))) {
      return { success: false, error: "OTP has expired" };
    }

    const hashedInput = this.hashOTP(otp);
    if (hashedInput !== latestOtp.otp_hash) {
      db.prepare("UPDATE otps SET attempts = attempts + 1 WHERE id = ?").run(latestOtp.id);
      return { success: false, error: "Invalid verification code" };
    }

    // Success: Update user and cleanup
    db.prepare("UPDATE users SET verified = 1, last_verified = CURRENT_TIMESTAMP WHERE id = ?").run(userId);
    db.prepare("DELETE FROM otps WHERE user_id = ?").run(userId);

    return { success: true };
  }
}
