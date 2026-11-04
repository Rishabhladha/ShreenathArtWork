import React from 'react';

export default function GlobalLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[65vh] flex flex-col items-center justify-center px-4 py-16 bg-[#FAF7EE] text-[#231C10]"
    >
      <div className="relative flex items-center justify-center mb-6">
        {/* Outer glowing pulsing ring */}
        <div className="w-16 h-16 rounded-full border-2 border-[#DEC99C] animate-ping opacity-25 absolute" />
        {/* Spinning decorative gold border */}
        <div className="w-14 h-14 rounded-full border-2 border-[#DEC99C] border-t-[#B8860B] border-r-[#B8860B] animate-spin" />
        {/* Inner symbol or circle */}
        <div className="w-7 h-7 rounded-full bg-[#FAF7EE] border border-[#DEC99C] flex items-center justify-center absolute shadow-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-[#B8860B]" />
        </div>
      </div>

      <h2 className="font-serif text-xl font-semibold tracking-wide text-[#231C10]">
        SHREENATH ART WORK
      </h2>
      <p className="text-xs text-[#7A694F] mt-1.5 tracking-wider uppercase font-sans">
        Traditional Pichwai & Nathdwara Heritage
      </p>

      {/* Subtle shimmer loading bar */}
      <div className="w-48 h-1 bg-[#E8DAC0] rounded-full overflow-hidden mt-6 relative">
        <div className="h-full bg-[#B8860B] w-1/2 rounded-full animate-pulse" />
      </div>

      <p className="text-xs text-[#8A8175] mt-3 animate-pulse">
        Loading sacred artworks...
      </p>

      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
}
