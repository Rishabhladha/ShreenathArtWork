import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReviewListSkeleton, ReviewSectionSkeleton } from '../src/components/shop/ReviewSectionSkeleton';

describe('Review Loading Skeletons', () => {
  it('renders ReviewListSkeleton with default 3 skeleton review cards', () => {
    const html = renderToStaticMarkup(<ReviewListSkeleton />);
    
    // Confirms accessibility attributes
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-label="Loading collector reviews"');
    
    // Confirms animated feedback indicator
    expect(html).toContain('Fetching verified collector reviews from database...');
    expect(html).toContain('animate-spin');
    expect(html).toContain('animate-pulse');
  });

  it('renders custom count of skeleton cards when specified', () => {
    const html5 = renderToStaticMarkup(<ReviewListSkeleton count={5} />);
    const html1 = renderToStaticMarkup(<ReviewListSkeleton count={1} />);
    
    // Card containers have class 'animate-pulse'
    const pulseCount5 = (html5.match(/animate-pulse/g) || []).length;
    const pulseCount1 = (html1.match(/animate-pulse/g) || []).length;
    
    expect(pulseCount5).toBe(5);
    expect(pulseCount1).toBe(1);
  });

  it('renders full ReviewSectionSkeleton with section heading and review form skeleton', () => {
    const html = renderToStaticMarkup(<ReviewSectionSkeleton />);
    
    expect(html).toContain('Collector Inquiries and Reviews');
    expect(html).toContain('Verified feedback from collectors who acquired this painting.');
    expect(html).toContain('role="status"');
    expect(html).toContain('Fetching verified collector reviews from database...');
  });
});
