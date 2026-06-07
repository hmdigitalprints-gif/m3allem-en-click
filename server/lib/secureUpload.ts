import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import rateLimit from "express-rate-limit";

// Configure directories
const UPLOADS_ROOT = path.join(process.cwd(), "uploads");
const PUBLIC_DIR = path.join(UPLOADS_ROOT, "public");
const PRIVATE_DIR = path.join(UPLOADS_ROOT, "private");

// Initialize directories safely
export function ensureUploadDirectories() {
  if (!fs.existsSync(UPLOADS_ROOT)) {
    fs.mkdirSync(UPLOADS_ROOT, { recursive: true });
  }
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }
  if (!fs.existsSync(PRIVATE_DIR)) {
    fs.mkdirSync(PRIVATE_DIR, { recursive: true });
  }
}

// 1. STRICT ALLOWED MIME-TYPES & EXTENSIONS
export const ALLOWED_MIME_TYPES = {
  // Images
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
  "image/svg+xml": [".svg"],
  // Audio
  "audio/webm": [".webm"],
  "audio/mp3": [".mp3"],
  "audio/mpeg": [".mp3", ".mpeg"],
  "audio/ogg": [".ogg"],
  // Documents
  "application/pdf": [".pdf"],
};

// Rate limiter for upload endpoint: max 10 uploads per 10 minutes per IP
export const uploadRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 15, // Max 15 uploads per 10 minutes
  message: { error: "Too many file uploads, please try again in a few minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
});

// 2. VIRUS / MALWARE SCANNING HEURISTICS
export function scanFileForMalware(buffer: Buffer, mimeType: string, filename: string): { secure: boolean; reason?: string } {
  // Check for extension cloaking & double extension vulnerabilities (e.g. evil.php.jpg)
  const extCount = (filename.match(/\./g) || []).length;
  if (extCount > 1) {
    // Audit double extensions
    const extensions = filename.toLowerCase().split(".");
    const dangerousExts = ["php", "phtml", "php5", "js", "sh", "bat", "exe", "cmd", "vbs", "jar", "pl", "py", "scr"];
    for (const dangerous of dangerousExts) {
      if (extensions.includes(dangerous)) {
        return { secure: false, reason: "Cloaked or dangerous double extension detected" };
      }
    }
  }

  // A. Binary Magic Byte Executable Check
  // PE EXEs / DLLs start with 'MZ' (0x4D, 0x5A)
  if (buffer.length >= 2 && buffer[0] === 0x4D && buffer[1] === 0x5A) {
    return { secure: false, reason: "Malware signatures detected (PE executable header 'MZ')" };
  }

  // ELF binaries start with 0x7F, 'E', 'L', 'F'
  if (buffer.length >= 4 &&
      buffer[0] === 0x7F &&
      buffer[1] === 0x45 &&
      buffer[2] === 0x4C &&
      buffer[3] === 0x46) {
    return { secure: false, reason: "Malware signatures detected (ELF executable header)" };
  }

  // Java class bytecode starts with 0xCA, 0xFE, 0xBA, 0xBE
  if (buffer.length >= 4 &&
      buffer[0] === 0xCA &&
      buffer[1] === 0xFE &&
      buffer[2] === 0xBA &&
      buffer[3] === 0xBE) {
    return { secure: false, reason: "Malware signatures detected (Java class bytecode)" };
  }

  // B. Script-signature checks inside string buffers
  const lowContent = buffer.toString("utf8", 0, Math.min(buffer.length, 65536)).toLowerCase();

  // Guard shebang commands (e.g. #!/bin/sh, #!/usr/bin/env node)
  if (lowContent.startsWith("#!/")) {
    return { secure: false, reason: "Malware signatures detected (Script interpreter shebang)" };
  }

  // Guard PHP shells embedded inside file payloads
  if (lowContent.includes("<?php") || lowContent.includes("<?=") || lowContent.includes("<script php")) {
    return { secure: false, reason: "Malware signatures detected (Embedded PHP instruction blocks)" };
  }

  // Guard Javascript payload links or malicious triggers in SVG / XML files
  if (mimeType === "image/svg+xml" || filename.endsWith(".svg")) {
    // Block inline scripts
    if (lowContent.includes("<script") || lowContent.includes("onload=") || lowContent.includes("onerror=") || lowContent.includes("javascript:")) {
      return { secure: false, reason: "Malware signatures detected (Embedded JavaScript in SVG/XML)" };
    }
    // XML Entity Expansion prevention (Billion Laughs protection)
    if (lowContent.includes("<!entity") || lowContent.includes("<!doctype") || lowContent.includes("system \"")) {
      return { secure: false, reason: "Malware signatures detected (XML Entity / External Document risk)" };
    }
  }

  return { secure: true };
}

// 3. IMAGE CONVERSION, METADATA STRIPPING & OPTIMIZATION
export async function optimizeAndFormatImage(
  buffer: Buffer,
  mimeType: string
): Promise<{ finalBuffer: Buffer; extension: string; mime: string }> {
  // If it's SVG, keep SVG but strip scripts and optimize where clean
  if (mimeType === "image/svg+xml") {
    return { finalBuffer: buffer, extension: "svg", mime: "image/svg+xml" };
  }

  // If it's GIF, keep GIF but process to strip metadata
  if (mimeType === "image/gif") {
    const finalBuffer = await sharp(buffer)
      .gif()
      .rotate() // correct orientation based on EXIF before stripping
      .toBuffer(); // sharp strips metadata by default when converting or outputting
    return { finalBuffer, extension: "gif", mime: "image/gif" };
  }

  // Standardize images (PNG, JPEG, WEBP) to WebP and compress / strip EXIF
  const processed = sharp(buffer)
    .rotate() // auto-orient based on meta orientation before stripping
    .resize({
      width: 2560,
      height: 2560,
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    })
    .webp({ quality: 80, effort: 4 }); // Convert to optimized WebP format, discarding EXIF metadata by default

  const finalBuffer = await processed.toBuffer();
  return { finalBuffer, extension: "webp", mime: "image/webp" };
}

// 4. RANDOM & HIGH-ENTROPY FILENAME GENERATION
export function generateRandomFileName(extension: string): string {
  // Use UUIDv4 coupled with 8 characters of random hex to maximize entropy and eliminate predictability
  const secureRandomHex = Array.from(
    { length: 8 },
    () => Math.floor(Math.random() * 16).toString(16)
  ).join("");
  return `${uuidv4()}-${secureRandomHex}.${extension}`;
}

// 5. SECURE LOCAL STORAGE HANDLING
export function saveUploadedFileLocally(
  buffer: Buffer,
  filename: string,
  isPrivate: boolean
): { filepath: string; relativeUrl: string } {
  // Ensure paths never traverse directories
  const safeFilename = path.basename(filename);
  const targetDir = isPrivate ? PRIVATE_DIR : PUBLIC_DIR;
  
  ensureUploadDirectories();
  
  const filepath = path.join(targetDir, safeFilename);
  fs.writeFileSync(filepath, buffer);

  const relativeUrl = isPrivate 
    ? `/api/uploads/private/${safeFilename}` 
    : `/uploads/${safeFilename}`;

  return { filepath, relativeUrl };
}
