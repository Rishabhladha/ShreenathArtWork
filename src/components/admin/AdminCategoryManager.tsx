'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  _count: { products: number };
}

export function AdminCategoryManager({ initialCategories }: { initialCategories: CategoryItem[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    const generated = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setSlug(generated);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, description, displayOrder }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create category');
      }

      setCategories((prev) => [...prev, { ...data.category, _count: { products: 0 } }]);
      setName('');
      setSlug('');
      setDescription('');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creating category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    setError(null);

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete category');
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error deleting category');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Categories List */}
      <div className="lg:col-span-2 space-y-3">
        <h2 className="font-serif text-base font-semibold text-[#262320]">
          Existing Traditions
        </h2>

        <div className="bg-[#FAF7F2] border border-[#E2DACD] rounded-sm divide-y divide-[#ECE5DA]">
          {categories.map((c) => (
            <div key={c.id} className="p-4 flex items-center justify-between gap-4 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[#262320]">{c.name}</span>
                  <span className="text-[10px] text-[#8A8175] font-mono">/catalog?category={c.slug}</span>
                </div>
                {c.description && <p className="text-[#5C554C]">{c.description}</p>}
                <p className="text-[11px] text-[#8A8175]">
                  Order: {c.displayOrder} | {c._count.products} painting(s) cataloged
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(c.id, c.name)}
                className="p-1.5 text-[#8A8175] hover:text-[#8C2B2B] hover:bg-[#FAF0F0] rounded-sm transition-colors"
                title="Delete category"
                aria-label={`Delete category ${c.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Category Form */}
      <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-4">
        <h2 className="font-serif text-base font-semibold text-[#262320]">
          Add New Category
        </h2>

        {error && (
          <div className="p-2.5 bg-[#FAF0F0] border border-[#D9B5B5] rounded-sm text-xs text-[#8C2B2B] flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="block text-[#5C554C]">Category Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Pichwai"
              className="w-full px-2.5 py-1.5 border border-[#E2DACD] rounded-sm bg-[#FAF6EF] text-[#262320]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[#5C554C]">URL Slug *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="pichwai"
              className="w-full px-2.5 py-1.5 border border-[#E2DACD] rounded-sm bg-[#FAF6EF] text-[#262320] font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[#5C554C]">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of this art form..."
              className="w-full px-2.5 py-1.5 border border-[#E2DACD] rounded-sm bg-[#FAF6EF] text-[#262320]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[#5C554C]">Display Order</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#E2DACD] rounded-sm bg-[#FAF6EF] text-[#262320]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{loading ? 'Creating...' : 'Create Category'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

