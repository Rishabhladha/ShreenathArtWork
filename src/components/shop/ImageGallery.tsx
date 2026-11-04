'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ZoomIn, X } from 'lucide-react';

interface ImageGalleryProps {
  title: string;
  images: Array<{
    id?: string;
    url: string;
    altText: string;
    isPrimary?: boolean;
  }>;
}

export function ImageGallery({ title, images }: ImageGalleryProps) {
  const imageList =
    images.length > 0
      ? images
      : [{ url: '/placeholder-artwork.svg', altText: `${title} - Photo to be added` }];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  const activeImage = imageList[activeIndex] || imageList[0];
  const activeUrl = failedUrls[activeImage.url] ? '/placeholder-artwork.svg' : activeImage.url;

  const handleImageError = (url: string) => {
    setFailedUrls((prev) => ({ ...prev, [url]: true }));
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Main Image Container */}
      <div className="relative aspect-[4/5] bg-[#F4EFE6] border border-[#E2DACD] rounded-sm overflow-hidden group">
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#F4EFE6] via-[#FAF6EF] to-[#F4EFE6] animate-pulse flex items-center justify-center z-0">
            <span className="text-xs text-[#A8987E] tracking-wider uppercase font-sans">
              Loading Sanctum Artwork...
            </span>
          </div>
        )}

        <Image
          src={activeUrl}
          alt={activeImage.altText || title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`object-cover transition-all duration-300 group-hover:scale-[1.01] ${
            isLoading ? 'opacity-0 scale-98' : 'opacity-100 scale-100'
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => handleImageError(activeImage.url)}
        />

        {/* Zoom Button */}
        <button
          type="button"
          onClick={() => setIsZoomModalOpen(true)}
          className="absolute bottom-3 right-3 p-2 bg-[#FAF6EF]/90 border border-[#E2DACD] rounded-sm text-[#262320] hover:text-[#C47820] shadow-sm transition-colors focus-ring z-10"
          aria-label="Zoom image"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>

      {/* Thumbnails */}
      {imageList.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {imageList.map((img, idx) => {
            const thumbUrl = failedUrls[img.url] ? '/placeholder-artwork.svg' : img.url;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveIndex(idx);
                  setIsLoading(true);
                }}
                className={`relative w-20 h-24 shrink-0 bg-[#F4EFE6] rounded-sm overflow-hidden border-2 transition-colors focus-ring ${
                  idx === activeIndex ? 'border-[#262320]' : 'border-[#E2DACD] hover:border-[#8A8175]'
                }`}
                aria-label={`View photo ${idx + 1}`}
              >
                <Image
                  src={thumbUrl}
                  alt={img.altText || `${title} thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                  onError={() => handleImageError(img.url)}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Full Screen Lightbox Modal */}
      {isZoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#262320]/90 backdrop-blur-sm flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setIsZoomModalOpen(false)}
            className="absolute top-4 right-4 p-2 bg-[#FAF6EF] text-[#262320] rounded-sm hover:bg-white focus-ring"
            aria-label="Close zoom modal"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center">
            <div className="relative w-full h-full">
              <Image
                src={activeUrl}
                alt={activeImage.altText || title}
                fill
                sizes="100vw"
                className="object-contain"
                onError={() => handleImageError(activeImage.url)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
