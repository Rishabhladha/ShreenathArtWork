'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Trash2, Upload, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface VariantInput {
  id?: string;
  size: string;
  frame: string;
  priceRupees: number;
  mrpRupees?: number;
  sku: string;
  stock: number;
  isDefault: boolean;
}

interface ImageInput {
  id?: string;
  url: string;
  altText: string;
  displayOrder: number;
  isPrimary: boolean;
}

interface ProductFormProps {
  initialProduct?: any;
  categories: Array<{ id: string; name: string }>;
}

export function ProductForm({ initialProduct, categories }: ProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialProduct);

  const [title, setTitle] = useState(initialProduct?.title || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [categoryId, setCategoryId] = useState(initialProduct?.categoryId || categories[0]?.id || '');
  const [medium, setMedium] = useState(initialProduct?.medium || 'Natural stone pigments on cotton cloth');
  const [dimensions, setDimensions] = useState(initialProduct?.dimensions || '24 x 36 inches');
  const [careInstructions, setCareInstructions] = useState(initialProduct?.careInstructions || '');
  const [tags, setTags] = useState(initialProduct?.tags || '');
  const [featured, setFeatured] = useState(initialProduct?.featured ?? false);
  const [status, setStatus] = useState(initialProduct?.status || 'ACTIVE');
  const [seoTitle, setSeoTitle] = useState(initialProduct?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialProduct?.seoDescription || '');

  const [images, setImages] = useState<ImageInput[]>(
    initialProduct?.images?.map((img: any, idx: number) => ({
      id: img.id,
      url: img.url,
      altText: img.altText,
      displayOrder: img.displayOrder ?? idx,
      isPrimary: img.isPrimary ?? idx === 0,
    })) || [
      {
        url: '/placeholder-artwork.svg',
        altText: 'Artwork placeholder (Photo to be added)',
        displayOrder: 0,
        isPrimary: true,
      },
    ]
  );

  const [variants, setVariants] = useState<VariantInput[]>(
    initialProduct?.variants?.map((v: any) => ({
      id: v.id,
      size: v.size,
      frame: v.frame,
      priceRupees: Math.round(v.price / 100),
      mrpRupees: v.mrp ? Math.round(v.mrp / 100) : undefined,
      sku: v.sku,
      stock: v.stock,
      isDefault: v.isDefault,
    })) || [
      {
        size: '24 x 36 in',
        frame: 'Unframed / Rolled',
        priceRupees: 18000,
        mrpRupees: 21000,
        sku: `SKU-${Date.now().toString().slice(-6)}-1`,
        stock: 3,
        isDefault: true,
      },
    ]
  );

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto generate slug from title if new
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setImages((prev) => [
        ...prev,
        {
          url: data.url,
          altText: `${title || 'Artwork'} photo ${prev.length + 1}`,
          displayOrder: prev.length,
          isPrimary: prev.length === 0,
        },
      ]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        size: '36 x 48 in',
        frame: 'Teak Wood Frame',
        priceRupees: 25000,
        sku: `SKU-${Date.now().toString().slice(-6)}-${prev.length + 1}`,
        stock: 2,
        isDefault: false,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) {
      alert('A product must have at least one variant.');
      return;
    }
    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const payload = {
        title,
        slug,
        description,
        categoryId,
        medium,
        dimensions,
        careInstructions,
        tags,
        featured,
        status,
        seoTitle,
        seoDescription,
        images: images.map((img, idx) => ({
          url: img.url,
          altText: img.altText || `${title} photo ${idx + 1}`,
          displayOrder: idx,
          isPrimary: idx === 0,
        })),
        variants: variants.map((v) => ({
          size: v.size,
          frame: v.frame,
          price: Math.round(v.priceRupees * 100),
          mrp: v.mrpRupees ? Math.round(v.mrpRupees * 100) : null,
          sku: v.sku,
          stock: parseInt(String(v.stock), 10),
          isDefault: v.isDefault,
        })),
      };

      const url = isEditing ? `/api/admin/products/${initialProduct.id}` : '/api/admin/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save painting');
      }

      setSuccessMsg('Painting saved successfully.');
      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error saving product');
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/products/${initialProduct.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete');
      }
      router.push('/admin/products');
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Could not delete product');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between border-b border-[#E2DACD] pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-1.5 text-[#8A8175] hover:text-[#262320] border border-[#E2DACD] rounded-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#262320]">
              {isEditing ? `Edit: ${initialProduct.title}` : 'Add New Devotional Artwork'}
            </h1>
            <p className="text-xs text-[#5C554C]">
              Specify artwork details, stone pigments, dimensions, and sizes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              className="btn-secondary text-xs py-2 px-3 text-[#8C2B2B] hover:bg-[#FAF0F0]"
            >
              Delete Painting
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary text-xs py-2 px-4 disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Save Painting'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-[#FAF0F0] border border-[#D9B5B5] rounded-sm text-xs text-[#8C2B2B] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-[#EAE2D5] border border-[#D1C6B4] rounded-sm text-xs text-[#2A5C38] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-4">
            <h2 className="font-serif text-base font-semibold text-[#262320]">
              Painting Details
            </h2>

            <div className="space-y-1">
              <label className="block text-xs text-[#5C554C]">Painting Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                placeholder="e.g. Shreenathji Kamal Talai Pichwai"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-[#5C554C]">URL Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320] font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs text-[#5C554C]">Category *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-[#5C554C]">Dimensions *</label>
                <input
                  type="text"
                  required
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                  placeholder="e.g. 24 x 36 inches / 60 x 90 cm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-[#5C554C]">Medium and Materials *</label>
              <input
                type="text"
                required
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                placeholder="e.g. Natural stone pigments on cotton cloth"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-[#5C554C]">Description and Iconography *</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-[#5C554C]">Care & Preservation</label>
              <input
                type="text"
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                placeholder="e.g. Keep away from moisture. Dust gently with dry cloth."
              />
            </div>
          </div>

          {/* Variants Table (Size, Frame, Price in INR, MRP, SKU, Stock) */}
          <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-base font-semibold text-[#262320]">
                  Size and Framing Variants ({variants.length})
                </h2>
                <p className="text-[11px] text-[#8A8175]">
                  Each variant has its own price, stock count, and SKU.
                </p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Variant</span>
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#FAF6EF] border border-[#ECE5DA] rounded-sm grid grid-cols-1 sm:grid-cols-6 gap-2 items-center text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-[#8A8175]">Size</span>
                    <input
                      type="text"
                      value={v.size}
                      onChange={(e) => {
                        const copy = [...variants];
                        copy[idx].size = e.target.value;
                        setVariants(copy);
                      }}
                      className="w-full px-2 py-1 text-xs border border-[#E2DACD] rounded-sm bg-white text-[#262320]"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-[#8A8175]">Framing</span>
                    <input
                      type="text"
                      value={v.frame}
                      onChange={(e) => {
                        const copy = [...variants];
                        copy[idx].frame = e.target.value;
                        setVariants(copy);
                      }}
                      className="w-full px-2 py-1 text-xs border border-[#E2DACD] rounded-sm bg-white text-[#262320]"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-[#8A8175]">Price (INR)</span>
                    <input
                      type="number"
                      value={v.priceRupees}
                      onChange={(e) => {
                        const copy = [...variants];
                        copy[idx].priceRupees = parseInt(e.target.value || '0', 10);
                        setVariants(copy);
                      }}
                      className="w-full px-2 py-1 text-xs border border-[#E2DACD] rounded-sm bg-white text-[#262320]"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-[#8A8175]">MRP (INR)</span>
                    <input
                      type="number"
                      value={v.mrpRupees || ''}
                      placeholder="Optional"
                      onChange={(e) => {
                        const copy = [...variants];
                        copy[idx].mrpRupees = e.target.value ? parseInt(e.target.value, 10) : undefined;
                        setVariants(copy);
                      }}
                      className="w-full px-2 py-1 text-xs border border-[#E2DACD] rounded-sm bg-white text-[#262320]"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-[#8A8175]">Stock</span>
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) => {
                        const copy = [...variants];
                        copy[idx].stock = parseInt(e.target.value || '0', 10);
                        setVariants(copy);
                      }}
                      className="w-full px-2 py-1 text-xs border border-[#E2DACD] rounded-sm bg-white text-[#262320]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 sm:pt-0">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-[#8A8175]">SKU</span>
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => {
                          const copy = [...variants];
                          copy[idx].sku = e.target.value;
                          setVariants(copy);
                        }}
                        className="w-24 px-1.5 py-1 text-xs border border-[#E2DACD] rounded-sm bg-white font-mono text-[#262320]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="text-[#8A8175] hover:text-[#8C2B2B] p-1 mt-2"
                      title="Remove variant"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Images, Status, SEO (1 Col) */}
        <div className="space-y-6">
          {/* Status & Featured */}
          <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-4">
            <h2 className="font-serif text-base font-semibold text-[#262320]">
              Catalog Status
            </h2>

            <div className="space-y-1">
              <label className="block text-xs text-[#5C554C]">Publish Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm text-[#262320]"
              >
                <option value="ACTIVE">Active (Visible in Catalog)</option>
                <option value="DRAFT">Draft (Hidden)</option>
                <option value="ARCHIVED">Archived (Unlisted)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs text-[#262320] cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded-sm text-[#262320]"
              />
              <span>Feature on Gallery Homepage</span>
            </label>
          </div>

          {/* Artwork Photos */}
          <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-base font-semibold text-[#262320]">
                Images ({images.length})
              </h2>
              <label className="btn-secondary text-xs py-1.5 px-3 cursor-pointer flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-[#FAF6EF] border border-[#ECE5DA] rounded-sm flex items-center gap-3 text-xs"
                >
                  <div className="relative w-12 h-14 bg-white border border-[#E2DACD] shrink-0 overflow-hidden rounded-sm">
                    <Image src={img.url} alt={img.altText} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <input
                      type="text"
                      value={img.altText}
                      onChange={(e) => {
                        const copy = [...images];
                        copy[idx].altText = e.target.value;
                        setImages(copy);
                      }}
                      placeholder="Alt text description"
                      className="w-full px-2 py-1 text-xs border border-[#E2DACD] rounded-sm bg-white text-[#262320]"
                    />
                    <span className="text-[10px] text-[#8A8175]">
                      {idx === 0 ? 'Primary Gallery Cover' : `Photo ${idx + 1}`}
                    </span>
                  </div>
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-[#8A8175] hover:text-[#8C2B2B] p-1"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-3 text-xs">
            <h2 className="font-serif text-base font-semibold text-[#262320]">
              SEO & Metadata
            </h2>
            <div className="space-y-1">
              <label className="block text-[#5C554C]">SEO Meta Title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Custom meta title..."
                className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm text-[#262320]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[#5C554C]">SEO Meta Description</label>
              <textarea
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Custom meta description..."
                className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm text-[#262320]"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

