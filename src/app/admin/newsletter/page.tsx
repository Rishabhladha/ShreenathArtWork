import React from 'react';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Mail, Download } from 'lucide-react';

export default async function AdminNewsletterPage() {
  const session = await requireAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DACD] pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#262320]">
            Gallery Dispatch Subscribers ({subscribers.length})
          </h1>
          <p className="text-xs text-[#5C554C] mt-0.5">
            Verified email subscribers for seasonal collection launches and exhibition announcements.
          </p>
        </div>
      </div>

      <div className="bg-[#FAF7F2] border border-[#E2DACD] rounded-sm overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#F4EFE6] text-[#262320] border-b border-[#E2DACD]">
            <tr>
              <th className="py-2.5 px-3 font-semibold">Subscriber Email</th>
              <th className="py-2.5 px-3 font-semibold">Subscribed Date</th>
              <th className="py-2.5 px-3 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECE5DA]">
            {subscribers.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-[#8A8175]">
                  No newsletter subscribers registered yet.
                </td>
              </tr>
            ) : (
              subscribers.map((s) => (
                <tr key={s.id} className="hover:bg-[#FAF6EF]">
                  <td className="py-2.5 px-3 font-medium text-[#262320]">{s.email}</td>
                  <td className="py-2.5 px-3 text-[#8A8175]">
                    {new Date(s.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="px-2 py-0.5 text-[10px] rounded-sm font-semibold bg-[#EAE2D5] text-[#2A5C38] border border-[#D1C6B4]">
                      {s.isActive ? 'Active' : 'Unsubscribed'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
