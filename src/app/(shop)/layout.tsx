import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { CookieNotice } from '@/components/common/CookieNotice';

export const dynamic = 'force-dynamic';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7EE] text-[#231C10]">
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
