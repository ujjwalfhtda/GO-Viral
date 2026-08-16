/**
 * Security Engine for PromptVerse
 * Provides XSS Sanitization, Input Validation, and Rate Limiting
 */

// Simple in-memory rate limiter tracking IP request rates
const rateLimitMap = new Map();

/**
 * Check if request IP exceeds max rate limit
 * @param {string} ip Client IP address
 * @param {number} limit Max requests per window
 * @param {number} windowMs Time window in milliseconds (default 60s)
 * @returns {boolean} True if allowed, false if rate limited
 */
export function checkRateLimit(ip = "anonymous", limit = 40, windowMs = 60000) {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count += 1;
  }

  rateLimitMap.set(ip, record);

  // Clean up stale IP records periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetTime) rateLimitMap.delete(key);
    }
  }

  return record.count <= limit;
}

/**
 * Sanitize string against XSS script injection & malicious payloads
 * @param {string} str Raw string input
 * @returns {string} Cleaned safe string
 */
export function sanitizeString(str) {
  if (typeof str !== "string") return "";
  return str
    .trim()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .replace(/javascript:/gi, "")
    .replace(/data:(?!image\/(png|jpeg|jpg|webp|gif);base64,)/gi, "");
}

/**
 * Decode HTML entities back to safe readable text
 */
export function decodeSanitizedString(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

/**
 * Validate image URL protocol
 */
export function isValidImageUrl(url) {
  if (!url) return true; // Optional field
  if (typeof url !== "string") return false;
  let cleanUrl = url.trim();
  if (!cleanUrl) return true;
  if (cleanUrl.startsWith("data:image/") || cleanUrl.startsWith("/")) return true;
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    cleanUrl = "https://" + cleanUrl;
  }
  try {
    const parsed = new URL(cleanUrl);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (e) {
    return false;
  }
}

/**
 * Server-side strict payload validator for prompt creation/updates
 */
export function validateAndSanitizePrompt(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid request body");
  }

  const title = sanitizeString(data.title || "");
  const text = sanitizeString(data.text || "");
  const model = sanitizeString(data.model || "Midjourney");
  const cat = sanitizeString(data.cat || "Photography");
  const negative = sanitizeString(data.negative || "");
  let imageUrl = (data.imageUrl || "").trim();
  const coverStyle = sanitizeString(data.coverStyle || "v-neon");
  const likes = typeof data.likes === "number" ? Math.max(0, data.likes) : 1;
  const isHtmlMode = Boolean(data.isHtmlMode);
  const isImageEditMode = Boolean(data.isImageEditMode);
  const isIdentityMode = Boolean(data.isIdentityMode);

  if (imageUrl && !imageUrl.startsWith("data:image/") && !imageUrl.startsWith("/") && !imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
    imageUrl = "https://" + imageUrl;
  }

  if (!title || title.length < 2) {
    throw new Error("Title must be at least 2 characters long");
  }
  if (title.length > 150) {
    throw new Error("Title cannot exceed 150 characters");
  }

  if (!text || text.length < 5) {
    throw new Error("Prompt text must be at least 5 characters long");
  }
  if (text.length > 3000) {
    throw new Error("Prompt text cannot exceed 3000 characters");
  }

  if (imageUrl && !isValidImageUrl(imageUrl)) {
    throw new Error("Invalid image URL. Must be http://, https://, or data:image/");
  }

  return {
    title: decodeSanitizedString(title),
    text: decodeSanitizedString(text),
    model,
    cat,
    negative: decodeSanitizedString(negative),
    imageUrl,
    coverStyle,
    likes,
    isHtmlMode,
    isImageEditMode,
    isIdentityMode
  };
}
