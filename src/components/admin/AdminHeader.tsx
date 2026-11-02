'use client';

import React from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { LogOut, ExternalLink, Shield } from 'lucide-react';
import { Role } from '@prisma/client';

interface AdminHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: Role;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="h-16 bg-[#262320] text-[#FAF6EF] px-4 sm:px-6 flex items-center justify-between border-b border-[#3D3934] shrink-0">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="font-serif text-lg font-bold tracking-wide">
            SHREENATH ART WORK
          </span>
          <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 bg-[#FAF6EF] text-[#262320] font-sans font-semibold rounded-sm">
            Admin
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <Link
          href="/"
          target="_blank"
          className="text-[#E2DACD] hover:text-white flex items-center gap-1.5"
        >
          <span>Live Gallery Shop</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-[#3D3934]">
            <div className="text-right hidden sm:block">
              <span className="block font-medium">{user.name || user.email}</span>
              <span className="text-[10px] text-[#8A8175] uppercase tracking-wider font-mono">
                {user.role}
              </span>
            </div>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="p-1.5 text-[#E2DACD] hover:text-white focus-ring rounded-sm"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

