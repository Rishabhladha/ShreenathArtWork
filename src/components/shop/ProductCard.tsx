'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/money';
import { useWishlistStore } from '@/store/wishlist-store';
import { Heart, Loader2, Sparkles } from 'lucide-react';
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
    <article className="group bg-white border border-[#E5D7BF] hover:border-[#C5A059] rounded-xs overflow-hidden flex flex-col transition-all duration-300 shadow-[0_4px_16px_rgba(18,16,14,0.06)] hover:shadow-[0_16px_36px_rgba(18,16,14,0.14)] relative">
      {/* Artwork Image Container with Museum Frame Shadow */}
      <Link
        href={productUrl}
        prefetch={true}
        onClick={handleNavigate}
        className="relative block aspect-[4/5] bg-[#FAF6EF] overflow-hidden border-b border-[#E5D7BF]/70 focus-ring"
      >
        {/* Shimmer Placeholder while loading */}
        {imgLoading && (
          <div className="absolute inset-0 bg-[#F5ECDA] animate-pulse flex items-center justify-center">
            <span className="text-[10px] text-[#82776A] tracking-widest uppercase font-medium">Illuminating Art...</span>
          </div>
        )}

        <Image
          src={imgSrc}
          alt={title}
          fill
          quality={88}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035] ${
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

        {/* Navigation Loading Spinner Chiaroscuro Overlay */}
        {isNavigating && (
          <div className="absolute inset-0 bg-[#12100E]/65 backdrop-blur-[2px] flex items-center justify-center transition-opacity z-20">
            <div className="flex items-center gap-2 bg-[#12100E] border border-[#C5A059] text-[#FAF6EF] text-xs px-4 py-2.5 rounded-xs shadow-2xl">
              <Loader2 className="w-4 h-4 animate-spin text-[#DFBE72]" />
              <span className="font-serif tracking-wide text-sm">Opening Sanctum...</span>
            </div>
          </div>
        )}

        {/* Wishlist Button - 44px min hit target */}
        <button
          type="button"
          onClick={toggleWishlist}
          className="absolute top-3 right-3 min-h-[44px] min-w-[44px] flex items-center justify-center bg-[#12100E]/85 backdrop-blur-sm border border-[#C5A059]/50 rounded-xs text-[#FAF6EF] hover:text-[#DFBE72] transition-colors focus-ring shadow-sm z-10"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-transform duration-200 ${
              wishlisted ? 'fill-[#8B1E1E] text-[#8B1E1E] scale-110' : 'text-[#FAF6EF]'
            }`}
          />
        </button>

        {/* Made to order / Sanctum status pill */}
        {stock <= 0 ? (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-[#12100E]/95 border border-[#C5A059]/40 text-[#FAF6EF] text-[10px] tracking-wider uppercase font-sans font-medium rounded-xs z-10 shadow-sm">
            Made to Order
          </div>
        ) : (
          <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-[#12100E]/85 backdrop-blur-xs border border-[#C5A059]/40 text-[#DFBE72] text-[9px] tracking-widest uppercase font-sans font-medium rounded-xs z-10 shadow-sm flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-[#DFBE72]" />
            <span>Nathdwara Haveli Stock</span>
          </div>
        )}
      </Link>

      {/* Artwork Information */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
        <div>
          {categoryName && (
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#C5A059] font-sans font-semibold">
              {categoryName}
            </p>
          )}
          <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#12100E] mt-1 line-clamp-1 group-hover:text-[#8B1E1E] transition-colors">
            <Link href={productUrl} prefetch={true} onClick={handleNavigate}>
              {title}
            </Link>
          </h3>
          <p className="text-xs text-[#82776A] line-clamp-1 mt-0.5">{medium}</p>
        </div>

        {/* Price & Provenance */}
        <div className="pt-3 border-t border-[#E5D7BF]/70 flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-bold text-lg sm:text-xl text-[#12100E]">
              {formatPrice(price)}
            </span>
            {mrp && mrp > price && (
              <span className="text-xs text-[#82776A] line-through">
                {formatPrice(mrp)}
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#1F5E3B] font-medium flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1F5E3B]" />
            <span>{stock > 0 ? `${stock} available` : 'On commission'}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
