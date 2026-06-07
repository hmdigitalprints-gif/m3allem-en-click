import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

/**
 * CSRF Protection Middleware for Express utilizing the safe Stateless Double Submit Cookie pattern.
 * 
 * DESIGN FEATURES:
 * 1. Stateless - does not require server-side session stores.
 * 2. Mobile API-friendly - bypasses verification if authorization uses HTTP Headers (e.g., Bearer token) and 
 *    no browser-authenticated cookie (token) is present.
 * 3. Exempts specified routes (e.g. external third-party webhooks) from verification.
 * 4. Automatic CSRF cookie provisioning on GET, HEAD, or OPTIONS.
 */

// Exempt routes from CSRF checking (e.g., public webhooks)
const EXEMPT_PATHS = [
  "/api/webhooks",
];

export const csrfProtection = (req: any, res: Response, next: NextFunction) => {
  // 1. Skip checks for safe, read-only methods
  const isSafeMethod = ["GET", "HEAD", "OPTIONS"].includes(req.method);

  // Parse path without query queries to matching exempt list
  const parsedPath = req.path || "";
  const isExempt = EXEMPT_PATHS.some((path) => parsedPath.startsWith(path));

  // 2. Generate and attach code CSRF token if not already current
  let csrfToken = req.cookies?.csrf_token;
  if (!csrfToken) {
    csrfToken = crypto.randomBytes(32).toString("hex");
    
    // Set cookie which the client application JavaScript can read and send back in headers
    res.cookie("csrf_token", csrfToken, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false, // Must be accessible via frontend JS
    });
  }

  // Set response headers so frontend can easily capture it if needed
  res.setHeader("X-CSRF-Token", csrfToken);

  if (isSafeMethod || isExempt) {
    return next();
  }

  // 3. Bypass checking if no Browser Session Cookie (bearer/token) is present.
  // CSRF is fundamentally a browser cookie exploitation vulnerability.
  // If the request doesn't rely on cookie-based session identifiers for authorization, CSRF is technically impossible.
  // This avoids breaking external API consumers, mobile applications, or postman testing.
  const hasBrowserSessionCookie = !!req.cookies?.token;
  if (!hasBrowserSessionCookie) {
    return next();
  }

  // 4. Validate CSRF double-submitted token
  const clientCsrfToken = 
    req.headers["x-csrf-token"] || 
    req.body?._csrf;

  if (!clientCsrfToken || !csrfToken || clientCsrfToken !== csrfToken) {
    console.warn(`[SECURITY WARNING] Blocked active CSRF attempt on endpoint: ${req.method} ${req.originalUrl}`);
    return res.status(403).json({
      error: "CSRF token validation failed. Access denied.",
      code: "CSRF_ERROR"
    });
  }

  next();
};

/**
 * Optional route to explicitly fetch a fresh CSRF token.
 */
export const getCsrfTokenRoute = (req: any, res: Response) => {
  let csrfToken = req.cookies?.csrf_token;
  if (!csrfToken) {
    csrfToken = crypto.randomBytes(32).toString("hex");
    res.cookie("csrf_token", csrfToken, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
    });
  }
  res.json({ csrfToken });
};
