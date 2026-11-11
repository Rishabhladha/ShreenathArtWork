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
    <article className="group bg-white border border-[#DEC99C] rounded-sm overflow-hidden flex flex-col transition-all duration-300 shadow-[0_2px_8px_rgba(35,28,16,0.04)] hover:shadow-[0_10px_28px_rgba(35,28,16,0.12)] hover:border-[#B8860B] relative">
      {/* Artwork Image Container */}
      <Link
        href={productUrl}
        prefetch={true}
        onClick={handleNavigate}
        className="relative block aspect-[4/5] bg-[#F7F2E4] overflow-hidden border-b border-[#DEC99C]/60 focus-ring"
      >
        {/* Skeleton Shimmer while loading */}
        {imgLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#F4EFE6] via-[#FAF6EF] to-[#F4EFE6] animate-pulse flex items-center justify-center">
            <span className="text-[10px] text-[#A8987E] tracking-wider uppercase">Loading art...</span>
          </div>
        )}

        <Image
          src={imgSrc}
          alt={title}
          fill
          quality={85}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={`object-cover transition-all duration-500 group-hover:scale-[1.04] ${
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
          <div className="absolute inset-0 bg-[#231C10]/40 backdrop-blur-[1px] flex items-center justify-center transition-opacity z-10">
            <div className="flex items-center gap-2 bg-[#231C10]/90 text-[#FAF7EE] text-xs px-3 py-1.5 rounded-sm shadow-md">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C59B27]" />
              <span>Opening artwork...</span>
            </div>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={toggleWishlist}
          className="absolute top-3 right-3 p-2 bg-white/95 backdrop-blur-sm border border-[#DEC99C] rounded-sm text-[#231C10] hover:text-[#B8511B] transition-colors focus-ring shadow-xs z-10"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 ${wishlisted ? 'fill-[#B8860B] text-[#B8860B]' : 'text-[#231C10]'}`}
          />
        </button>

        {/* Stock / Out of Stock pill if 0 */}
        {stock <= 0 && (
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-[#231C10]/95 text-[#FAF7EE] text-[10px] tracking-wider uppercase font-sans rounded-sm z-10">
            Sold / Made to order
          </div>
        )}
      </Link>

      {/* Artwork Information */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
        <div>
          {categoryName && (
            <p className="text-[11px] uppercase tracking-wider text-[#B8511B] font-sans font-semibold">
              {categoryName}
            </p>
          )}
          <h3 className="font-serif text-base font-semibold text-[#231C10] mt-1 line-clamp-1 group-hover:text-[#B8511B] transition-colors">
            <Link href={productUrl} prefetch={true} onClick={handleNavigate}>
              {title}
            </Link>
          </h3>
          <p className="text-xs text-[#7A694F] line-clamp-1 mt-0.5">{medium}</p>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-[#E8DAC0] flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-base text-[#231C10]">
              {formatPrice(price)}
            </span>
            {mrp && mrp > price && (
              <span className="text-xs text-[#A8987E] line-through">
                {formatPrice(mrp)}
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#15803D] font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
            {stock > 0 ? `${stock} available` : 'On request'}
          </span>
        </div>
      </div>
    </article>
  );
}
