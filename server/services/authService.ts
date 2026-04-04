import { db } from '../db.ts';
import { v4 as uuidv4 } from 'uuid';

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function registerUser(name: string, phone: string, role: 'client' | 'artisan') {
  // Step 1: validate input
  if (!name || !phone || !['client', 'artisan'].includes(role)) {
    throw new Error('Invalid input');
  }

  // Step 2: check existing user
  const existingUser = db.prepare("SELECT * FROM users WHERE phone = ?").get(phone) as any;
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Step 3: create user (not verified yet)
  const userId = uuidv4();
  db.prepare("INSERT INTO users (id, name, phone, role, verified) VALUES (?, ?, ?, ?, 0)")
    .run(userId, name, phone, role);

  // Step 4: generate OTP
  const otpCode = generateOTP();
  const otpId = uuidv4();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  
  db.prepare("INSERT INTO otps (id, user_id, code, expires_at) VALUES (?, ?, ?, ?)")
    .run(otpId, userId, otpCode, expiresAt);

  // Step 5: send OTP (simulate)
  console.log(`[SMS to ${phone}]: Your OTP is ${otpCode}`);

  return { message: 'OTP sent', userId };
}

export async function verifyOTP(userId: string, code: string) {
  const otp = db.prepare("SELECT * FROM otps WHERE user_id = ? AND code = ? AND expires_at > CURRENT_TIMESTAMP")
    .get(userId, code) as any;

  if (!otp) {
    throw new Error('Invalid or expired OTP');
  }

  // Mark user as verified
  db.prepare("UPDATE users SET verified = 1 WHERE id = ?").run(userId);

  // Delete OTP
  db.prepare("DELETE FROM otps WHERE user_id = ?").run(userId);

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  return { user, token: "mock-jwt-token" };
}
