'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/money';
import { Edit2, Check, X, AlertTriangle } from 'lucide-react';

export function AdminInventoryManager({ initialVariants }: { initialVariants: any[] }) {
  const [variants, setVariants] = useState(initialVariants);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [editReason, setEditReason] = useState<string>('Workshop stock adjustment');
  const [saving, setSaving] = useState(false);

  const startEdit = (v: any) => {
    setEditingId(v.id);
    setEditStock(v.stock);
    setEditReason('Physical count adjustment');
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: id,
          newStock: editStock,
          reason: editReason,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setVariants((prev) =>
          prev.map((item) => (item.id === id ? { ...item, stock: editStock } : item))
        );
        setEditingId(null);
      } else {
        alert(data.error || 'Failed to update stock');
      }
    } catch {
      alert('Error updating stock');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#FAF7F2] border border-[#E2DACD] rounded-sm overflow-hidden">
      <table className="w-full text-xs text-left">
        <thead className="bg-[#F4EFE6] text-[#262320] border-b border-[#E2DACD]">
          <tr>
            <th className="py-2.5 px-3 font-semibold">Artwork Title</th>
            <th className="py-2.5 px-3 font-semibold">SKU</th>
            <th className="py-2.5 px-3 font-semibold">Size</th>
            <th className="py-2.5 px-3 font-semibold">Framing</th>
            <th className="py-2.5 px-3 font-semibold">Unit Price</th>
            <th className="py-2.5 px-3 font-semibold">Current Stock</th>
            <th className="py-2.5 px-3 font-semibold text-right">Adjust Stock</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#ECE5DA]">
          {variants.map((v) => {
            const isEditing = editingId === v.id;

            return (
              <tr key={v.id} className="hover:bg-[#FAF6EF]">
                <td className="py-2.5 px-3 font-medium text-[#262320]">
                  <Link href={`/product/${v.product.slug}`} target="_blank" className="hover:underline">
                    {v.product.title}
                  </Link>
                </td>
                <td className="py-2.5 px-3 font-mono text-[#8A8175]">{v.sku}</td>
                <td className="py-2.5 px-3 text-[#5C554C]">{v.size}</td>
                <td className="py-2.5 px-3 text-[#5C554C]">{v.frame}</td>
                <td className="py-2.5 px-3 font-medium text-[#262320]">
                  {formatPrice(v.price)}
                </td>
                <td className="py-2.5 px-3">
                  {isEditing ? (
                    <input
                      type="number"
                      min={0}
                      value={editStock}
                      onChange={(e) => setEditStock(parseInt(e.target.value || '0', 10))}
                      className="w-16 px-1.5 py-0.5 border border-[#E2DACD] rounded-sm bg-white text-[#262320] font-semibold"
                    />
                  ) : (
                    <span
                      className={`px-2 py-0.5 rounded-sm font-semibold text-[11px] ${
                        v.stock === 0
                          ? 'bg-[#FAF0F0] text-[#8C2B2B]'
                          : v.stock <= 2
                          ? 'bg-[#FDF4E7] text-[#94601A]'
                          : 'bg-[#EAE2D5] text-[#262320]'
                      }`}
                    >
                      {v.stock} units
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-right">
                  {isEditing ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <input
                        type="text"
                        value={editReason}
                        onChange={(e) => setEditReason(e.target.value)}
                        placeholder="Reason..."
                        className="w-32 px-1.5 py-0.5 text-[11px] border border-[#E2DACD] rounded-sm bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleSave(v.id)}
                        disabled={saving}
                        className="p-1 text-[#2A5C38] hover:bg-[#EAE2D5] rounded-sm"
                        title="Save"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1 text-[#8C2B2B] hover:bg-[#FAF0F0] rounded-sm"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEdit(v)}
                      className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1 inline-flex"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Adjust</span>
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

