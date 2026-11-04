import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
  onProgress?: (progress: number) => void;
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number; // Percentage saved, e.g. 95.4
  isCompressed: boolean;
}

/**
 * Compresses an image file in the browser before uploading to Vercel Blob / API.
 * - Caps max dimension to 1920px (preserving aspect ratio)
 * - Converts to modern WebP format
 * - Drops file size by ~90-97% (typically 150KB - 300KB)
 * - Preserves visually lossless quality for artwork display
 * - Calls options.onProgress (0-100) to report real-time compression progress
 * - Gracefully falls back to the original file if compression cannot proceed
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

  // If the file is already tiny (< 150KB) and already WebP, no need to re-encode
  if (file.type === 'image/webp' && file.size < 150 * 1024) {
    options?.onProgress?.(100);
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 0,
      isCompressed: false,
    };
  }

  const compressionConfig = {
    maxSizeMB: options?.maxSizeMB ?? 0.35, // Target max ~350KB
    maxWidthOrHeight: options?.maxWidthOrHeight ?? 1920,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: options?.quality ?? 0.82,
    onProgress: options?.onProgress,
  };

  try {
    const compressedBlob = await imageCompression(file, compressionConfig);

    // Create a new File with .webp extension and matching MIME type
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const webpFileName = `${baseName}.webp`;

    const compressedFile = new File([compressedBlob], webpFileName, {
      type: 'image/webp',
      lastModified: Date.now(),
    });

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
    };
  } catch (error) {
    console.warn(
      'Frontend image compression failed or was interrupted, falling back to original file:',
      error
    );
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
 * Uploads a FormData payload via XMLHttpRequest to track real-time upload percentage (0% -> 100%).
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
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.error || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network connection error during upload'));
    xhr.ontimeout = () => reject(new Error('Upload request timed out'));

    xhr.send(formData);
  });
}
