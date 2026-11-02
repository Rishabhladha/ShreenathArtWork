import React from 'react';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ShieldCheck } from 'lucide-react';

export default async function AdminAuditLogPage() {
  const session = await requireAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="border-b border-[#E2DACD] pb-4">
        <h1 className="font-serif text-2xl font-bold text-[#262320]">
          Admin Action Audit Log ({logs.length})
        </h1>
        <p className="text-xs text-[#5C554C] mt-0.5">
          Immutable historical trail of administrator product edits, inventory adjustments, and status changes.
        </p>
      </div>

      <div className="bg-[#FAF7F2] border border-[#E2DACD] rounded-sm overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#F4EFE6] text-[#262320] border-b border-[#E2DACD]">
            <tr>
              <th className="py-2.5 px-3 font-semibold">Timestamp</th>
              <th className="py-2.5 px-3 font-semibold">Admin</th>
              <th className="py-2.5 px-3 font-semibold">Action</th>
              <th className="py-2.5 px-3 font-semibold">Entity</th>
              <th className="py-2.5 px-3 font-semibold">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECE5DA]">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#8A8175]">
                  No administrative actions logged yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FAF6EF]">
                  <td className="py-2.5 px-3 text-[#8A8175] whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-[#262320]">
                    {log.adminEmail}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-[#262320]">
                    <span className="px-2 py-0.5 rounded-sm bg-[#EAE2D5] border border-[#D1C6B4] text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[#5C554C]">
                    {log.entity} {log.entityId ? `(#${log.entityId.slice(0, 8)})` : ''}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#5C554C] max-w-xs truncate">
                    {log.details || 'None'}
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
