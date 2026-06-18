import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';

// CSRF Token management
const csrfTokens = new Map<string, { token: string; expires: number }>();

// Generate CSRF token
export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

// Middleware to set CSRF token in cookie
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip for safe methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  
  if (safeMethods.includes(req.method)) {
    // Generate token for forms
    const sessionId = req.sessionID || 'anonymous';
    let tokenRecord = csrfTokens.get(sessionId);
    
    if (!tokenRecord || Date.now() > tokenRecord.expires) {
      const token = generateCsrfToken();
      tokenRecord = {
        token,
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
      };
      csrfTokens.set(sessionId, tokenRecord);
    }
    
    // Set token in response header for client to use
    res.setHeader('X-CSRF-Token', tokenRecord.token);
    return next();
  }
  
  // For unsafe methods, verify token
  const sessionId = req.sessionID || 'anonymous';
  const tokenRecord = csrfTokens.get(sessionId);
  const submittedToken = req.headers['x-csrf-token'] as string;
  
  if (!tokenRecord || !submittedToken || tokenRecord.token !== submittedToken) {
    return res.status(403).json({
      message: 'CSRF token غير صالح. يرجى تحديث الصفحة والمحاولة مرة أخرى.',
    });
  }
  
  if (Date.now() > tokenRecord.expires) {
    csrfTokens.delete(sessionId);
    return res.status(403).json({
      message: 'انتهت صلاحية CSRF token. يرجى تحديث الصفحة.',
    });
  }
  
  next();
}

// Simplified CSRF for API-only apps (check origin/referer)
export function simpleCsrf(req: Request, res: Response, next: NextFunction) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  
  if (safeMethods.includes(req.method)) {
    return next();
  }
  
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const host = req.headers.host;
  
  // Allow same-origin requests
  if (origin) {
    const originUrl = new URL(origin);
    if (originUrl.host === host) {
      return next();
    }
  }
  
  if (referer) {
    const refererUrl = new URL(referer);
    if (refererUrl.host === host) {
      return next();
    }
  }
  
  // Allow requests without origin/referer (from same origin by default)
  if (!origin && !referer) {
    return next();
  }
  
  return res.status(403).json({
    message: 'طلب غير مصرح به.',
  });
}

// Clean up expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, record] of csrfTokens.entries()) {
    if (now > record.expires) {
      csrfTokens.delete(sessionId);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes
