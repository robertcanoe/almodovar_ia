interface RateLimiterOptions {
  windowMs: number;
  max: number;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private requests: Map<string, RequestRecord>;
  private windowMs: number;
  private max: number;

  constructor(options: RateLimiterOptions) {
    this.requests = new Map();
    this.windowMs = options.windowMs;
    this.max = options.max;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  check(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
    this.cleanup();
    const now = Date.now();
    const record = this.requests.get(ip);

    if (!record) {
      this.requests.set(ip, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return { allowed: true, remaining: this.max - 1, resetTime: now + this.windowMs };
    }

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + this.windowMs;
      return { allowed: true, remaining: this.max - 1, resetTime: record.resetTime };
    }

    if (record.count >= this.max) {
      return { allowed: false, remaining: 0, resetTime: record.resetTime };
    }

    record.count += 1;
    return { allowed: true, remaining: this.max - record.count, resetTime: record.resetTime };
  }
}