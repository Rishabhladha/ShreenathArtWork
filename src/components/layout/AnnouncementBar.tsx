import React from 'react';

interface AnnouncementBarProps {
  text?: string | null;
  active?: boolean;
}

export function AnnouncementBar({
  text = 'Free insured delivery across India on all paintings above Rs 5,000.',
  active = true,
}: AnnouncementBarProps) {
  if (!active || !text) return null;

  return (
    <aside aria-label="Announcement" className="bg-[#262320] text-[#FAF6EF] text-xs py-2 px-4 text-center tracking-wide font-sans border-b border-[#3D3934]">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <span>{text}</span>
      </div>
    </aside>
  );
}

