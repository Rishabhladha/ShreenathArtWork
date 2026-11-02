import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerAuthSession } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export const metadata: Metadata = {
  title: 'Admin Management | SHREENATH ART WORK',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  // Route /admin/login is handled separately or exempted
  if (!session || !session.user || (session.user.role !== 'OWNER' && session.user.role !== 'STAFF')) {
    // If not authenticated or not staff/owner, let the child (e.g. login) render if it's login
    // In App router layout, we allow children to render if they are public login, but here we can check pathname or wrap subroutes
  }

  return (
    <div className="min-h-screen bg-[#FAF6EF] text-[#262320] flex flex-col antialiased">
      <AdminHeader user={session?.user} />
      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar role={session?.user?.role} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

