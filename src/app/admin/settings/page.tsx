import React from 'react';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AdminSettingsForm } from '@/components/admin/AdminSettingsForm';

export default async function AdminSettingsPage() {
  const session = await requireAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const settings = await prisma.siteSettings.findFirst();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-[#E2DACD] pb-4">
        <h1 className="font-serif text-2xl font-bold text-[#262320]">
          Gallery & Store Settings
        </h1>
        <p className="text-xs text-[#5C554C] mt-0.5">
          Configure business details, shipping thresholds, GST rates, Cash on Delivery, and announcement bar.
        </p>
      </div>

      <AdminSettingsForm initialSettings={settings} />
    </div>
  );
}
