import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';
import { WindowRateCounter } from '../utils/ratePolicy';

// These are local-process safeguards. Multi-instance production must use a
// shared, trusted store and independently configured edge protections.
const loginNetwork = new WindowRateCounter(150, 15 * 60_000);
const loginAccount = new WindowRateCounter(12, 15 * 60_000);
const registerNetwork = new WindowRateCounter(30, 60 * 60_000);
const recoveryNetwork = new WindowRateCounter(30, 60 * 60_000);
const refreshNetwork = new WindowRateCounter(200, 15 * 60_000);

function networkKey(req: Request): string {
  // Do not trust user-supplied X-Forwarded-For without a configured proxy.
  // Under a same-origin Next rewrite, this can be the proxy's address.
  return (req.ip || req.socket.remoteAddress || 'unknown').slice(0,200);
}
function reject(res: Response, retryAfterSeconds: number): void {
  res.setHeader('Retry-After', String(retryAfterSeconds));
  res.setHeader('Cache-Control', 'no-store');
  res.status(429).json({ success: false, error: 'Too many requests. Please try again later.' });
}
function byNetwork(counter: WindowRateCounter) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = counter.take(networkKey(req));
    if (!result.allowed) { reject(res, result.retryAfterSeconds); return; }
    next();
  };
}

export const limitRegistration = byNetwork(registerNetwork);
export const limitRecovery = byNetwork(recoveryNetwork);
export const limitRefresh = byNetwork(refreshNetwork);

export function limitLogin(req: Request, res: Response, next: NextFunction): void {
  const ip = loginNetwork.take(networkKey(req));
  if (!ip.allowed) { reject(res, ip.retryAfterSeconds); return; }

  // A separate account bucket also restricts guesses spread across networks.
  // It applies to nonexistent accounts too, avoiding existence-based behavior.
  const raw = req.body?.email;
  if (typeof raw === 'string' && raw.trim()) {
    const normalized = raw.trim().toLowerCase().slice(0,254);
    const hashed = createHash('sha256').update(normalized).digest('hex');
    const account = loginAccount.take(hashed);
    if (!account.allowed) { reject(res, account.retryAfterSeconds); return; }
  }
  next();
}
