import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { PATHS } from '@/lib/paths';
import { AuditDetailCell, formatAuditEntry } from '@/components/admin/AuditFormatters';
import {
  ShieldCheck,
  Search,
  Filter,
  History,
  User,
  Palette,
  ShoppingBag,
  Warehouse,
  Tag,
  Sliders,
  CheckCircle2,
  Lock,
} from 'lucide-react';

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

  // Fetch audit records and statistical aggregates
  const [logs, totalCount, productCount, orderCount, securityCount] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.auditLog.count(),
    prisma.auditLog.count({ where: { entity: { equals: 'Product', mode: 'insensitive' } } }),
    prisma.auditLog.count({ where: { entity: { equals: 'Order', mode: 'insensitive' } } }),
    prisma.auditLog.count({
      where: {
        OR: [
          { entity: { in: ['User', 'Customer', 'Auth'], mode: 'insensitive' } },
          { action: { contains: 'PASSWORD', mode: 'insensitive' } },
          { action: { contains: 'EMAIL', mode: 'insensitive' } },
        ],
      },
    }),
  ]);

  const entityFilters = [
    { key: 'ALL', label: 'All Activities' },
    { key: 'Product', label: 'Paintings' },
    { key: 'Order', label: 'Orders' },
    { key: 'Inventory', label: 'Inventory' },
    { key: 'Coupon', label: 'Coupons' },
    { key: 'Category', label: 'Categories' },
    { key: 'User', label: 'Patrons & Auth' },
    { key: 'Settings', label: 'Settings' },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DACD] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-[#262320]">
              Management Audit Trail
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-[#EAE2D5] text-[#262320] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2A5C38]" />
              Immutable Log
            </span>
          </div>
          <p className="text-xs text-[#5C554C] mt-1">
            Enterprise traceability record documenting all administrator modifications, pricing edits, order status advances, inventory counts, and authentication lifecycle events.
          </p>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#FAF7F2] border border-[#E2DACD] p-3.5 rounded-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#7A7165]">Total Logged Events</span>
            <History className="w-4 h-4 text-[#A85A32]" />
          </div>
          <p className="text-xl font-bold text-[#262320] mt-1">{totalCount}</p>
          <span className="text-[10px] text-[#8A8175]">Lifetime system actions</span>
        </div>

        <div className="bg-[#FAF7F2] border border-[#E2DACD] p-3.5 rounded-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#7A7165]">Artwork Edits</span>
            <Palette className="w-4 h-4 text-[#2A5C38]" />
          </div>
          <p className="text-xl font-bold text-[#262320] mt-1">{productCount}</p>
          <span className="text-[10px] text-[#8A8175]">Paintings created/updated</span>
        </div>

        <div className="bg-[#FAF7F2] border border-[#E2DACD] p-3.5 rounded-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#7A7165]">Order Transitions</span>
            <ShoppingBag className="w-4 h-4 text-[#2C464F]" />
          </div>
          <p className="text-xl font-bold text-[#262320] mt-1">{orderCount}</p>
          <span className="text-[10px] text-[#8A8175]">Fulfillments & shipments</span>
        </div>

        <div className="bg-[#FAF7F2] border border-[#E2DACD] p-3.5 rounded-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#7A7165]">Security & Auth</span>
            <Lock className="w-4 h-4 text-[#8C2B2B]" />
          </div>
          <p className="text-xl font-bold text-[#262320] mt-1">{securityCount}</p>
          <span className="text-[10px] text-[#8A8175]">Verifications & resets</span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-[#FAF7F2] p-4 border border-[#E2DACD] rounded-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <form className="flex-1 flex gap-2" method="GET" action={PATHS.admin.auditLog}>
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#8A8175] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                name="search"
                defaultValue={search || ''}
                placeholder="Search audit trail by administrator email, title, SKU, order number, or action..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-[#E2DACD] rounded-sm focus:outline-none focus:border-[#A85A32]"
              />
            </div>
            {entity && <input type="hidden" name="entity" value={entity} />}
            <button
              type="submit"
              className="px-4 py-2 bg-[#262320] text-white text-xs font-medium rounded-sm hover:bg-[#3D3833] transition-colors"
            >
              Search
            </button>
            {(search || entity) && (
              <Link
                href={PATHS.admin.auditLog}
                className="px-3 py-2 border border-[#E2DACD] bg-white text-xs text-[#5C554C] rounded-sm hover:bg-[#F4EFE6] transition-colors flex items-center"
              >
                Clear
              </Link>
            )}
          </form>
        </div>

        {/* Entity Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#ECE5DA]">
          <span className="text-[11px] text-[#8A8175] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Filter by:</span>
          </span>
          {entityFilters.map((f) => {
            const isActive = (f.key === 'ALL' && (!entity || entity === 'ALL')) || entity === f.key;
            const href =
              f.key === 'ALL'
                ? PATHS.admin.auditLog
                : `${PATHS.admin.auditLog}?entity=${encodeURIComponent(f.key)}${
                    search ? `&search=${encodeURIComponent(search)}` : ''
                  }`;
            return (
              <Link
                key={f.key}
                href={href}
                className={`px-2.5 py-1 text-xs rounded-sm border transition-colors ${
                  isActive
                    ? 'bg-[#262320] text-white border-[#262320] font-semibold'
                    : 'bg-white text-[#5C554C] border-[#E2DACD] hover:bg-[#F4EFE6]'
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-[#E2DACD] rounded-sm overflow-hidden shadow-2xs">
        <div className="px-4 py-2.5 bg-[#FAF7F2] border-b border-[#E2DACD] flex items-center justify-between text-xs text-[#7A7165]">
          <span>
            Showing <strong className="text-[#262320]">{logs.length}</strong> recorded administrative activities
          </span>
          {entity && entity !== 'ALL' && (
            <span className="text-[11px] bg-[#EAE2D5] text-[#262320] px-2 py-0.5 rounded-sm">
              Filtered: {entity}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#FAF7F2] text-[#262320] border-b border-[#E2DACD]">
              <tr>
                <th className="py-3 px-4 font-semibold w-40">Timestamp</th>
                <th className="py-3 px-3 font-semibold w-48">Administrator</th>
                <th className="py-3 px-3 font-semibold w-36">Action</th>
                <th className="py-3 px-4 font-semibold">Activity Summary & Record Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE5DA]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-14 text-center">
                    <History className="w-8 h-8 text-[#C4B5A5] mx-auto mb-2" />
                    <p className="font-serif text-sm font-semibold text-[#262320]">
                      No administrative actions found
                    </p>
                    <p className="text-xs text-[#8A8175] mt-1 max-w-sm mx-auto">
                      No audit events matched your search or entity criteria. Try clearing your filters.
                    </p>
                    <Link
                      href={PATHS.admin.auditLog}
                      className="inline-block mt-3 px-3 py-1.5 text-xs bg-[#262320] text-white rounded-sm hover:bg-[#3D3833] transition-colors"
                    >
                      Reset Filters
                    </Link>
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
                      <td className="py-3.5 px-4 text-[#7A7165] whitespace-nowrap align-top">
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
                            second: '2-digit',
                          })}
                        </p>
                      </td>

                      {/* Admin User */}
                      <td className="py-3.5 px-3 align-top">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#EAE2D5] text-[#262320] flex items-center justify-center text-[10px] font-bold shrink-0">
                            {log.adminEmail.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-[#262320] block truncate max-w-[150px]" title={log.adminEmail}>
                              {log.adminEmail}
                            </span>
                            <span className="text-[10px] text-[#8A8175] block">
                              Staff Operator
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Action Badge */}
                      <td className="py-3.5 px-3 align-top whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-sm text-[10px] font-semibold border ${formatted.actionBadge.colorClass}`}
                        >
                          {formatted.actionBadge.label}
                        </span>
                      </td>

                      {/* Rich Details */}
                      <td className="py-3.5 px-4 align-top">
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
    </div>
  );
}
