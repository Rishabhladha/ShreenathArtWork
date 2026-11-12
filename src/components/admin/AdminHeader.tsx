'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LogOut, ExternalLink, Menu, X, Shield } from 'lucide-react';
import { Role } from '@prisma/client';
import { PATHS, isPathActive } from '@/lib/paths';
import { ADMIN_NAV_SECTIONS } from './adminNavConfig';

interface AdminHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: Role;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileDrawerOpen]);

  // If on admin login page, keep header minimal without menu
  const isLoginPage = pathname === PATHS.admin.login();

  return (
    <>
      <header className="h-16 bg-[#262320] text-[#FAF6EF] px-4 sm:px-6 flex items-center justify-between border-b border-[#3D3934] shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Hamburger (hidden on login page and desktop) */}
          {!isLoginPage && (
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="p-2 -ml-2 text-[#E2DACD] hover:text-white md:hidden rounded-sm focus:outline-hidden focus:ring-1 focus:ring-[#DEC99C]"
              aria-label={mobileDrawerOpen ? 'Close management menu' : 'Open management menu'}
            >
              {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <Link href={PATHS.admin.dashboard} className="flex items-center gap-2">
            <span className="font-serif text-base sm:text-lg font-bold tracking-wide">
              SHREENATH ART WORK
            </span>
            <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 bg-[#FAF6EF] text-[#262320] font-sans font-semibold rounded-xs shadow-2xs">
              Admin
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-xs">
          <Link
            href={PATHS.home}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#E2DACD] hover:text-white flex items-center gap-1.5 py-1 px-2 rounded-sm hover:bg-white/5 transition-colors"
            title="Open Live Gallery in new tab"
          >
            <span className="hidden sm:inline">Live Gallery</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {user && (
            <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-[#3D3934]">
              <div className="text-right hidden sm:block">
                <span className="block font-medium truncate max-w-[140px] text-white">
                  {user.name || user.email}
                </span>
                <span className="text-[10px] text-[#DEC99C] uppercase tracking-wider font-mono font-semibold">
                  {user.role}
                </span>
              </div>

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: PATHS.admin.login() })}
                className="p-2 text-[#E2DACD] hover:text-white hover:bg-white/10 rounded-sm transition-colors focus:outline-hidden focus:ring-1 focus:ring-[#DEC99C]"
                title="Sign Out of Management"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Navigation Drawer Backdrop & Drawer (< md) */}
      {!isLoginPage && mobileDrawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <div className="relative w-4/5 max-w-xs bg-[#FAF7F2] text-[#262320] h-full flex flex-col z-50 shadow-2xl overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 bg-[#262320] text-[#FAF6EF] flex items-center justify-between border-b border-[#3D3934]">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#DEC99C]" />
                <span className="font-serif font-bold text-sm tracking-wide">Gallery Management</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 text-[#E2DACD] hover:text-white rounded-sm focus:outline-hidden"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User Info on Mobile Drawer */}
            {user && (
              <div className="px-4 py-3 bg-[#F2ECE1] border-b border-[#E2DACD] flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-semibold text-[#262320] truncate">{user.name || user.email}</p>
                  <p className="text-[10px] text-[#8A8175] truncate">{user.email}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#262320] text-[#DEC99C] shrink-0">
                  {user.role}
                </span>
              </div>
            )}

            {/* Categorized Nav Links */}
            <div className="p-4 space-y-5 flex-1">
              {ADMIN_NAV_SECTIONS.map((section) => (
                <div key={section.title} className="space-y-1">
                  <h4 className="px-2 text-[10px] font-bold uppercase tracking-widest text-[#8A8175]">
                    {section.title}
                  </h4>
                  <div className="space-y-0.5 pt-0.5">
                    {section.items.map((item) => {
                      const isActive = isPathActive(pathname, item.href, item.exact);
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileDrawerOpen(false)}
                          className={`flex items-center justify-between px-3 py-2.5 text-xs rounded-sm transition-colors min-h-[44px] ${
                            isActive
                              ? 'bg-[#262320] text-[#FAF6EF] font-semibold'
                              : 'text-[#5C554C] hover:text-[#262320] hover:bg-[#F2ECE1]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
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

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-[#E2DACD] bg-[#F5EFE6] space-y-2">
              <Link
                href={PATHS.home}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full btn-secondary text-xs py-2 px-3 flex items-center justify-center gap-1.5"
              >
                <span>View Live Gallery</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: PATHS.admin.login() })}
                className="w-full py-2 px-3 text-xs text-[#8C2B2B] hover:bg-[#FAF0F0] rounded-sm font-medium flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
