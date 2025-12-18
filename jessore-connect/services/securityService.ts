
import DOMPurify from 'dompurify';

/**
 * Modern Security Service for Jessore Connect
 * Implements Industry Standard Sanitization and State Protection
 */

// Simple robust sanitization for XSS prevention
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });
};

// Mask sensitive identifiers (e.g., email or IDs)
export const maskSensitiveData = (data: string): string => {
  if (!data) return '';
  if (data.includes('@')) {
    const [name, domain] = data.split('@');
    return `${name[0]}${'*'.repeat(name.length - 1)}@${domain}`;
  }
  return data.slice(0, 4) + '****';
};

/**
 * Standard-compliant Base64 conversion using TextEncoder
 * Prevents issues with multi-byte characters in local storage
 */
export const encryptData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    const uint8 = new TextEncoder().encode(jsonString);
    let binString = "";
    uint8.forEach((b) => binString += String.fromCharCode(b));
    return btoa(binString);
  } catch (e) {
    console.error("Encryption failed", e);
    return "";
  }
};

export const decryptData = (encryptedData: string): any => {
  try {
    if (!encryptedData) return null;
    const binString = atob(encryptedData);
    const uint8 = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
    const jsonString = new TextDecoder().decode(uint8);
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Decryption failed", e);
    return null;
  }
};

// Rate limiting state for spam prevention
const lastActionTimes: Record<string, number> = {};

export const isRateLimited = (userId: string, actionType: string, limitMs: number = 5000): boolean => {
  const now = Date.now();
  const key = `${userId}_${actionType}`;
  if (lastActionTimes[key] && now - lastActionTimes[key] < limitMs) {
    return true;
  }
  lastActionTimes[key] = now;
  return false;
};
