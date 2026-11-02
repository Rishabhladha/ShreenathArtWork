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

  const activeImage = imageList[activeIndex] || imageList[0];

  return (
    <div className="space-y-4">
      {/* Main Image Container */}
      <div className="relative aspect-[4/5] bg-[#F4EFE6] border border-[#E2DACD] rounded-sm overflow-hidden group">
        <Image
          src={activeImage.url}
          alt={activeImage.altText || title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.01]"
        />

        {/* Zoom Button */}
        <button
          type="button"
          onClick={() => setIsZoomModalOpen(true)}
          className="absolute bottom-3 right-3 p-2 bg-[#FAF6EF]/90 border border-[#E2DACD] rounded-sm text-[#262320] hover:text-[#C47820] shadow-sm transition-colors focus-ring"
          aria-label="Zoom image"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>

      {/* Thumbnails */}
      {imageList.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {imageList.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative w-20 h-24 shrink-0 bg-[#F4EFE6] rounded-sm overflow-hidden border-2 transition-colors focus-ring ${
                idx === activeIndex ? 'border-[#262320]' : 'border-[#E2DACD] hover:border-[#8A8175]'
              }`}
              aria-label={`View photo ${idx + 1}`}
            >
              <Image
                src={img.url}
                alt={img.altText || `${title} thumbnail ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
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
                src={activeImage.url}
                alt={activeImage.altText || title}
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

