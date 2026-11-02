'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/money';
import { useWishlistStore } from '@/store/wishlist-store';
import { Heart } from 'lucide-react';

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

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlisted) {
      removeItem(id);
    } else {
      addItem({ productId: id, title, slug, price, image });
    }
  };

  return (
    <article className="group bg-white border border-[#DEC99C] rounded-sm overflow-hidden flex flex-col transition-all duration-300 shadow-[0_2px_8px_rgba(35,28,16,0.04)] hover:shadow-[0_10px_28px_rgba(35,28,16,0.12)] hover:border-[#B8860B]">
      {/* Artwork Image Container */}
      <Link href={`/product/${slug}`} className="relative block aspect-[4/5] bg-[#F7F2E4] overflow-hidden border-b border-[#DEC99C]/60">
        <Image
          src={image || '/placeholder-artwork.svg'}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={toggleWishlist}
          className="absolute top-3 right-3 p-2 bg-white/95 backdrop-blur-sm border border-[#DEC99C] rounded-sm text-[#231C10] hover:text-[#B8860B] transition-colors focus-ring shadow-xs"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 ${wishlisted ? 'fill-[#B8860B] text-[#B8860B]' : 'text-[#231C10]'}`}
          />
        </button>

        {/* Stock / Out of Stock pill if 0 */}
        {stock <= 0 && (
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-[#231C10]/95 text-[#FAF7EE] text-[10px] tracking-wider uppercase font-sans rounded-sm">
            Sold / Made to order
          </div>
        )}
      </Link>

      {/* Artwork Information */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
        <div>
          {categoryName && (
            <p className="text-[11px] uppercase tracking-wider text-[#B8860B] font-sans font-semibold">
              {categoryName}
            </p>
          )}
          <h3 className="font-serif text-base font-semibold text-[#231C10] mt-1 line-clamp-1 group-hover:text-[#B8860B] transition-colors">
            <Link href={`/product/${slug}`}>{title}</Link>
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

