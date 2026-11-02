import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { ProductCard } from '@/components/shop/ProductCard';
import { Filter, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Prisma } from '@prisma/client';

// Dynamic catalog page

interface CatalogPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const currentCategory = params.category || '';
  const currentSearch = params.search || '';
  const currentSort = params.sort || 'newest';
  const currentPage = Math.max(1, parseInt(params.page || '1', 10));
  const minPrice = params.minPrice ? parseInt(params.minPrice, 10) : undefined;
  const maxPrice = params.maxPrice ? parseInt(params.maxPrice, 10) : undefined;
  const inStockOnly = params.inStock === 'true';

  const pageSize = 9;

  // Build Prisma where query
  const where: Prisma.ProductWhereInput = {
    status: 'ACTIVE',
  };

  if (currentCategory) {
    where.category = { slug: currentCategory };
  }

  if (currentSearch) {
    where.OR = [
      { title: { contains: currentSearch, mode: 'insensitive' } },
      { description: { contains: currentSearch, mode: 'insensitive' } },
      { medium: { contains: currentSearch, mode: 'insensitive' } },
      { tags: { contains: currentSearch, mode: 'insensitive' } },
    ];
  }

  // Variant price / stock filters
  const variantConditions: Prisma.ProductVariantWhereInput = {};
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceFilter: Prisma.IntFilter = {};
    if (minPrice !== undefined) priceFilter.gte = minPrice;
    if (maxPrice !== undefined) priceFilter.lte = maxPrice;
    variantConditions.price = priceFilter;
  }
  if (inStockOnly) {
    variantConditions.stock = { gt: 0 };
  }

  if (Object.keys(variantConditions).length > 0) {
    where.variants = { some: variantConditions };
  }

  // Sorting
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
  if (currentSort === 'price_asc') {
    orderBy = { variants: { _count: 'asc' } }; // fallback or sort client-side/via variant min
  }

  const [totalCount, products, categories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
        variants: { orderBy: { price: 'asc' } },
      },
      orderBy: currentSort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    }),
  ]);

  // Sort by price if requested
  if (currentSort === 'price_asc') {
    products.sort((a, b) => {
      const minA = a.variants[0]?.price ?? 0;
      const minB = b.variants[0]?.price ?? 0;
      return minA - minB;
    });
  } else if (currentSort === 'price_desc') {
    products.sort((a, b) => {
      const minA = a.variants[0]?.price ?? 0;
      const minB = b.variants[0]?.price ?? 0;
      return minB - minA;
    });
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  // Helper to build URL with search params
  const createFilterUrl = (overrides: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    const merged = {
      category: currentCategory,
      search: currentSearch,
      sort: currentSort,
      page: '1',
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      inStock: params.inStock,
      ...overrides,
    };

    Object.entries(merged).forEach(([k, v]) => {
      if (v) q.set(k, v);
    });

    return `/catalog?${q.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Title & Active Filter Summary */}
      <div className="border-b border-[#E2DACD] pb-6 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#262320]">
            {currentCategory
              ? categories.find((c) => c.slug === currentCategory)?.name || 'Paintings'
              : currentSearch
              ? `Search: "${currentSearch}"`
              : 'All Devotional Paintings'}
          </h1>
          <span className="text-xs text-[#8A8175]">
            Showing {products.length} of {totalCount} artworks
          </span>
        </div>
        <p className="text-xs text-[#5C554C] max-w-2xl">
          Authentic Pichwai paintings, sanctum portraits, and miniature devotional artworks. All pieces are handcrafted in Nathdwara.
        </p>

        {/* Active Filters Pill Bar */}
        {(currentCategory || currentSearch || inStockOnly || currentSort !== 'newest') && (
          <div className="pt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-[#8A8175] flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Active:
            </span>
            {currentCategory && (
              <Link
                href={createFilterUrl({ category: undefined })}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-white border border-[#E8E2D8] rounded-sm text-[#1C1917] hover:border-[#B8511B] shadow-xs"
              >
                <span>Category: {currentCategory}</span>
                <X className="w-3 h-3 text-[#B8511B]" />
              </Link>
            )}
            {currentSearch && (
              <Link
                href={createFilterUrl({ search: undefined })}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-white border border-[#E8E2D8] rounded-sm text-[#1C1917] hover:border-[#B8511B] shadow-xs"
              >
                <span>Search: {currentSearch}</span>
                <X className="w-3 h-3 text-[#B8511B]" />
              </Link>
            )}
            {inStockOnly && (
              <Link
                href={createFilterUrl({ inStock: undefined })}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-white border border-[#E8E2D8] rounded-sm text-[#1C1917] hover:border-[#B8511B] shadow-xs"
              >
                <span>In Stock Only</span>
                <X className="w-3 h-3 text-[#B8511B]" />
              </Link>
            )}
            <Link
              href="/catalog"
              className="text-[11px] text-[#8A8175] hover:text-[#262320] underline ml-2"
            >
              Clear all
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="space-y-6 lg:border-r lg:border-[#E2DACD] lg:pr-8">
          {/* Categories */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-semibold text-[#262320] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#8A8175]" />
              <span>Categories</span>
            </h3>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link
                  href={createFilterUrl({ category: undefined })}
                  className={`block py-1.5 px-2.5 rounded-sm transition-colors ${
                    !currentCategory
                      ? 'bg-[#1C1917] text-white font-medium shadow-xs'
                      : 'text-[#57534E] hover:text-[#1C1917] hover:bg-white'
                  }`}
                >
                  All Artworks
                </Link>
              </li>
              {categories.map((cat) => {
                const isSelected = currentCategory === cat.slug;
                return (
                  <li key={cat.id}>
                    <Link
                      href={createFilterUrl({ category: cat.slug })}
                      className={`block py-1.5 px-2.5 rounded-sm transition-colors ${
                        isSelected
                          ? 'bg-[#1C1917] text-white font-medium shadow-xs'
                          : 'text-[#57534E] hover:text-[#1C1917] hover:bg-white'
                      }`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Availability Filter */}
          <div className="space-y-3 pt-4 border-t border-[#ECE5DA]">
            <h3 className="font-serif text-sm font-semibold text-[#262320]">
              Availability
            </h3>
            <div className="space-y-2 text-xs">
              <Link
                href={createFilterUrl({ inStock: inStockOnly ? undefined : 'true' })}
                className={`flex items-center gap-2 py-1 px-2 rounded-sm border transition-colors ${
                  inStockOnly
                    ? 'border-[#262320] bg-[#FAF7F2] text-[#262320] font-medium'
                    : 'border-[#E2DACD] text-[#5C554C] hover:text-[#262320]'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
                    inStockOnly ? 'bg-[#262320] border-[#262320]' : 'border-[#D1C6B4]'
                  }`}
                >
                  {inStockOnly && <span className="w-1.5 h-1.5 bg-white" />}
                </span>
                <span>Ready in Nathdwara gallery</span>
              </Link>
            </div>
          </div>

          {/* Framing / Commission note */}
          <div className="p-4 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm text-xs space-y-2">
            <p className="font-serif font-semibold text-[#262320]">Need Custom Sizing?</p>
            <p className="text-[#5C554C] leading-relaxed">
              We prepare paintings in exact custom dimensions with personalized border colors and frame types.
            </p>
            <Link
              href="/custom-order"
              className="inline-block text-[#C47820] font-medium hover:underline pt-1"
            >
              Request Custom Painting
            </Link>
          </div>
        </aside>

        {/* Catalog Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sorting Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm text-xs">
            <span className="text-[#5C554C]">
              {totalCount === 0 ? 'No paintings found' : `Showing 1 to ${products.length} of ${totalCount}`}
            </span>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#8A8175]" />
              <span className="text-[#5C554C]">Sort:</span>
              <div className="flex gap-1.5">
                {[
                  { key: 'newest', label: 'Newest' },
                  { key: 'price_asc', label: 'Price: Low to High' },
                  { key: 'price_desc', label: 'Price: High to Low' },
                ].map((s) => (
                  <Link
                    key={s.key}
                    href={createFilterUrl({ sort: s.key })}
                    className={`px-2.5 py-1 rounded-sm border transition-colors ${
                      currentSort === s.key
                        ? 'border-[#262320] bg-[#262320] text-[#FAF6EF] font-medium'
                        : 'border-[#E2DACD] bg-[#FAF6EF] text-[#5C554C] hover:text-[#262320]'
                    }`}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {products.length === 0 ? (
            <div className="p-12 text-center bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-3">
              <p className="font-serif text-lg text-[#262320]">No paintings found</p>
              <p className="text-xs text-[#5C554C] max-w-sm mx-auto">
                No artworks matched your selected category or search filters.
              </p>
              <div className="pt-2">
                <Link href="/catalog" className="btn-secondary text-xs py-2 px-4">
                  Reset All Filters
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => {
                const defaultVariant = p.variants.find((v) => v.isDefault) || p.variants[0];
                const primaryImg = p.images[0]?.url || '/placeholder-artwork.svg';
                const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);

                return (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    title={p.title}
                    slug={p.slug}
                    medium={p.medium}
                    categoryName={p.category.name}
                    price={defaultVariant ? defaultVariant.price : 0}
                    mrp={defaultVariant?.mrp}
                    image={primaryImg}
                    stock={totalStock}
                  />
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-8 border-t border-[#E2DACD] flex items-center justify-between">
              <Link
                href={currentPage > 1 ? createFilterUrl({ page: String(currentPage - 1) }) : '#'}
                className={`btn-secondary text-xs py-2 px-3 flex items-center gap-1 ${
                  currentPage <= 1 ? 'pointer-events-none opacity-40' : ''
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </Link>

              <span className="text-xs text-[#5C554C]">
                Page {currentPage} of {totalPages}
              </span>

              <Link
                href={currentPage < totalPages ? createFilterUrl({ page: String(currentPage + 1) }) : '#'}
                className={`btn-secondary text-xs py-2 px-3 flex items-center gap-1 ${
                  currentPage >= totalPages ? 'pointer-events-none opacity-40' : ''
                }`}
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
