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
import { ShieldCheck, Truck, RotateCcw, Sparkles, Award } from 'lucide-react';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

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
      `Authentic devotional painting from Nathdwara: ${product.title}. Handcrafted using ${product.medium}. Starting from ₹${minPrice.toLocaleString('en-IN')}.`,
    openGraph: {
      title: product.title,
      description: product.description,
      images: [{ url: primaryImg }],
    },
  };
}

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
    <section className="pt-12 border-t border-[#E5D7BF] space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-[#C5A059]" />
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#12100E]">
          More Masterpieces from {categoryName}
        </h2>
      </div>
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
    <div className="pt-12 border-t border-[#E5D7BF] space-y-6">
      <div className="h-6 w-52 bg-[#E5D7BF]/60 rounded-xs animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border border-[#E5D7BF] rounded-xs p-4 space-y-3 animate-pulse"
          >
            <div className="aspect-[4/5] bg-[#FAF6EF] rounded-xs w-full" />
            <div className="h-4 w-20 bg-[#E5D7BF]/60 rounded-xs" />
            <div className="h-5 w-3/4 bg-[#E5D7BF] rounded-xs" />
            <div className="h-4 w-24 bg-[#E5D7BF]/80 rounded-xs" />
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 sm:space-y-12 bg-[#FAF6EF]">
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
              <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-sans font-semibold">
                {product.category.name}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#12100E] mt-1 leading-snug">
                {product.title}
              </h1>
            </div>

            {/* Variant Selector */}
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
            <div className="border-t border-[#E5D7BF] pt-6 space-y-3">
              <h2 className="font-serif text-base font-semibold text-[#12100E] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#C5A059]" />
                <span>Museum Artwork Specifications</span>
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                <div>
                  <dt className="text-[#82776A]">Medium & Pigments:</dt>
                  <dd className="font-medium text-[#12100E] mt-0.5">{product.medium}</dd>
                </div>
                <div>
                  <dt className="text-[#82776A]">Standard Dimensions:</dt>
                  <dd className="font-medium text-[#12100E] mt-0.5">{product.dimensions}</dd>
                </div>
                <div>
                  <dt className="text-[#82776A]">Provenance Origin:</dt>
                  <dd className="font-medium text-[#12100E] mt-0.5">Nathdwara, Mewar, Rajasthan</dd>
                </div>
                <div>
                  <dt className="text-[#82776A]">Lineage Artists:</dt>
                  <dd className="font-medium text-[#12100E] mt-0.5">
                    Traditional Pushtimarg Haveli Lineage Masters
                  </dd>
                </div>
              </dl>
            </div>

            {/* Artwork Description */}
            <div className="border-t border-[#E5D7BF] pt-6 space-y-3">
              <h2 className="font-serif text-base font-semibold text-[#12100E]">
                Devotional Iconography & Significance
              </h2>
              <div className="text-xs sm:text-sm text-[#524B43] leading-relaxed space-y-2.5 whitespace-pre-line font-light">
                {product.description}
              </div>
            </div>

            {/* Care Instructions */}
            {product.careInstructions && (
              <div className="border-t border-[#E5D7BF] pt-6 space-y-2">
                <h3 className="font-serif text-sm font-semibold text-[#12100E] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#C5A059]" />
                  <span>Preservation & Gold Leaf Care</span>
                </h3>
                <p className="text-xs text-[#524B43] leading-relaxed font-light">
                  {product.careInstructions}
                </p>
              </div>
            )}

            {/* Shipping & Return Highlights */}
            <div className="p-5 bg-white border border-[#E5D7BF] rounded-xs space-y-3.5 text-xs text-[#524B43] shadow-xs">
              <div className="flex items-start gap-3">
                <Truck className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <span>
                  Free insured dispatch across India on orders above ₹5,000. Packed in reinforced wooden crates.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <span>
                  Authenticity guarantee signed by lineage master artists with 24kt gold leaf certificate.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <RotateCcw className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <span>
                  Transit protection: immediate replacement or refund guarantee in case of courier inspection damage.
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
