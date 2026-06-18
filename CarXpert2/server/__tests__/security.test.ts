import { describe, it, expect } from 'vitest';
import { sanitizeInput, securityHeaders } from '../middleware/security';

describe('Security Middleware', () => {
  describe('sanitizeInput', () => {
    it('should remove HTML tags from input', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = sanitizeInput(input);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).toContain('Hello');
    });

    it('should trim whitespace', () => {
      const input = '  Hello World  ';
      const result = sanitizeInput(input);
      expect(result).toBe('Hello World');
    });

    it('should handle non-string inputs gracefully', () => {
      const input = 123 as any;
      const result = sanitizeInput(input);
      expect(result).toBe(123);
    });

    it('should preserve safe content', () => {
      const input = 'Hello, this is a normal message!';
      const result = sanitizeInput(input);
      expect(result).toBe(input);
    });
  });

  describe('securityHeaders', () => {
    it('should set security headers', () => {
      const headers: Record<string, string> = {};
      const mockRes = {
        setHeader: (key: string, value: string) => {
          headers[key] = value;
        },
      };
      const mockNext = () => {};

      securityHeaders({} as any, mockRes as any, mockNext);

      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
      expect(headers['X-XSS-Protection']).toBe('1; mode=block');
      expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
      expect(headers['Content-Security-Policy']).toBeDefined();
    });
  });
});
