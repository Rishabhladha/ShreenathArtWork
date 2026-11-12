'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/money';
import { Plus, Tag, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

export interface CouponItem {
  id: string;
  code: string;
  description?: string | null;
  discountType: 'PERCENT' | 'FLAT';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usageCount: number;
  isActive: boolean;
  expiresAt?: string | Date | null;
  createdAt?: string | Date;
}

export function AdminCouponManager({ initialCoupons }: { initialCoupons: CouponItem[] }) {
  const router = useRouter();
  const [coupons, setCoupons] = useState(initialCoupons);

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENT' | 'FLAT'>('PERCENT');
  const [discountValue, setDiscountValue] = useState('10');
  const [minOrderRupees, setMinOrderRupees] = useState('5000');
  const [maxDiscountRupees, setMaxDiscountRupees] = useState('2000');
  const [usageLimit, setUsageLimit] = useState('100');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update coupon');
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: !currentStatus } : c))
      );
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error updating coupon');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete or deactivate coupon "${code}"?`)) return;
    setError(null);

    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete coupon');
      if (data.coupon && !data.coupon.isActive) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive: false } : c))
        );
        setError('Coupon had existing redemptions and was deactivated instead of permanently deleted.');
      } else {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error deleting coupon');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        code: code.trim().toUpperCase(),
        description,
        discountType,
        discountValue: discountType === 'PERCENT' ? parseInt(discountValue, 10) : parseInt(discountValue, 10) * 100,
        minOrderValue: parseInt(minOrderRupees, 10) * 100,
        maxDiscount: maxDiscountRupees ? parseInt(maxDiscountRupees, 10) * 100 : null,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        isActive: true,
      };

      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create coupon');

      setCoupons((prev) => [{ ...data.coupon, _count: { redemptions: 0 } }, ...prev]);
      setCode('');
      setDescription('');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Coupons Table */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="font-serif text-base font-semibold text-[#262320]">
          Active and Scheduled Codes
        </h2>

        <div className="bg-[#FAF7F2] border border-[#E2DACD] rounded-sm divide-y divide-[#ECE5DA]">
          {coupons.map((c) => (
            <div key={c.id} className="p-4 flex items-start justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-[#262320]">{c.code}</span>
                  <span className="px-2 py-0.5 rounded-sm bg-[#EAE2D5] text-[#262320] font-semibold text-[10px]">
                    {c.discountType === 'PERCENT' ? `${c.discountValue}% OFF` : `${formatPrice(c.discountValue)} OFF`}
                  </span>
                  {!c.isActive && (
                    <span className="px-1.5 py-0.5 rounded-sm bg-[#FAF0F0] text-[#8C2B2B] text-[10px] font-medium border border-[#D9B5B5]">
                      Inactive
                    </span>
                  )}
                </div>
                {c.description && <p className="text-[#5C554C]">{c.description}</p>}
                <p className="text-[11px] text-[#8A8175]">
                  Min order: {formatPrice(c.minOrderValue)}{' '}
                  {c.maxDiscount && `| Max discount: ${formatPrice(c.maxDiscount)}`}{' '}
                  | Redemptions: {c.usageCount} {c.usageLimit ? `/ ${c.usageLimit}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleActive(c.id, c.isActive)}
                  className={`px-2.5 py-1 text-[11px] rounded-sm border transition-colors ${
                    c.isActive
                      ? 'bg-[#EAE2D5] text-[#2A5C38] border-[#D1C6B4] hover:bg-[#FAF0F0] hover:text-[#8C2B2B]'
                      : 'bg-[#FAF0F0] text-[#8C2B2B] border-[#D9B5B5] hover:bg-[#EAE2D5] hover:text-[#2A5C38]'
                  }`}
                >
                  {c.isActive ? 'Active' : 'Disabled'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id, c.code)}
                  className="p-1 text-[#8A8175] hover:text-[#8C2B2B] hover:bg-[#FAF0F0] rounded-sm transition-colors"
                  title="Delete or deactivate coupon"
                  aria-label={`Delete coupon ${c.code}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Coupon Form */}
      <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-4">
        <h2 className="font-serif text-base font-semibold text-[#262320]">
          Create New Coupon
        </h2>

        {error && (
          <div className="p-2.5 bg-[#FAF0F0] border border-[#D9B5B5] rounded-sm text-xs text-[#8C2B2B] flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="block text-[#5C554C]">Coupon Code *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. UTSAV15"
              className="w-full px-2.5 py-1.5 border border-[#E2DACD] rounded-sm bg-[#FAF6EF] text-[#262320] font-mono uppercase"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[#5C554C]">Discount Type *</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as 'PERCENT' | 'FLAT')}
              className="w-full px-2.5 py-1.5 border border-[#E2DACD] rounded-sm bg-[#FAF6EF] text-[#262320]"
            >
              <option value="PERCENT">Percentage Discount (%)</option>
              <option value="FLAT">Flat Rupee Amount (INR)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[#5C554C]">
              {discountType === 'PERCENT' ? 'Discount Percent (1 - 100)' : 'Flat Discount (INR)'}
            </label>
            <input
              type="number"
              required
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#E2DACD] rounded-sm bg-[#FAF6EF] text-[#262320]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[#5C554C]">Min Order Value (INR)</label>
            <input
              type="number"
              value={minOrderRupees}
              onChange={(e) => setMinOrderRupees(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#E2DACD] rounded-sm bg-[#FAF6EF] text-[#262320]"
            />
          </div>

          {discountType === 'PERCENT' && (
            <div className="space-y-1">
              <label className="block text-[#5C554C]">Max Discount Cap (INR, Optional)</label>
              <input
                type="number"
                value={maxDiscountRupees}
                onChange={(e) => setMaxDiscountRupees(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-[#E2DACD] rounded-sm bg-[#FAF6EF] text-[#262320]"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[#5C554C]">Max Usage Limit (Optional)</label>
            <input
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#E2DACD] rounded-sm bg-[#FAF6EF] text-[#262320]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[#5C554C]">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Special festive season discount"
              className="w-full px-2.5 py-1.5 border border-[#E2DACD] rounded-sm bg-[#FAF6EF] text-[#262320]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{loading ? 'Creating...' : 'Create Coupon'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

