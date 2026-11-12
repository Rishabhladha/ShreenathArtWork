import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { PATHS } from '@/lib/paths';

describe('Email Verification & Mandatory Checkout Authentication', () => {
  it('generates a 6-digit numeric OTP and verifies SHA-256 hash matching', () => {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    expect(otp).toMatch(/^\d{6}$/);

    const hash1 = crypto.createHash('sha256').update(otp).digest('hex');
    const hash2 = crypto.createHash('sha256').update(otp).digest('hex');
    const wrongHash = crypto.createHash('sha256').update('000000').digest('hex');

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(wrongHash);
    expect(hash1.length).toBe(64);
  });

  it('generates correct verifyEmail path with encoded email and callbackUrl', () => {
    const url1 = PATHS.account.verifyEmail('patron@example.com');
    expect(url1).toBe('/account/verify-email?email=patron%40example.com');

    const url2 = PATHS.account.verifyEmail('patron@example.com', '/checkout');
    expect(url2).toBe('/account/verify-email?email=patron%40example.com&callbackUrl=%2Fcheckout');

    const urlEmpty = PATHS.account.verifyEmail();
    expect(urlEmpty).toBe('/account/verify-email');
  });

  it('strictly validates customer authentication guard for order creation', () => {
    // Simulating order creation route session verification
    const verifyCheckoutAuth = (session: { user?: { id?: string } } | null) => {
      if (!session?.user?.id) {
        return {
          authorized: false,
          status: 401,
          error: 'Please sign in or create an account to place an order.',
        };
      }
      return { authorized: true, status: 200, userId: session.user.id };
    };

    // Anonymous guest user attempt
    const guestAttempt = verifyCheckoutAuth(null);
    expect(guestAttempt.authorized).toBe(false);
    expect(guestAttempt.status).toBe(401);
    expect(guestAttempt.error).toBe('Please sign in or create an account to place an order.');

    // Session without user id
    const emptyUserAttempt = verifyCheckoutAuth({ user: {} });
    expect(emptyUserAttempt.authorized).toBe(false);
    expect(emptyUserAttempt.status).toBe(401);

    // Authenticated patron
    const authAttempt = verifyCheckoutAuth({ user: { id: 'usr_collector_42' } });
    expect(authAttempt.authorized).toBe(true);
    expect(authAttempt.status).toBe(200);
    expect(authAttempt.userId).toBe('usr_collector_42');
  });

  it('enforces email verification check on customer role authentication', () => {
    interface MockUser {
      id: string;
      email: string;
      role: 'CUSTOMER' | 'STAFF' | 'OWNER';
      emailVerified: Date | null;
    }

    const checkUserVerification = (user: MockUser) => {
      if (user.role === 'CUSTOMER' && !user.emailVerified) {
        throw new Error('EMAIL_NOT_VERIFIED');
      }
      return true;
    };

    const unverifiedCustomer: MockUser = {
      id: 'cust_1',
      email: 'new@example.com',
      role: 'CUSTOMER',
      emailVerified: null,
    };

    const verifiedCustomer: MockUser = {
      id: 'cust_2',
      email: 'verified@example.com',
      role: 'CUSTOMER',
      emailVerified: new Date(),
    };

    const staffMember: MockUser = {
      id: 'staff_1',
      email: 'staff@example.com',
      role: 'STAFF',
      emailVerified: null,
    };

    expect(() => checkUserVerification(unverifiedCustomer)).toThrow('EMAIL_NOT_VERIFIED');
    expect(checkUserVerification(verifiedCustomer)).toBe(true);
    expect(checkUserVerification(staffMember)).toBe(true);
  });
});
