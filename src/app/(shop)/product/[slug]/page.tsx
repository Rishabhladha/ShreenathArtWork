import React, { Suspense, cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { logActivityEvent } from '@/lib/events';
import { ImageGallery } from '@/components/shop/ImageGallery';
import { VariantSelector } from '@/components/shop/VariantSelector';
import { ReviewSection } from '@/components/shop/ReviewSection';
import { ProductCard } from '@/components/shop/ProductCard';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { buildProductBreadcrumbs } from '@/lib/paths';
import { ShieldCheck, Truck, RotateCcw, Sparkles } from 'lucide-react';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Deduplicate database queries across generateMetadata and ProductDetailPage
const getProduct = cache(async (slug: string) => {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { displayOrder: 'asc' } },
      variants: { orderBy: { price: 'asc' } },
    },
  });
});

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return {};

  const minPrice = product.variants[0]?.price ? Math.round(product.variants[0].price / 100) : 0;
  const primaryImg = product.images[0]?.url || '/placeholder-artwork.svg';

  return {
    title: product.seoTitle || `${product.title} | SHREENATH ART WORK`,
    description:
      product.seoDescription ||
      `Authentic devotional painting from Nathdwara: ${product.title}. Hand painted using ${product.medium}. Starting from ₹${minPrice.toLocaleString('en-IN')}.`,
    openGraph: {
      title: product.title,
      description: product.description,
      images: [{ url: primaryImg }],
    },
  };
}

// Subcomponent for streaming Related Paintings asynchronously
async function RelatedProductsSection({
  categoryId,
  productId,
  categoryName,
}: {
  categoryId: string;
  productId: string;
  categoryName: string;
  categorySlug: string;
}) {
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId,
      id: { not: productId },
      status: 'ACTIVE',
    },
    include: {
      images: { orderBy: { displayOrder: 'asc' }, take: 1 },
      variants: { orderBy: { price: 'asc' } },
    },
    take: 3,
  });

  if (relatedProducts.length === 0) return null;

  return (
    <section className="pt-12 border-t border-[#DEC99C] space-y-6">
      <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#231C10]">
        More from {categoryName}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedProducts.map((p) => {
          const defaultVar = p.variants.find((v) => v.isDefault) || p.variants[0];
          const pImg = p.images[0]?.url || '/placeholder-artwork.svg';
          const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);

          return (
            <ProductCard
              key={p.id}
              id={p.id}
              title={p.title}
              slug={p.slug}
              medium={p.medium}
              categoryName={categoryName}
              price={defaultVar?.price ?? 0}
              mrp={defaultVar?.mrp}
              image={pImg}
              stock={totalStock}
            />
          );
        })}
      </div>
    </section>
  );
}

function RelatedProductsSkeleton() {
  return (
    <div className="pt-12 border-t border-[#DEC99C] space-y-6">
      <div className="h-6 w-52 bg-[#DEC99C]/50 rounded-xs animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border border-[#DEC99C] rounded-xs p-4 space-y-3 animate-pulse"
          >
            <div className="aspect-[4/5] bg-[#FAF7EE] rounded-xs w-full" />
            <div className="h-4 w-20 bg-[#DEC99C]/60 rounded-xs" />
            <div className="h-5 w-3/4 bg-[#DEC99C] rounded-xs" />
            <div className="h-4 w-24 bg-[#DEC99C]/80 rounded-xs" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product || product.status === 'ARCHIVED') {
    notFound();
  }

  // Audit activity trail for high-intent artwork view
  logActivityEvent({
    eventType: 'PRODUCT_VIEW',
    metadata: {
      productId: product.id,
      title: product.title,
      slug: product.slug,
      category: product.category?.name,
    },
  });

  const defaultVariant = product.variants.find((v) => v.isDefault) || product.variants[0];
  const primaryImg = product.images[0]?.url || '/placeholder-artwork.svg';

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images.map((img) => img.url),
    brand: {
      '@type': 'Brand',
      name: 'SHREENATH ART WORK',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: (defaultVariant?.price ?? 0) / 100,
      offerCount: product.variants.length,
      availability:
        product.variants.some((v) => v.stock > 0)
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  };

  const breadcrumbs = buildProductBreadcrumbs({
    productTitle: product.title,
    categoryName: product.category?.name,
    categorySlug: product.category?.slug,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 sm:space-y-12">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={breadcrumbs} />

        {/* Product Hero: Gallery + Purchasing Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          {/* Left: Image Gallery */}
          <div>
            <ImageGallery title={product.title} images={product.images} />
          </div>

          {/* Right: Artwork Details & Variant Selection */}
          <div className="space-y-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#B8860B] font-sans font-semibold">
                {product.category.name}
              </span>
              <h1 className="font-serif text-2xl sm:text-4xl font-semibold text-[#231C10] mt-1 leading-snug">
                {product.title}
              </h1>
            </div>

            {/* Variant Selector: size, frame, price, quantity, add to cart + mobile action bar */}
            <VariantSelector
              productId={product.id}
              title={product.title}
              slug={product.slug}
              image={primaryImg}
              variants={product.variants.map((v) => ({
                id: v.id,
                size: v.size,
                frame: v.frame,
                price: v.price,
                mrp: v.mrp,
                sku: v.sku,
                stock: v.stock,
                isDefault: v.isDefault,
              }))}
            />

            {/* Specifications Grid */}
            <div className="border-t border-[#DEC99C] pt-6 space-y-3">
              <h2 className="font-serif text-sm font-semibold text-[#231C10]">
                Artwork Specifications
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                <div>
                  <dt className="text-[#7A694F]">Medium and Technique:</dt>
                  <dd className="font-medium text-[#231C10] mt-0.5">{product.medium}</dd>
                </div>
                <div>
                  <dt className="text-[#7A694F]">Standard Dimensions:</dt>
                  <dd className="font-medium text-[#231C10] mt-0.5">{product.dimensions}</dd>
                </div>
                <div>
                  <dt className="text-[#7A694F]">Origin:</dt>
                  <dd className="font-medium text-[#231C10] mt-0.5">Nathdwara, Rajasthan</dd>
                </div>
                <div>
                  <dt className="text-[#7A694F]">Artists:</dt>
                  <dd className="font-medium text-[#231C10] mt-0.5">
                    Traditional Nathdwara Lineage Artists
                  </dd>
                </div>
              </dl>
            </div>

            {/* Artwork Description */}
            <div className="border-t border-[#DEC99C] pt-6 space-y-3">
              <h2 className="font-serif text-sm font-semibold text-[#231C10]">
                Description and Iconography
              </h2>
              <div className="text-xs text-[#4A3E2D] leading-relaxed space-y-2 whitespace-pre-line">
                {product.description}
              </div>
            </div>

            {/* Care Instructions */}
            {product.careInstructions && (
              <div className="border-t border-[#DEC99C] pt-6 space-y-2">
                <h3 className="font-serif text-sm font-semibold text-[#231C10] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#B8860B]" />
                  <span>Preservation and Care</span>
                </h3>
                <p className="text-xs text-[#4A3E2D] leading-relaxed">
                  {product.careInstructions}
                </p>
              </div>
            )}

            {/* Shipping & Return Highlights */}
            <div className="p-4 bg-white border border-[#DEC99C] rounded-xs space-y-3 text-xs text-[#4A3E2D] shadow-xs">
              <div className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
                <span>
                  Free insured dispatch on orders above ₹5,000. Packed in reinforced wooden boxes.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
                <span>
                  Authenticity guarantee from our Nathdwara workshop with every painting.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <RotateCcw className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
                <span>
                  Transit damage protection: immediate replacement or refund upon inspection.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Collector Reviews Section */}
        <ReviewSection productId={product.id} />

        {/* Related Paintings Section (Streamed via Suspense) */}
        <Suspense fallback={<RelatedProductsSkeleton />}>
          <RelatedProductsSection
            categoryId={product.categoryId}
            productId={product.id}
            categoryName={product.category.name}
            categorySlug={product.category.slug}
          />
        </Suspense>
      </div>
    </>
  );
}
