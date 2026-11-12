import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { ProductCard } from '@/components/shop/ProductCard';
import { Filter, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import { Prisma } from '@prisma/client';
import { PATHS } from '@/lib/paths';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8 bg-[#FAF6EF]">
      {/* Title & Active Filter Summary */}
      <div className="border-b border-[#E5D7BF] pb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#12100E]">
              {currentCategory
                ? categories.find((c) => c.slug === currentCategory)?.name || 'Sacred Paintings'
                : 'Sacred Devotional Masterpieces'}
            </h1>
            <p className="text-xs sm:text-sm text-[#82776A] mt-1 font-light">
              Handcrafted in Nathdwara using natural stone pigments, lapis lazuli, and genuine 24kt gold varak.
            </p>
          </div>

          <p className="text-xs text-[#82776A]">
            Catalog Index: <span className="font-serif font-bold text-sm text-[#12100E]">{startItem}-{endItem}</span> of{' '}
            <span className="font-serif font-bold text-sm text-[#12100E]">{totalCount}</span> artworks
          </p>
        </div>

        {/* Mobile & Tablet Fast Category Pill Scroller */}
        <div className="pt-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <Link
              href={createFilterUrl({ category: undefined })}
              className={`shrink-0 min-h-[44px] px-4 py-2 rounded-xs border text-xs font-medium flex items-center transition-all ${
                !currentCategory
                  ? 'bg-[#12100E] text-[#DFBE72] border-[#C5A059] shadow-sm'
                  : 'bg-white text-[#524B43] border-[#E5D7BF] hover:border-[#C5A059] hover:text-[#12100E]'
              }`}
            >
              All Masterpieces
            </Link>
            {categories.map((cat) => {
              const isActive = currentCategory === cat.slug;
              return (
                <Link
                  key={cat.id}
                  href={createFilterUrl({ category: cat.slug })}
                  className={`shrink-0 min-h-[44px] px-4 py-2 rounded-xs border text-xs font-medium flex items-center transition-all ${
                    isActive
                      ? 'bg-[#12100E] text-[#DFBE72] border-[#C5A059] shadow-sm'
                      : 'bg-white text-[#524B43] border-[#E5D7BF] hover:border-[#C5A059] hover:text-[#12100E]'
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {(currentCategory || currentSearch || inStockOnly) && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-[#82776A] font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#C5A059]" />
              Active Filters:
            </span>
            {currentCategory && (
              <Link
                href={createFilterUrl({ category: undefined })}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E5D7BF] hover:border-[#8B1E1E] rounded-xs text-xs text-[#12100E] transition-colors min-h-[38px] shadow-2xs"
              >
                <span>Category: {categories.find((c) => c.slug === currentCategory)?.name}</span>
                <X className="w-3.5 h-3.5 text-[#8B1E1E]" />
              </Link>
            )}
            {currentSearch && (
              <Link
                href={createFilterUrl({ search: undefined })}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E5D7BF] hover:border-[#8B1E1E] rounded-xs text-xs text-[#12100E] transition-colors min-h-[38px] shadow-2xs"
              >
                <span>Search: &ldquo;{currentSearch}&rdquo;</span>
                <X className="w-3.5 h-3.5 text-[#8B1E1E]" />
              </Link>
            )}
            {inStockOnly && (
              <Link
                href={createFilterUrl({ inStock: undefined })}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E5D7BF] hover:border-[#8B1E1E] rounded-xs text-xs text-[#12100E] transition-colors min-h-[38px] shadow-2xs"
              >
                <span>In Stock in Nathdwara</span>
                <X className="w-3.5 h-3.5 text-[#8B1E1E]" />
              </Link>
            )}
            <Link
              href={PATHS.catalog()}
              className="text-xs text-[#8B1E1E] hover:underline ml-2 py-1 min-h-[38px] flex items-center font-medium"
            >
              Reset all
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filter Column (Desktop View) */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-white border border-[#E5D7BF] rounded-xs p-5 space-y-6 shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#E5D7BF] pb-3 text-[#12100E]">
              <SlidersHorizontal className="w-4 h-4 text-[#C5A059]" />
              <h2 className="font-serif text-base font-semibold">Filter Collection</h2>
            </div>

            {/* Category Filter List */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-[#12100E] uppercase tracking-wider">
                Categories
              </h3>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <Link
                    href={createFilterUrl({ category: undefined })}
                    className={`block py-2 px-2.5 rounded-xs transition-colors ${
                      !currentCategory
                        ? 'bg-[#12100E] text-[#DFBE72] font-semibold border border-[#C5A059]/40'
                        : 'text-[#524B43] hover:text-[#12100E] hover:bg-[#FAF6EF]'
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
                        className={`block py-2 px-2.5 rounded-xs transition-colors ${
                          isActive
                            ? 'bg-[#12100E] text-[#DFBE72] font-semibold border border-[#C5A059]/40'
                            : 'text-[#524B43] hover:text-[#12100E] hover:bg-[#FAF6EF]'
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
            <div className="border-t border-[#E5D7BF] pt-5 space-y-3">
              <h3 className="text-xs font-semibold text-[#12100E] uppercase tracking-wider">
                Availability
              </h3>
              <Link
                href={createFilterUrl({ inStock: inStockOnly ? undefined : 'true' })}
                className={`flex items-center gap-2.5 py-2 px-2.5 rounded-xs text-xs transition-colors ${
                  inStockOnly
                    ? 'bg-[#12100E] text-[#DFBE72] font-semibold border border-[#C5A059]/40'
                    : 'text-[#524B43] hover:text-[#12100E] hover:bg-[#FAF6EF]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${inStockOnly ? 'bg-[#DFBE72]' : 'bg-[#1F5E3B]'}`} />
                <span>In Stock in Nathdwara only</span>
              </Link>
            </div>
          </div>

          {/* Need Custom Painting helper box */}
          <div className="p-5 bg-[#12100E] text-[#FAF6EF] border border-[#C5A059]/40 rounded-xs space-y-2.5 text-xs shadow-md">
            <div className="flex items-center gap-1.5 text-[#DFBE72]">
              <Sparkles className="w-4 h-4" />
              <p className="font-serif font-semibold text-sm text-[#FAF6EF]">Custom Sanctum Sizing?</p>
            </div>
            <p className="text-[#FAF6EF]/80 leading-relaxed font-light">
              We create customized paintings according to your pooja altar or wall dimensions with seasoned teak framing.
            </p>
            <Link
              href={PATHS.customOrder}
              className="inline-flex items-center text-xs font-semibold text-[#DFBE72] hover:underline pt-1"
            >
              <span>Commission Custom Artwork →</span>
            </Link>
          </div>
        </aside>

        {/* Catalog Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sorting Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border border-[#E5D7BF] rounded-xs text-xs shadow-xs">
            <div className="flex items-center gap-2 text-[#524B43]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="font-medium">Sort Masterpieces:</span>
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
                    className={`min-h-[44px] px-3.5 py-2 rounded-xs transition-colors flex items-center ${
                      isActive
                        ? 'bg-[#12100E] text-[#DFBE72] font-semibold border border-[#C5A059]/40'
                        : 'text-[#524B43] hover:text-[#12100E] hover:bg-[#FAF6EF]'
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
            <div className="text-center py-20 bg-white border border-[#E5D7BF] rounded-xs space-y-4">
              <p className="font-serif text-xl text-[#12100E] font-semibold">No artworks found</p>
              <p className="text-xs text-[#82776A] max-w-sm mx-auto">
                No devotional paintings matched your current filter criteria.
              </p>
              <div className="pt-2">
                <Link href={PATHS.catalog()} className="btn-secondary text-xs py-2.5 px-5 min-h-[44px]">
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
            <div className="pt-8 border-t border-[#E5D7BF] flex items-center justify-between text-xs">
              <Link
                href={currentPage > 1 ? createFilterUrl({ page: String(currentPage - 1) }) : '#'}
                className={`flex items-center gap-1.5 px-4 py-2.5 border rounded-xs transition-colors min-h-[44px] ${
                  currentPage > 1
                    ? 'border-[#E5D7BF] bg-white text-[#12100E] hover:bg-[#FAF6EF]'
                    : 'border-[#E5D7BF]/40 text-[#82776A]/40 pointer-events-none'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Link>

              <span className="text-[#524B43] font-medium">
                Page <span className="font-semibold text-[#12100E]">{currentPage}</span> of{' '}
                <span className="font-semibold text-[#12100E]">{totalPages}</span>
              </span>

              <Link
                href={currentPage < totalPages ? createFilterUrl({ page: String(currentPage + 1) }) : '#'}
                className={`flex items-center gap-1.5 px-4 py-2.5 border rounded-xs transition-colors min-h-[44px] ${
                  currentPage < totalPages
                    ? 'border-[#E5D7BF] bg-white text-[#12100E] hover:bg-[#FAF6EF]'
                    : 'border-[#E5D7BF]/40 text-[#82776A]/40 pointer-events-none'
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
