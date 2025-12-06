import { describe, it, expect, vi } from 'vitest';
import { rateLimit } from '../middleware/rateLimit';

describe('Rate Limit Middleware', () => {
  const mockNext = vi.fn();

  const createMockReq = (ip: string = '127.0.0.1') => ({
    ip,
    socket: { remoteAddress: ip },
  });

  const createMockRes = () => {
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    return res;
  };

  it('should allow requests within rate limit', () => {
    const limiter = rateLimit({
      windowMs: 60000,
      maxRequests: 10,
    });

    const req = createMockReq('192.168.1.1') as any;
    const res = createMockRes();
    mockNext.mockClear();

    // First request should pass
    limiter(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should block requests exceeding rate limit', () => {
    const limiter = rateLimit({
      windowMs: 60000,
      maxRequests: 2,
    });

    const ip = '192.168.1.2';
    const req = createMockReq(ip) as any;
    
    // First two requests should pass
    for (let i = 0; i < 2; i++) {
      const res = createMockRes();
      mockNext.mockClear();
      limiter(req, res, mockNext);
      expect(mockNext).toHaveBeenCalled();
    }

    // Third request should be blocked
    const res = createMockRes();
    mockNext.mockClear();
    limiter(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        retryAfter: expect.any(Number),
      })
    );
  });

  it('should use custom error message', () => {
    const customMessage = 'Too many requests!';
    const limiter = rateLimit({
      windowMs: 60000,
      maxRequests: 1,
      message: customMessage,
    });

    const ip = '192.168.1.3';
    const req = createMockReq(ip) as any;
    
    // First request
    limiter(req, createMockRes(), vi.fn());
    
    // Second request should be blocked with custom message
    const res = createMockRes();
    limiter(req, res, vi.fn());
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: customMessage,
      })
    );
  });

  it('should track requests per IP independently', () => {
    const limiter = rateLimit({
      windowMs: 60000,
      maxRequests: 1,
    });

    // First IP - first request
    const req1 = createMockReq('10.0.0.1') as any;
    const res1 = createMockRes();
    mockNext.mockClear();
    limiter(req1, res1, mockNext);
    expect(mockNext).toHaveBeenCalled();

    // Second IP - should also pass
    const req2 = createMockReq('10.0.0.2') as any;
    const res2 = createMockRes();
    mockNext.mockClear();
    limiter(req2, res2, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
