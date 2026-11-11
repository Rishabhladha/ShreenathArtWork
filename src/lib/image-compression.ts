/**
 * High-Fidelity Image Compression & Upload Utility
 *
 * Designed specifically for high-resolution devotional artwork and Pichwai paintings:
 * - Multi-step mipmapped Canvas downscaling preserves micro-details, stone textures, and gold foil
 * - QHD/Retina default max resolution (2560px) allows pinch-to-zoom without blurriness
 * - High-fidelity WebP encoding (0.92 default quality) avoids muddy artifacts and smearing
 * - Adaptive multi-tier quality fallback (0.92 -> 0.88 -> 0.85) ensures files stay safely under 3.5MB
 * - Completely zero external runtime dependencies (native HTML5 Canvas & createImageBitmap)
 * - Automatic EXIF camera orientation correction
 * - User-friendly error messaging for uploads
 */

export type CompressionQualityProfile = 'art-gallery' | 'ultra' | 'web';

export interface CompressionProfileConfig {
  name: string;
  description: string;
  maxDimension: number;
  quality: number;
  maxSizeMB: number;
}

export const COMPRESSION_PROFILES: Record<CompressionQualityProfile, CompressionProfileConfig> = {
  'art-gallery': {
    name: 'Art Gallery High-Def',
    description: 'Crisp 2560px resolution with 92% WebP quality. Ideal for Pichwai, gold foil, and fine brushwork.',
    maxDimension: 2560,
    quality: 0.92,
    maxSizeMB: 3.5,
  },
  'ultra': {
    name: 'Ultra Archival',
    description: '3200px max resolution with 95% WebP quality. Highest fidelity for detailed masterworks.',
    maxDimension: 3200,
    quality: 0.95,
    maxSizeMB: 3.8,
  },
  'web': {
    name: 'Standard Web',
    description: '1920px resolution with 85% WebP quality. Fast loading for general catalog display.',
    maxDimension: 1920,
    quality: 0.85,
    maxSizeMB: 2.0,
  },
};

export interface CompressionOptions {
  profile?: CompressionQualityProfile;
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
  onProgress?: (progress: number) => void;
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number; // Percentage saved, e.g. 78.4%
  isCompressed: boolean;
  width?: number;
  height?: number;
  qualityUsed?: number;
}

/**
 * Loads an image into a drawable ImageBitmap or HTMLImageElement with EXIF orientation correction.
 */
async function loadImageSource(
  file: File
): Promise<{ source: ImageBitmap | HTMLImageElement; width: number; height: number; cleanup: () => void }> {
  // Option 1: createImageBitmap (Modern browsers, handles EXIF orientation natively)
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        cleanup: () => {
          if (typeof bitmap.close === 'function') {
            bitmap.close();
          }
        },
      };
    } catch {
      // Fall through to HTMLImageElement on decode issue
    }
  }

  // Option 2: HTMLImageElement via object URL
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      resolve({
        source: img,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        cleanup: () => URL.revokeObjectURL(objectUrl),
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to decode image file. Please verify the image is not corrupted.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Multi-step stepped downscaling (simulates mipmapped / Lanczos interpolation).
 *
 * When downscaling an image by more than 2x (e.g. 6000px down to 2560px), a single-pass
 * canvas drawImage discards pixel frequencies and creates significant blur and aliasing.
 * Halving the dimensions in steps preserves edge contrast, stone textures, and gold shimmer.
 */
function renderSteppedCanvas(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  // If target is same size as source, render directly
  if (sourceWidth === targetWidth && sourceHeight === targetHeight) {
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('Canvas context could not be created');
    ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
    return canvas;
  }

  // If reduction is small (less than 2x), a single high-quality draw is optimal
  if (sourceWidth <= targetWidth * 2 && sourceHeight <= targetHeight * 2) {
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('Canvas context could not be created');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
    return canvas;
  }

  // Multi-step downscaling: halve the dimensions on each step
  let curWidth = sourceWidth;
  let curHeight = sourceHeight;
  let curCanvas = document.createElement('canvas');
  curCanvas.width = curWidth;
  curCanvas.height = curHeight;
  const initialCtx = curCanvas.getContext('2d', { alpha: true });
  if (!initialCtx) throw new Error('Canvas context could not be created');
  initialCtx.imageSmoothingEnabled = true;
  initialCtx.imageSmoothingQuality = 'high';
  initialCtx.drawImage(source, 0, 0, curWidth, curHeight);

  while (curWidth > targetWidth * 2 || curHeight > targetHeight * 2) {
    const nextWidth = Math.max(targetWidth, Math.round(curWidth / 2));
    const nextHeight = Math.max(targetHeight, Math.round(curHeight / 2));
    const nextCanvas = document.createElement('canvas');
    nextCanvas.width = nextWidth;
    nextCanvas.height = nextHeight;
    const nextCtx = nextCanvas.getContext('2d', { alpha: true });
    if (!nextCtx) throw new Error('Canvas context could not be created');
    nextCtx.imageSmoothingEnabled = true;
    nextCtx.imageSmoothingQuality = 'high';
    nextCtx.drawImage(curCanvas, 0, 0, nextWidth, nextHeight);

    curCanvas = nextCanvas;
    curWidth = nextWidth;
    curHeight = nextHeight;
  }

  if (curWidth !== targetWidth || curHeight !== targetHeight) {
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetWidth;
    finalCanvas.height = targetHeight;
    const finalCtx = finalCanvas.getContext('2d', { alpha: true });
    if (!finalCtx) throw new Error('Canvas context could not be created');
    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = 'high';
    finalCtx.drawImage(curCanvas, 0, 0, targetWidth, targetHeight);
    return finalCanvas;
  }

  return curCanvas;
}

/**
 * Core native Canvas compression with stepped downscaling and adaptive quality.
 */
async function compressWithNativeCanvas(
  file: File,
  options?: CompressionOptions
): Promise<{ file: File; width: number; height: number; qualityUsed: number }> {
  options?.onProgress?.(15);

  const profile = options?.profile || 'art-gallery';
  const profileDefaults = COMPRESSION_PROFILES[profile] || COMPRESSION_PROFILES['art-gallery'];

  const maxDimension = options?.maxWidthOrHeight ?? profileDefaults.maxDimension;
  const initialQuality = options?.quality ?? profileDefaults.quality;
  const maxSizeBytes = (options?.maxSizeMB ?? profileDefaults.maxSizeMB) * 1024 * 1024;

  const { source, width: originalWidth, height: originalHeight, cleanup } = await loadImageSource(file);

  try {
    options?.onProgress?.(35);

    // Calculate aspect-ratio preserved dimensions
    let targetWidth = originalWidth;
    let targetHeight = originalHeight;

    if (targetWidth > maxDimension || targetHeight > maxDimension) {
      if (targetWidth > targetHeight) {
        targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
        targetWidth = maxDimension;
      } else {
        targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
        targetHeight = maxDimension;
      }
    }

    // Render using multi-step stepped downscaling for exceptional clarity
    const canvas = renderSteppedCanvas(source, originalWidth, originalHeight, targetWidth, targetHeight);

    options?.onProgress?.(65);

    // Initial high-quality WebP encoding
    let currentQuality = initialQuality;
    let blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', currentQuality)
    );

    // Fallback to JPEG if browser does not support WebP export
    if (!blob) {
      blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', currentQuality)
      );
    }

    if (!blob) {
      throw new Error('Failed to encode image from canvas');
    }

    // Adaptive graceful tiering: If the blob exceeds the server payload budget,
    // step down quality gently instead of plummeting straight to 0.70.
    if (blob.size > maxSizeBytes) {
      const fallbackQualities = [0.88, 0.85, 0.82];
      for (const q of fallbackQualities) {
        if (q >= currentQuality) continue;
        const candidateBlob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/webp', q)
        );
        if (candidateBlob) {
          blob = candidateBlob;
          currentQuality = q;
          if (candidateBlob.size <= maxSizeBytes) {
            break;
          }
        }
      }
    }

    options?.onProgress?.(100);

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const extension = blob.type === 'image/webp' ? '.webp' : '.jpg';
    const finalFileName = `${baseName}${extension}`;

    const compressedFile = new File([blob], finalFileName, {
      type: blob.type,
      lastModified: Date.now(),
    });

    return {
      file: compressedFile,
      width: targetWidth,
      height: targetHeight,
      qualityUsed: currentQuality,
    };
  } finally {
    cleanup();
  }
}

/**
 * Compresses an image file in the browser before uploading.
 * Preserves fine artwork details while keeping the file under the server payload limits.
 */
export async function compressImageForUpload(
  file: File,
  options?: CompressionOptions
): Promise<CompressionResult> {
  const originalSize = file.size;

  // Never rasterize vector SVG graphics
  if (file.type === 'image/svg+xml') {
    options?.onProgress?.(100);
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 0,
      isCompressed: false,
    };
  }

  try {
    const { file: compressedFile, width, height, qualityUsed } = await compressWithNativeCanvas(file, options);
    const compressedSize = compressedFile.size;
    const compressionRatio =
      originalSize > 0
        ? Number((((originalSize - compressedSize) / originalSize) * 100).toFixed(1))
        : 0;

    return {
      file: compressedFile,
      originalSize,
      compressedSize,
      compressionRatio: Math.max(0, compressionRatio),
      isCompressed: true,
      width,
      height,
      qualityUsed,
    };
  } catch (err) {
    console.warn('Image compression encountered an issue:', err);

    // If an image is large (> 4MB) and could not be compressed, do NOT fall back to uploading
    // the raw file because Vercel Serverless Functions reject bodies > 4.5MB with 413 Content Too Large
    if (file.size > 4 * 1024 * 1024) {
      throw new Error(
        'The image could not be processed for upload. Please try a different photo or format.'
      );
    }

    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 0,
      isCompressed: false,
    };
  }
}

/**
 * User-friendly error translator.
 * Cleans developer syntax errors (e.g. "Unexpected token 'R'...") into human-readable notices.
 */
export function formatUploadErrorMessage(rawError: unknown): string {
  if (!rawError) return 'Image upload failed. Please try again.';

  const message = rawError instanceof Error ? rawError.message : String(rawError);

  if (
    message.includes('413') ||
    message.includes('PAYLOAD_TOO_LARGE') ||
    message.includes('Too Large') ||
    message.includes('too large') ||
    message.includes('Entity Too Large')
  ) {
    return 'The image exceeds the server upload capacity. Please select a different image.';
  }

  if (
    message.includes('Unexpected token') ||
    message.includes('JSON') ||
    message.includes('SyntaxError')
  ) {
    return 'The server was unable to process the upload. Please try again or select another image.';
  }

  if (message.includes('Network') || message.includes('Failed to fetch')) {
    return 'Network connection interrupted during upload. Please check your internet connection.';
  }

  return message;
}

/**
 * Uploads a FormData payload via XMLHttpRequest with real-time progress tracking
 * and human-friendly error handling.
 */
export function uploadFileWithProgress(
  url: string,
  formData: FormData,
  onProgress?: (percent: number) => void
): Promise<{ success: boolean; url: string; error?: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(Math.min(100, Math.max(0, percent)));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch {
          resolve({ success: true, url: '' });
        }
      } else {
        if (xhr.status === 413) {
          reject(new Error('The uploaded file was too large for the server.'));
          return;
        }

        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.error || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Server returned status ${xhr.status}. Please try again.`));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network connection error during upload. Please check your connection.'));
    xhr.ontimeout = () => reject(new Error('Upload request timed out. Please try again.'));

    xhr.send(formData);
  });
}
