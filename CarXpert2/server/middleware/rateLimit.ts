import { Request, Response, NextFunction } from 'express';

// Simple in-memory rate limiter
const requestCounts = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number;    // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;    // Error message
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, message = 'تم تجاوز الحد المسموح من الطلبات. حاول لاحقاً.' } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    
    const record = requestCounts.get(ip);
    
    if (!record || now > record.resetTime) {
      // Reset or create new record
      requestCounts.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }
    
    if (record.count >= maxRequests) {
      return res.status(429).json({
        message,
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
    }
    
    record.count++;
    next();
  };
}

// Preset rate limiters
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'تم تجاوز الحد المسموح من الطلبات. حاول بعد 15 دقيقة.',
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
  message: 'تم تجاوز محاولات تسجيل الدخول. حاول بعد ساعة.',
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
  message: 'تم تجاوز الحد المسموح. حاول بعد دقيقة.',
});

// Clean up old records periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, 60 * 1000); // Clean up every minute
