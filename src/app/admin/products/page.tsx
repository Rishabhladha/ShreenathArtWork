import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Prisma, ProductStatus } from '@prisma/client';
import { requireAdminSession } from '@/lib/auth';
import { formatPrice } from '@/lib/money';
import { PATHS } from '@/lib/paths';
import { Plus, Search, Filter, Edit, Eye } from 'lucide-react';

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
    redirect(PATHS.admin.login());
  }

  const { search, category, status } = await searchParams;

  const where: Prisma.ProductWhereInput = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { tags: { contains: search, mode: 'insensitive' } },
      { medium: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (category) {
    where.category = { slug: category };
  }
  if (status && Object.values(ProductStatus).includes(status as ProductStatus)) {
    where.status = status as ProductStatus;
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' }, take: 1 },
        variants: { orderBy: { price: 'asc' } },
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
            href={PATHS.admin.productNew}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Painting</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FAF7F2] p-4 border border-[#E2DACD] rounded-sm flex flex-col sm:flex-row gap-3">
        <form className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#8A8175] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              name="search"
              defaultValue={search || ''}
              placeholder="Search by painting title, medium, or tags..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E2DACD] rounded-sm focus-ring"
            />
          </div>
          <button type="submit" className="btn-secondary text-xs py-1.5 px-3">
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#8A8175]" />
          <div className="flex gap-2 text-xs">
            {categories.slice(0, 4).map((c) => (
              <a
                key={c.id}
                href={`?category=${c.slug}`}
                className={`px-2 py-1 rounded-sm border ${
                  category === c.slug
                    ? 'bg-[#262320] text-white border-[#262320]'
                    : 'bg-white text-[#5C554C] border-[#E2DACD] hover:bg-[#F4EFE6]'
                }`}
              >
                {c.name}
              </a>
            ))}
            {category && (
              <a
                href="/admin/products"
                className="px-2 py-1 text-[#8C2B2B] hover:underline"
              >
                Clear
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#E2DACD] rounded-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#FAF7F2] border-b border-[#E2DACD] text-[#5C554C] font-semibold">
              <th className="py-2.5 px-3">Artwork</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Variants</th>
              <th className="py-2.5 px-3">Price Range</th>
              <th className="py-2.5 px-3">Total Stock</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECE5DA]">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#8A8175]">
                  No paintings found matching the criteria.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
                const minPrice = p.variants[0]?.price || 0;
                const maxPrice = p.variants[p.variants.length - 1]?.price || minPrice;
                const primaryImage = p.images[0]?.url || '/placeholder-artwork.svg';

                return (
                  <tr key={p.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 bg-[#FAF7F2] border border-[#E2DACD] rounded-xs overflow-hidden shrink-0">
                          <Image
                            src={primaryImage}
                            alt={p.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-serif font-semibold text-[#262320] truncate max-w-xs">
                            {p.title}
                          </p>
                          <p className="text-[11px] text-[#8A8175] truncate max-w-xs">
                            {p.medium}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-[#5C554C]">
                      {p.category.name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#5C554C]">
                      {p.variants.length}
                    </td>
                    <td className="py-2.5 px-3 text-[#262320] font-medium">
                      {minPrice === maxPrice
                        ? formatPrice(minPrice)
                        : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-medium ${
                          totalStock === 0
                            ? 'text-[#8C2B2B]'
                            : totalStock <= 2
                            ? 'text-[#C47820]'
                            : 'text-[#2A5C38]'
                        }`}
                      >
                        {totalStock} units
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] uppercase font-mono font-semibold rounded-xs ${
                          p.status === 'ACTIVE'
                            ? 'bg-[#EBF5EE] text-[#2A5C38]'
                            : p.status === 'DRAFT'
                            ? 'bg-[#FEF6EE] text-[#C47820]'
                            : 'bg-[#F4EFE6] text-[#8A8175]'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={PATHS.product(p.slug)}
                          target="_blank"
                          className="p-1 text-[#8A8175] hover:text-[#262320]"
                          title="View on site"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={PATHS.admin.productEdit(p.id)}
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
