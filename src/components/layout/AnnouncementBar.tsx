import React from 'react';
import { Sparkles } from 'lucide-react';

interface AnnouncementBarProps {
  text?: string | null;
  active?: boolean;
}

export function AnnouncementBar({
  text = 'Insured climate-sealed wooden box delivery across India & worldwide for all temple artworks above ₹5,000.',
  active = true,
}: AnnouncementBarProps) {
  if (!active || !text) return null;

  return (
    <aside
      aria-label="Sanctum Announcement"
      className="bg-[#12100E] text-[#FAF6EF] text-xs py-2.5 px-4 text-center tracking-wider font-sans border-b border-[#C5A059]/30 shadow-xs"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#DFBE72] shrink-0" />
        <span className="font-medium text-[11px] sm:text-xs tracking-wide text-[#FAF6EF]/90">
          {text}
        </span>
      </div>
    </aside>
  );
}
