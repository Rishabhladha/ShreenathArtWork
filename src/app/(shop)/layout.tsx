import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { CookieNotice } from '@/components/common/CookieNotice';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings = null;
  try {
    settings = await prisma.siteSettings.findFirst();
  } catch {
    // Fallback if settings not yet loaded
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7EE] text-[#231C10]">
      <AnnouncementBar
        text={settings?.announcementBarText}
        active={settings?.announcementBarActive}
      />
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <CookieNotice />
    </div>
  );
}

