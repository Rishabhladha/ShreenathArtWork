import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { PATHS } from '@/lib/paths';

describe('UI Redesign & Modern Web Guidance Conformance', () => {
  const globalsCssPath = path.resolve(process.cwd(), 'src/app/globals.css');
  const globalsCss = fs.readFileSync(globalsCssPath, 'utf-8');

  it('strictly forbids purple or violet gradients across globals.css', () => {
    expect(globalsCss.toLowerCase()).not.toContain('purple');
    expect(globalsCss.toLowerCase()).not.toContain('violet');
    expect(globalsCss.toLowerCase()).not.toContain('from-purple');
    expect(globalsCss.toLowerCase()).not.toContain('to-purple');
  });

  it('defines the authentic Nathdwara sanctum palette design tokens', () => {
    expect(globalsCss).toContain('--bg-ivory: #FAF7EE');
    expect(globalsCss).toContain('--border-sand: #DEC99C');
    expect(globalsCss).toContain('--text-charcoal: #231C10');
    expect(globalsCss).toContain('--accent-saffron: #B8860B');
    expect(globalsCss).toContain('--accent-gold: #C59B27');
  });

  it('enforces modern text wrapping for typography legibility', () => {
    expect(globalsCss).toContain('text-wrap: balance;');
    expect(globalsCss).toContain('text-wrap: pretty;');
  });

  it('provides coarse touch target and mobile safe-area utilities', () => {
    expect(globalsCss).toContain('padding-bottom: max(1rem, env(safe-area-inset-bottom));');
    expect(globalsCss).toContain('no-scrollbar');
    expect(globalsCss).toContain('min-height: 44px');
  });

  it('mobile bottom navigation links resolve to valid type-safe paths', () => {
    expect(PATHS.home).toBe('/');
    expect(PATHS.catalog()).toBe('/catalog');
    expect(PATHS.account.wishlist).toBe('/account/wishlist');
    expect(PATHS.trackOrder()).toBe('/track-order');
  });
});
