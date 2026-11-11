import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { ProductCard } from '@/components/shop/ProductCard';
import { Filter, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Prisma } from '@prisma/client';
import { PATHS } from '@/lib/paths';

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

  // Optimize: run category fetch in parallel with main queries
  const categoriesPromise = prisma.category.findMany({
    orderBy: { displayOrder: 'asc' },
    select: { id: true, name: true, slug: true },
  });

  // Query products with pagination
  let totalCount = 0;
  let products: Array<
    Prisma.ProductGetPayload<{
      include: {
        category: true;
        images: true;
        variants: true;
      };
    }>
  > = [];

  const includeRelations = {
    category: true,
    images: { orderBy: { displayOrder: 'asc' as const }, take: 1 },
    variants: { orderBy: { price: 'asc' as const } },
  };

  if (currentSort === 'price-asc' || currentSort === 'price-desc') {
    // If sorting by price, retrieve filtered products and sort by default variant price
    const allMatching = await prisma.product.findMany({
      where,
      include: includeRelations,
    });
    totalCount = allMatching.length;

    allMatching.sort((a, b) => {
      const priceA = a.variants[0]?.price || 0;
      const priceB = b.variants[0]?.price || 0;
      return currentSort === 'price-asc' ? priceA - priceB : priceB - priceA;
    });

    products = allMatching.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  } else {
    // Native database pagination for chronological sorting
    const [count, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: includeRelations,
        orderBy: currentSort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    totalCount = count;
    products = items;
  }

  const categories = await categoriesPromise;

  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Helper to build URL with search params
  const createFilterUrl = (overrides: Record<string, string | undefined>) => {
    return PATHS.catalog({
      category: currentCategory,
      search: currentSearch,
      sort: currentSort,
      page: '1',
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      inStock: params.inStock,
      ...overrides,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Title & Active Filter Summary */}
      <div className="border-b border-[#E2DACD] pb-6 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1917]">
              {currentCategory
                ? categories.find((c) => c.slug === currentCategory)?.name || 'Artworks Collection'
                : 'Devotional Artwork Collection'}
            </h1>
            <p className="text-xs text-[#7A694F] mt-1">
              Hand painted and framed in Nathdwara using traditional mineral and stone pigments.
            </p>
          </div>

          <p className="text-xs text-[#7A694F]">
            Showing <span className="font-medium text-[#1C1917]">{startItem}-{endItem}</span> of{' '}
            <span className="font-medium text-[#1C1917]">{totalCount}</span> paintings
          </p>
        </div>

        {/* Active Filters Pill Bar */}
        {(currentCategory || currentSearch || inStockOnly) && (
          <div className="flex flex-wrap items-center gap-2 pt-3">
            <span className="text-[11px] text-[#7A694F] font-medium flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#B8511B]" />
              Filters:
            </span>
            {currentCategory && (
              <Link
                href={createFilterUrl({ category: undefined })}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#DEC99C] rounded-sm text-xs text-[#231C10] hover:border-[#B8511B] transition-colors"
              >
                <span>Category: {categories.find((c) => c.slug === currentCategory)?.name}</span>
                <X className="w-3 h-3 text-[#B8511B]" />
              </Link>
            )}
            {currentSearch && (
              <Link
                href={createFilterUrl({ search: undefined })}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#DEC99C] rounded-sm text-xs text-[#231C10] hover:border-[#B8511B] transition-colors"
              >
                <span>Search: &ldquo;{currentSearch}&rdquo;</span>
                <X className="w-3 h-3 text-[#B8511B]" />
              </Link>
            )}
            {inStockOnly && (
              <Link
                href={createFilterUrl({ inStock: undefined })}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#DEC99C] rounded-sm text-xs text-[#231C10] hover:border-[#B8511B] transition-colors"
              >
                <span>In Stock Only</span>
                <X className="w-3 h-3 text-[#B8511B]" />
              </Link>
            )}
            <Link
              href={PATHS.catalog()}
              className="text-[11px] text-[#8A8175] hover:text-[#262320] underline ml-2"
            >
              Clear all
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filter Column */}
        <aside className="space-y-6">
          <div className="bg-[#FAF7F2] border border-[#E2DACD] rounded-sm p-5 space-y-6">
            <div className="flex items-center gap-2 border-b border-[#E2DACD] pb-3 text-[#262320]">
              <SlidersHorizontal className="w-4 h-4 text-[#C47820]" />
              <h2 className="font-serif text-base font-semibold">Filter Collection</h2>
            </div>

            {/* Category Filter List */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-[#262320] uppercase tracking-wider">
                Categories
              </h3>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <Link
                    href={createFilterUrl({ category: undefined })}
                    className={`block py-1 px-2 rounded-xs transition-colors ${
                      !currentCategory
                        ? 'bg-[#262320] text-[#FAF6EF] font-medium'
                        : 'text-[#5C554C] hover:text-[#262320] hover:bg-[#F4EFE6]'
                    }`}
                  >
                    All Collections
                  </Link>
                </li>
                {categories.map((cat) => {
                  const isActive = currentCategory === cat.slug;
                  return (
                    <li key={cat.id}>
                      <Link
                        href={createFilterUrl({ category: cat.slug })}
                        className={`block py-1 px-2 rounded-xs transition-colors ${
                          isActive
                            ? 'bg-[#262320] text-[#FAF6EF] font-medium'
                            : 'text-[#5C554C] hover:text-[#262320] hover:bg-[#F4EFE6]'
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
            <div className="border-t border-[#E2DACD] pt-5 space-y-3">
              <h3 className="text-xs font-semibold text-[#262320] uppercase tracking-wider">
                Availability
              </h3>
              <label className="flex items-center gap-2 text-xs text-[#5C554C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  readOnly
                  className="rounded-xs border-[#E2DACD] text-[#C47820] focus-ring"
                />
                <Link
                  href={createFilterUrl({ inStock: inStockOnly ? undefined : 'true' })}
                  className="hover:text-[#262320]"
                >
                  In Stock in Nathdwara only
                </Link>
              </label>
            </div>
          </div>

          {/* Need Custom Painting helper box */}
          <div className="p-4 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-2 text-xs">
            <p className="font-serif font-semibold text-[#262320]">Need Custom Sizing?</p>
            <p className="text-[#5C554C] leading-relaxed">
              We prepare paintings in exact custom dimensions with personalized border colors and frame types.
            </p>
            <Link
              href={PATHS.customOrder}
              className="inline-block text-[#C47820] font-medium hover:underline pt-1"
            >
              Request Custom Painting
            </Link>
          </div>
        </aside>

        {/* Catalog Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sorting Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm text-xs">
            <div className="flex items-center gap-2 text-[#5C554C]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#8A8175]" />
              <span>Sort by:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: 'newest', label: 'Newest Arrivals' },
                { key: 'price-asc', label: 'Price: Low to High' },
                { key: 'price-desc', label: 'Price: High to Low' },
                { key: 'oldest', label: 'Oldest' },
              ].map((s) => {
                const isActive = currentSort === s.key;
                return (
                  <Link
                    key={s.key}
                    href={createFilterUrl({ sort: s.key })}
                    className={`px-2.5 py-1 rounded-sm transition-colors ${
                      isActive
                        ? 'bg-[#262320] text-[#FAF6EF] font-medium'
                        : 'text-[#5C554C] hover:text-[#262320] hover:bg-[#F4EFE6]'
                    }`}
                  >
                    {s.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Paintings Grid */}
          {products.length === 0 ? (
            <div className="text-center py-20 bg-white border border-[#DEC99C] rounded-sm space-y-4">
              <p className="font-serif text-xl text-[#231C10]">No paintings found</p>
              <p className="text-xs text-[#5C554C] max-w-sm mx-auto">
                No artworks matched your selected category or search filters.
              </p>
              <div className="pt-2">
                <Link href={PATHS.catalog()} className="btn-secondary text-xs py-2 px-4">
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
                    categoryName={p.category?.name}
                    price={defaultVariant?.price ?? 0}
                    mrp={defaultVariant?.mrp}
                    image={primaryImg}
                    stock={totalStock}
                  />
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-8 border-t border-[#E2DACD] flex items-center justify-between text-xs">
              <Link
                href={currentPage > 1 ? createFilterUrl({ page: String(currentPage - 1) }) : '#'}
                className={`flex items-center gap-1 px-3 py-2 border rounded-sm transition-colors ${
                  currentPage > 1
                    ? 'border-[#E2DACD] text-[#262320] hover:bg-[#FAF7F2]'
                    : 'border-[#ECE5DA] text-[#D1C6B4] pointer-events-none'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Link>

              <span className="text-[#5C554C]">
                Page <span className="font-medium text-[#262320]">{currentPage}</span> of{' '}
                <span className="font-medium text-[#262320]">{totalPages}</span>
              </span>

              <Link
                href={currentPage < totalPages ? createFilterUrl({ page: String(currentPage + 1) }) : '#'}
                className={`flex items-center gap-1 px-3 py-2 border rounded-sm transition-colors ${
                  currentPage < totalPages
                    ? 'border-[#E2DACD] text-[#262320] hover:bg-[#FAF7F2]'
                    : 'border-[#ECE5DA] text-[#D1C6B4] pointer-events-none'
                }`}
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
