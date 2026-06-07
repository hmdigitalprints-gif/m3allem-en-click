import rateLimit from "express-rate-limit";

const getIp = (req: any): string => {
  return req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown-ip";
};

const getUserIdentity = (req: any): string => {
  if (req.user && req.user.id) {
    return `user_${req.user.id}`;
  }
  const identifier = req.body?.email || req.body?.phone || req.body?.username;
  if (identifier) {
    return `ident_${String(identifier).trim().toLowerCase()}`;
  }
  // Fallback to IP address if no explicit body parameter or user context exists
  return `ip_${getIp(req)}`;
};

// 1. LOGIN RATE LIMITERS
export const loginIpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Max 10 login attempts per IP per 5 minutes
  message: { error: "Too many login attempts from this connection. Please try again in 5 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getIp,
  validate: { trustProxy: false },
});

export const loginUserLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Max 5 login attempts per target account (email/username) per 5 minutes
  message: { error: "Too many login attempts for this account. Please try again in 5 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getUserIdentity,
  validate: { trustProxy: false },
});

// 2. REGISTER RATE LIMITERS
export const registerIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 sign-ups per IP per 15 mins to prevent mass registration abuse
  message: { error: "Too many accounts created from this connection. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getIp,
  validate: { trustProxy: false },
});

// 3. OTP REQUEST RATE LIMITERS (Prevents expensive SMS/Email bombing/abuse)
export const otpIpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 OTP requests per IP per hour
  message: { error: "Too many OTP requests from this connection. Please try again in an hour." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getIp,
  validate: { trustProxy: false },
});

export const otpUserLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Max 3 OTP requests per phone number / email / user identity in an hour
  message: { error: "Too many OTP requests for this account. Please try again in an hour." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getUserIdentity,
  validate: { trustProxy: false },
});

// 3.1. OTP VERIFICATION RATE LIMITERS (Prevents brute force verification attempts)
export const otpVerifyIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts per IP per 15 mins
  message: { error: "Too many verification attempts from this connection. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getIp,
  validate: { trustProxy: false },
});

export const otpVerifyUserLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 attempts per targeted account in 15 mins
  message: { error: "Too many verification attempts for this account. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getUserIdentity,
  validate: { trustProxy: false },
});

// 4. PASSWORD RESET RATE LIMITERS
export const passwordResetIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Max 3 reset requests per IP
  message: { error: "Too many password reset requests from this connection. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getIp,
  validate: { trustProxy: false },
});

export const passwordResetUserLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Max 3 reset requests per targeted contact identity
  message: { error: "Too many password reset requests for this account. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getUserIdentity,
  validate: { trustProxy: false },
});

// 5. MESSAGING RATE LIMITERS (Prevents chat payload flood/spam)
export const messagingIpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Max 30 messages per minute per IP
  message: { error: "You are sending messages too quickly. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getIp,
  validate: { trustProxy: false },
});

export const messagingUserLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Max 30 messages per minute per user ID
  message: { error: "You are sending messages too quickly. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getUserIdentity,
  validate: { trustProxy: false },
});

// 6. BOOKING / ORDER CREATION RATE LIMITERS
export const bookingIpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Max 10 bookings per IP per 10 mins
  message: { error: "Too many booking requests from this connection. Please try again in 10 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getIp,
  validate: { trustProxy: false },
});

export const bookingUserLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Max 5 bookings per user card in 10 mins
  message: { error: "Too many booking requests for this account. Please try again in 10 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getUserIdentity,
  validate: { trustProxy: false },
});
