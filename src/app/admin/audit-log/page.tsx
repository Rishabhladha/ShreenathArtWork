import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { PATHS } from '@/lib/paths';
import { AuditDetailCell, formatAuditEntry } from '@/components/admin/AuditFormatters';
import { ShieldCheck, Search, Filter, History, User } from 'lucide-react';

interface AuditLogPageProps {
  searchParams: Promise<{
    entity?: string;
    search?: string;
  }>;
}

export default async function AdminAuditLogPage({ searchParams }: AuditLogPageProps) {
  const session = await requireAdminSession();
  if (!session) {
    redirect(PATHS.admin.login());
  }

  const { entity, search } = await searchParams;

  const where: any = {};
  if (entity && entity !== 'ALL') {
    where.entity = { equals: entity, mode: 'insensitive' };
  }
  if (search && search.trim()) {
    const s = search.trim();
    where.OR = [
      { adminEmail: { contains: s, mode: 'insensitive' } },
      { action: { contains: s, mode: 'insensitive' } },
      { details: { contains: s, mode: 'insensitive' } },
      { entityId: { contains: s, mode: 'insensitive' } },
    ];
  }

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const entityFilters = [
    { key: 'ALL', label: 'All Activities' },
    { key: 'Product', label: 'Paintings' },
    { key: 'Order', label: 'Orders' },
    { key: 'Inventory', label: 'Inventory' },
    { key: 'Coupon', label: 'Coupons' },
    { key: 'Category', label: 'Categories' },
    { key: 'Settings', label: 'Settings' },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DACD] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-[#262320]">
              Management Audit Trail ({logs.length})
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] bg-[#EAE2D5] text-[#262320] font-semibold">
              Immutable Log
            </span>
          </div>
          <p className="text-xs text-[#5C554C] mt-0.5">
            Transparent record of all administrator product edits, inventory adjustments, status updates, and refunds.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#FAF7F2] p-4 border border-[#E2DACD] rounded-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <form className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#8A8175] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                name="search"
                defaultValue={search || ''}
                placeholder="Search audit trail by admin email, title, SKU or action..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E2DACD] rounded-sm focus-ring"
              />
            </div>
            {entity && <input type="hidden" name="entity" value={entity} />}
            <button type="submit" className="btn-secondary text-xs py-1.5 px-3">
              Search
            </button>
          </form>
        </div>

        {/* Entity Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#ECE5DA]">
          <span className="text-[11px] text-[#8A8175] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Filter by:</span>
          </span>
          {entityFilters.map((f) => {
            const isActive = (f.key === 'ALL' && (!entity || entity === 'ALL')) || entity === f.key;
            return (
              <a
                key={f.key}
                href={
                  f.key === 'ALL'
                    ? PATHS.admin.activity.replace('activity', 'audit-log')
                    : `?entity=${f.key}${search ? `&search=${encodeURIComponent(search)}` : ''}`
                }
                className={`px-2.5 py-1 text-xs rounded-sm border transition-colors ${
                  isActive
                    ? 'bg-[#262320] text-white border-[#262320] font-semibold'
                    : 'bg-white text-[#5C554C] border-[#E2DACD] hover:bg-[#F4EFE6]'
                }`}
              >
                {f.label}
              </a>
            );
          })}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-[#E2DACD] rounded-sm overflow-hidden shadow-2xs">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-[#FAF7F2] text-[#262320] border-b border-[#E2DACD]">
            <tr>
              <th className="py-3 px-4 font-semibold w-36">Timestamp</th>
              <th className="py-3 px-3 font-semibold w-48">Administrator</th>
              <th className="py-3 px-3 font-semibold w-36">Action</th>
              <th className="py-3 px-4 font-semibold">Activity Summary & Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECE5DA]">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-[#8A8175]">
                  No administrative actions found matching the selected filters.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const formatted = formatAuditEntry(
                  log.entity,
                  log.entityId,
                  log.action,
                  log.details
                );

                return (
                  <tr key={log.id} className="hover:bg-[#FAF9F5] transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-4 text-[#7A7165] whitespace-nowrap align-top">
                      <p className="font-medium text-[#262320]">
                        {new Date(log.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-[11px] text-[#8A8175]">
                        {new Date(log.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>

                    {/* Admin User */}
                    <td className="py-3 px-3 align-top">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-[#EAE2D5] text-[#262320] flex items-center justify-center text-[10px] font-bold">
                          {log.adminEmail.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-[#262320] truncate max-w-[160px]" title={log.adminEmail}>
                          {log.adminEmail}
                        </span>
                      </div>
                    </td>

                    {/* Action Badge */}
                    <td className="py-3 px-3 align-top whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-sm text-[10px] font-semibold border ${formatted.actionBadge.colorClass}`}
                      >
                        {formatted.actionBadge.label}
                      </span>
                    </td>

                    {/* Rich Details */}
                    <td className="py-3 px-4 align-top">
                      <AuditDetailCell
                        entity={log.entity}
                        entityId={log.entityId}
                        action={log.action}
                        detailsRaw={log.details}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
