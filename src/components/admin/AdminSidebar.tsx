'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Role } from '@prisma/client';
import { PATHS, isPathActive } from '@/lib/paths';
import { ADMIN_NAV_SECTIONS } from './adminNavConfig';

interface AdminSidebarProps {
  role?: Role;
}

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname();

  // If on admin login page, hide sidebar
  if (pathname === PATHS.admin.login()) {
    return null;
  }

  return (
    <aside className="w-64 bg-[#FAF7F2] border-r border-[#E2DACD] flex flex-col shrink-0 overflow-y-auto hidden md:flex select-none">
      <div className="p-4 space-y-6">
        {ADMIN_NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-[#8A8175]">
              {section.title}
            </h3>
            <div className="space-y-0.5 pt-1">
              {section.items.map((item) => {
                const isActive = isPathActive(pathname, item.href, item.exact);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-[#262320] text-[#FAF6EF] shadow-2xs font-semibold'
                        : 'text-[#5C554C] hover:text-[#262320] hover:bg-[#F2ECE1]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-[#DEC99C]' : 'text-[#8A8175]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#EAE2D5] text-[#262320] font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto p-4 border-t border-[#ECE5DA] bg-[#F5EFE6]/50">
        <div className="flex items-center justify-between text-[11px] text-[#7A7165]">
          <div>
            <p className="font-semibold text-[#262320]">SHREENATH ART WORK</p>
            <p className="text-[10px] text-[#8A8175]">Nathdwara, Rajasthan</p>
          </div>
          {role && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#262320] text-[#DEC99C]">
              {role}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
