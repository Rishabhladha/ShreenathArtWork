'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlistStore } from '@/store/wishlist-store';
import { formatPrice } from '@/lib/money';
import { Heart, Trash2, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Heart className="w-12 h-12 text-[#D1C6B4] mx-auto" />
        <h1 className="font-serif text-2xl font-semibold text-[#262320]">
          Your Wishlist is Empty
        </h1>
        <p className="text-xs text-[#5C554C] max-w-sm mx-auto">
          Explore our collection of Pichwai and devotional sanctum paintings, and save your favorite artworks here.
        </p>
        <div className="pt-2">
          <Link href="/catalog" className="btn-primary text-xs py-2.5 px-4">
            Browse Paintings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div className="border-b border-[#E2DACD] pb-4 flex items-baseline justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#262320]">
            Saved Paintings ({items.length})
          </h1>
          <p className="text-xs text-[#5C554C] mt-1">
            Artworks you have saved for contemplation or future acquisition.
          </p>
        </div>
        <button
          type="button"
          onClick={clearWishlist}
          className="text-xs text-[#8A8175] hover:text-[#8C2B2B] underline"
        >
          Clear Wishlist
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.productId}
            className="bg-[#FAF7F2] border border-[#E2DACD] rounded-sm overflow-hidden flex flex-col justify-between"
          >
            <div>
              <Link
                href={`/product/${item.slug}`}
                className="relative block aspect-[4/5] bg-[#F4EFE6] overflow-hidden"
              >
                <Image
                  src={item.image || '/placeholder-artwork.svg'}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </Link>
              <div className="p-4 space-y-1">
                <Link
                  href={`/product/${item.slug}`}
                  className="font-serif text-base font-semibold text-[#262320] hover:text-[#C47820] line-clamp-1 block"
                >
                  {item.title}
                </Link>
                <p className="text-xs font-medium text-[#262320]">
                  {formatPrice(item.price)}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0 border-t border-[#ECE5DA] flex items-center justify-between gap-2 mt-3">
              <Link
                href={`/product/${item.slug}`}
                className="btn-primary text-xs py-2 px-3 flex-1 text-center"
              >
                View Artwork
              </Link>
              <button
                type="button"
                onClick={() => removeItem(item.productId)}
                className="p-2 text-[#8A8175] hover:text-[#8C2B2B] border border-[#E2DACD] rounded-sm focus-ring"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

