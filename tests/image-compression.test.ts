import { describe, it, expect } from 'vitest';
import {
  COMPRESSION_PROFILES,
  formatUploadErrorMessage,
  compressImageForUpload,
  type CompressionQualityProfile,
} from '../src/lib/image-compression';

describe('Image Compression Configuration & Profiles', () => {
  it('defines all required quality profiles with rigorous parameters', () => {
    const profiles: CompressionQualityProfile[] = ['art-gallery', 'ultra', 'web'];
    profiles.forEach((p) => {
      expect(COMPRESSION_PROFILES[p]).toBeDefined();
      expect(COMPRESSION_PROFILES[p].maxDimension).toBeGreaterThanOrEqual(1920);
      expect(COMPRESSION_PROFILES[p].quality).toBeGreaterThanOrEqual(0.85);
      expect(COMPRESSION_PROFILES[p].maxSizeMB).toBeLessThanOrEqual(4.0); // Never violate Vercel 4.5MB limit
    });
  });

  it('configures art-gallery profile for high-definition Pichwai rendering', () => {
    const profile = COMPRESSION_PROFILES['art-gallery'];
    expect(profile.maxDimension).toBe(2560);
    expect(profile.quality).toBe(0.92);
    expect(profile.maxSizeMB).toBe(3.5);
  });

  it('configures ultra profile for archival masterworks', () => {
    const profile = COMPRESSION_PROFILES['ultra'];
    expect(profile.maxDimension).toBe(3200);
    expect(profile.quality).toBe(0.95);
    expect(profile.maxSizeMB).toBe(3.8);
  });

  it('configures web profile with crisp 1920px bounds', () => {
    const profile = COMPRESSION_PROFILES['web'];
    expect(profile.maxDimension).toBe(1920);
    expect(profile.quality).toBe(0.85);
    expect(profile.maxSizeMB).toBe(2.0);
  });
});

describe('formatUploadErrorMessage', () => {
  it('translates 413 status / payload too large to user-friendly message', () => {
    const err = new Error('Request Entity Too Large (413)');
    const msg = formatUploadErrorMessage(err);
    expect(msg).toContain('server upload capacity');
  });

  it('translates JSON parsing / syntax errors cleanly', () => {
    const err = new Error("Unexpected token '<', <html>... is not valid JSON");
    const msg = formatUploadErrorMessage(err);
    expect(msg).toContain('server was unable to process the upload');
  });

  it('translates network failures gracefully', () => {
    const err = new Error('Failed to fetch');
    const msg = formatUploadErrorMessage(err);
    expect(msg).toContain('Network connection interrupted');
  });

  it('preserves clean descriptive errors', () => {
    const msg = formatUploadErrorMessage('Invalid file format selected');
    expect(msg).toBe('Invalid file format selected');
  });

  it('handles empty or unknown errors', () => {
    const msg = formatUploadErrorMessage(null);
    expect(msg).toBe('Image upload failed. Please try again.');
  });
});

describe('SVG bypass handling', () => {
  it('never rasterizes or degrades vector SVG images', async () => {
    const svgBlob = new Blob(['<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg>'], {
      type: 'image/svg+xml',
    });
    const svgFile = new File([svgBlob], 'motif.svg', { type: 'image/svg+xml' });

    let progressReported = 0;
    const result = await compressImageForUpload(svgFile, {
      onProgress: (p) => {
        progressReported = p;
      },
    });

    expect(result.isCompressed).toBe(false);
    expect(result.file.name).toBe('motif.svg');
    expect(result.compressionRatio).toBe(0);
    expect(progressReported).toBe(100);
  });
});
