'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/money';
import { useWishlistStore } from '@/store/wishlist-store';
import { Heart, Loader2 } from 'lucide-react';
import { PATHS } from '@/lib/paths';

interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  medium: string;
  categoryName?: string;
  price: number;
  mrp?: number | null;
  image: string;
  stock: number;
}

export function ProductCard({
  id,
  title,
  slug,
  medium,
  categoryName,
  price,
  mrp,
  image,
  stock,
}: ProductCardProps) {
  const { isInWishlist, addItem, removeItem } = useWishlistStore();
  const wishlisted = isInWishlist(id);
  const [imgSrc, setImgSrc] = useState(image || '/placeholder-artwork.svg');
  const [imgLoading, setImgLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlisted) {
      removeItem(id);
    } else {
      addItem({ productId: id, title, slug, price, image: imgSrc });
    }
  };

  const handleNavigate = () => {
    setIsNavigating(true);
  };

  const productUrl = PATHS.product(slug);

  return (
    <article className="group bg-white border border-[#DEC99C] rounded-xs overflow-hidden flex flex-col transition-all duration-300 shadow-[0_2px_8px_rgba(35,28,16,0.04)] hover:shadow-[0_12px_28px_rgba(35,28,16,0.12)] hover:border-[#B8860B] relative">
      {/* Artwork Image Container */}
      <Link
        href={productUrl}
        prefetch={true}
        onClick={handleNavigate}
        className="relative block aspect-[4/5] bg-[#FAF7EE] overflow-hidden border-b border-[#DEC99C]/60 focus-ring"
      >
        {/* Skeleton Shimmer while loading */}
        {imgLoading && (
          <div className="absolute inset-0 bg-[#F5EFE0] animate-pulse flex items-center justify-center">
            <span className="text-[10px] text-[#7A694F] tracking-wider uppercase font-medium">Loading artwork...</span>
          </div>
        )}

        <Image
          src={imgSrc}
          alt={title}
          fill
          quality={85}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] ${
            imgLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
          onLoad={() => setImgLoading(false)}
          onError={() => {
            if (imgSrc !== '/placeholder-artwork.svg') {
              setImgSrc('/placeholder-artwork.svg');
            }
            setImgLoading(false);
          }}
        />

        {/* Navigation Loading Spinner Overlay */}
        {isNavigating && (
          <div className="absolute inset-0 bg-[#231C10]/40 backdrop-blur-[1px] flex items-center justify-center transition-opacity z-20">
            <div className="flex items-center gap-2 bg-[#231C10]/95 text-[#FAF7EE] text-xs px-3.5 py-2 rounded-xs shadow-lg">
              <Loader2 className="w-4 h-4 animate-spin text-[#C59B27]" />
              <span className="font-medium">Opening painting...</span>
            </div>
          </div>
        )}

        {/* Wishlist Button - 44px touch area for coarse touch on mobile */}
        <button
          type="button"
          onClick={toggleWishlist}
          className="absolute top-2.5 right-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center bg-white/95 backdrop-blur-sm border border-[#DEC99C] rounded-xs text-[#231C10] hover:text-[#B8860B] transition-colors focus-ring shadow-xs z-10"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-transform duration-200 ${
              wishlisted ? 'fill-[#B8860B] text-[#B8860B] scale-110' : 'text-[#231C10]'
            }`}
          />
        </button>

        {/* Out of Stock indicator */}
        {stock <= 0 && (
          <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 bg-[#231C10]/95 text-[#FAF7EE] text-[10px] tracking-wider uppercase font-sans font-medium rounded-xs z-10 shadow-sm">
            Made to order
          </div>
        )}
      </Link>

      {/* Artwork Information */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
        <div>
          {categoryName && (
            <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#B8860B] font-sans font-semibold">
              {categoryName}
            </p>
          )}
          <h3 className="font-serif text-base sm:text-lg font-semibold text-[#231C10] mt-1 line-clamp-1 group-hover:text-[#B8860B] transition-colors">
            <Link href={productUrl} prefetch={true} onClick={handleNavigate}>
              {title}
            </Link>
          </h3>
          <p className="text-xs text-[#7A694F] line-clamp-1 mt-0.5">{medium}</p>
        </div>

        {/* Price & Availability */}
        <div className="pt-3 border-t border-[#DEC99C]/60 flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-base sm:text-lg text-[#231C10]">
              {formatPrice(price)}
            </span>
            {mrp && mrp > price && (
              <span className="text-xs text-[#7A694F] line-through">
                {formatPrice(mrp)}
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#15803D] font-medium flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
            <span>{stock > 0 ? `${stock} in stock` : 'On request'}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
