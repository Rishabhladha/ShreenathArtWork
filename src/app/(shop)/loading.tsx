import React from 'react';
import { Sparkles } from 'lucide-react';

export default function ShopLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center min-h-[50vh] space-y-4 animate-in fade-in duration-200">
      <div className="w-12 h-12 rounded-full bg-[#FAF7EE] border border-[#DEC99C] flex items-center justify-center shadow-xs">
        <Sparkles className="w-6 h-6 text-[#B8860B] animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <p className="font-serif text-base text-[#231C10] font-medium">
          Loading Shreenath Art Work...
        </p>
        <p className="text-xs text-[#7A694F]">
          Handcrafted Nathdwara paintings and sanctum artworks
        </p>
      </div>
    </div>
  );
}
