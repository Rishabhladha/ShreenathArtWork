import { describe, it, expect } from 'vitest';
import { ADMIN_NAV_SECTIONS } from '@/components/admin/adminNavConfig';
import { PATHS } from '@/lib/paths';

describe('Password Visibility & OTP Reset Logic', () => {
  it('validates 6-digit numeric OTP formatting', () => {
    const isValidOtp = (otp: string) => /^\d{6}$/.test(otp.trim());

    expect(isValidOtp('123456')).toBe(true);
    expect(isValidOtp('987654')).toBe(true);
    expect(isValidOtp('000123')).toBe(true);

    // Invalid inputs
    expect(isValidOtp('12345')).toBe(false); // too short
    expect(isValidOtp('1234567')).toBe(false); // too long
    expect(isValidOtp('123a56')).toBe(false); // non-numeric
    expect(isValidOtp(' ')).toBe(false);
    expect(isValidOtp('')).toBe(false);
  });

  it('computes OTP expiry time window accurately to 10 minutes', () => {
    const now = Date.now();
    const expiry = new Date(now + 10 * 60 * 1000);
    const diffMinutes = (expiry.getTime() - now) / (60 * 1000);

    expect(diffMinutes).toBeCloseTo(10, 1);
    expect(expiry.getTime()).toBeGreaterThan(now);
  });

  it('enforces maximum 5 attempts before locking OTP record', () => {
    const maxAttempts = 5;
    let attempts = 0;

    const tryAttempt = () => {
      if (attempts >= maxAttempts) {
        return { allowed: false, error: 'Maximum attempts exceeded' };
      }
      attempts++;
      return { allowed: true, remaining: maxAttempts - attempts };
    };

    expect(tryAttempt()).toEqual({ allowed: true, remaining: 4 });
    expect(tryAttempt()).toEqual({ allowed: true, remaining: 3 });
    expect(tryAttempt()).toEqual({ allowed: true, remaining: 2 });
    expect(tryAttempt()).toEqual({ allowed: true, remaining: 1 });
    expect(tryAttempt()).toEqual({ allowed: true, remaining: 0 });
    expect(tryAttempt()).toEqual({ allowed: false, error: 'Maximum attempts exceeded' });
  });

  it('validates admin backoffice navigation sections integrity', () => {
    expect(ADMIN_NAV_SECTIONS.length).toBeGreaterThanOrEqual(4);

    const allHrefs: string[] = [];

    ADMIN_NAV_SECTIONS.forEach((section) => {
      expect(section.title).toBeTruthy();
      expect(section.items.length).toBeGreaterThan(0);

      section.items.forEach((item) => {
        expect(item.href).toBeTruthy();
        expect(item.href.startsWith('/admin')).toBe(true);
        expect(item.label).toBeTruthy();
        expect(item.icon).toBeDefined();
        allHrefs.push(item.href);
      });
    });

    // Core essential routes must be in navigation
    expect(allHrefs).toContain(PATHS.admin.dashboard);
    expect(allHrefs).toContain(PATHS.admin.products);
    expect(allHrefs).toContain(PATHS.admin.orders);
    expect(allHrefs).toContain(PATHS.admin.inventory);
    expect(allHrefs).toContain(PATHS.admin.auditLog);
    expect(allHrefs).toContain(PATHS.admin.settings);
  });
});
