
import { CacheEntry } from '../types';
import { encryptData, decryptData } from './securityService';

const CACHE_PREFIX = 'jashore_cache_';
const USAGE_KEY = 'jashore_api_usage';
const TTL = 60 * 60 * 1000; // 1 hour in milliseconds
const HOURLY_LIMIT = 250; // Increased limit for better user experience

export interface RequestStats {
  used: number;
  limit: number;
  resetInMinutes: number;
}

export const getCache = <T>(key: string, ignoreTTL = false): T | null => {
  const secureData = localStorage.getItem(CACHE_PREFIX + key);
  if (!secureData) return null;

  const entry: CacheEntry<T> | null = decryptData(secureData);
  if (!entry) return null;

  const now = Date.now();
  if (!ignoreTTL && now - entry.timestamp > TTL) {
    localStorage.removeItem(CACHE_PREFIX + key);
    return null;
  }

  return entry.data;
};

export const setCache = <T>(key: string, data: T): void => {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now()
  };
  localStorage.setItem(CACHE_PREFIX + key, encryptData(entry));
};

export const isQuotaReached = (): boolean => {
  const stats = getRequestStats();
  return stats.used >= stats.limit;
};

export const incrementRequestCount = (): void => {
  const now = Date.now();
  const rawUsage = localStorage.getItem(USAGE_KEY);
  let usage = rawUsage ? JSON.parse(rawUsage) : { count: 0, resetAt: now + TTL };

  if (now > usage.resetAt) {
    usage = { count: 1, resetAt: now + TTL };
  } else {
    usage.count += 1;
  }

  localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
};

export const getRequestStats = (): RequestStats => {
  const now = Date.now();
  const rawUsage = localStorage.getItem(USAGE_KEY);
  let usage = rawUsage ? JSON.parse(rawUsage) : { count: 0, resetAt: now + TTL };

  if (now > usage.resetAt) {
    usage = { count: 0, resetAt: now + TTL };
    localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  }

  const diffMs = usage.resetAt - now;
  const resetInMinutes = Math.max(0, Math.ceil(diffMs / (60 * 1000)));

  return {
    used: usage.count,
    limit: HOURLY_LIMIT,
    resetInMinutes
  };
};

export const clearAllCache = (): void => {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
  localStorage.removeItem(USAGE_KEY);
};
