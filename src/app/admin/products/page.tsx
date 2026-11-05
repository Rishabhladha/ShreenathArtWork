import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Prisma, ProductStatus } from '@prisma/client';
import { requireAdminSession } from '@/lib/auth';
import { formatPrice } from '@/lib/money';
import { Plus, Search, Filter, Edit, Eye, Archive } from 'lucide-react';

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    status?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const session = await requireAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const { search, category, status } = await searchParams;

  const where: Prisma.ProductWhereInput = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (category) {
    where.categoryId = category;
  }
  if (status) {
    where.status = status as ProductStatus;
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: true,
        images: { orderBy: { displayOrder: 'asc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DACD] pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#262320]">
            Paintings Catalog ({products.length})
          </h1>
          <p className="text-xs text-[#5C554C] mt-0.5">
            Manage artworks, size and frame variants, stock levels, and photographs.
          </p>
        </div>
        <div>
          <Link
            href="/admin/products/new"
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Painting</span>
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm flex flex-wrap items-center justify-between gap-4">
        <form method="GET" action="/admin/products" className="flex flex-wrap items-center gap-2 flex-1">
          <input
            type="text"
            name="search"
            defaultValue={search || ''}
            placeholder="Search by title or slug..."
            className="px-3 py-1.5 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320] w-64"
          />
          <select
            name="category"
            defaultValue={category || ''}
            className="px-3 py-1.5 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={status || ''}
            className="px-3 py-1.5 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <button type="submit" className="btn-secondary text-xs py-1.5 px-3">
            Filter
          </button>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-[#FAF7F2] border border-[#E2DACD] rounded-sm overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#F4EFE6] text-[#262320] border-b border-[#E2DACD]">
            <tr>
              <th className="py-2.5 px-3 font-semibold">Artwork</th>
              <th className="py-2.5 px-3 font-semibold">Category</th>
              <th className="py-2.5 px-3 font-semibold">Variants</th>
              <th className="py-2.5 px-3 font-semibold">Stock</th>
              <th className="py-2.5 px-3 font-semibold">Price Range</th>
              <th className="py-2.5 px-3 font-semibold">Status</th>
              <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECE5DA]">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#8A8175]">
                  No paintings found matching the criteria.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
                const minPrice = p.variants.length > 0 ? Math.min(...p.variants.map((v) => v.price)) : 0;
                const maxPrice = p.variants.length > 0 ? Math.max(...p.variants.map((v) => v.price)) : 0;
                const primaryImage = p.images[0]?.url || '/placeholder-artwork.svg';

                return (
                  <tr key={p.id} className="hover:bg-[#FAF6EF]">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 bg-[#F4EFE6] border border-[#ECE5DA] rounded-sm overflow-hidden shrink-0">
                          <Image src={primaryImage} alt={p.title} fill className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[#262320] truncate">{p.title}</p>
                          <p className="text-[11px] text-[#8A8175] truncate">/product/{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-[#5C554C]">{p.category.name}</td>
                    <td className="py-2.5 px-3 text-[#5C554C]">{p.variants.length} variant(s)</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded-sm font-semibold text-[11px] ${
                          totalStock === 0
                            ? 'bg-[#FAF0F0] text-[#8C2B2B]'
                            : totalStock <= 3
                            ? 'bg-[#FDF4E7] text-[#94601A]'
                            : 'bg-[#EAE2D5] text-[#262320]'
                        }`}
                      >
                        {totalStock} units
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#262320]">
                      {minPrice === maxPrice
                        ? formatPrice(minPrice)
                        : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] rounded-sm font-medium border ${
                          p.status === 'ACTIVE'
                            ? 'bg-[#EAE2D5] text-[#2A5C38] border-[#D1C6B4]'
                            : p.status === 'DRAFT'
                            ? 'bg-[#FAF6EF] text-[#8A8175] border-[#ECE5DA]'
                            : 'bg-[#FAF0F0] text-[#8C2B2B] border-[#D9B5B5]'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/product/${p.slug}`}
                          target="_blank"
                          className="p-1 text-[#8A8175] hover:text-[#262320]"
                          title="View on site"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </Link>
                      </div>
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
