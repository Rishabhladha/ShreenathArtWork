import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { ImageGallery } from '@/components/shop/ImageGallery';
import { VariantSelector } from '@/components/shop/VariantSelector';
import { ReviewSection } from '@/components/shop/ReviewSection';
import { ReviewSectionSkeleton } from '@/components/shop/ReviewSectionSkeleton';
import { ProductCard } from '@/components/shop/ProductCard';
import { ShieldCheck, Truck, RotateCcw, ChevronRight, Sparkles } from 'lucide-react';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: true, variants: { orderBy: { price: 'asc' }, take: 1 } },
  });

  if (!product) return {};

  const minPrice = product.variants[0]?.price ? Math.round(product.variants[0].price / 100) : 0;
  const primaryImg = product.images[0]?.url || '/placeholder-artwork.svg';

  return {
    title: product.seoTitle || `${product.title} | SHREENATH ART WORK`,
    description:
      product.seoDescription ||
      `Authentic devotional painting from Nathdwara: ${product.title}. Hand painted using ${product.medium}. Starting from Rs ${minPrice}.`,
    openGraph: {
      title: product.title,
      description: product.description,
      images: [{ url: primaryImg }],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { displayOrder: 'asc' } },
      variants: { orderBy: { price: 'asc' } },
    },
  });

  if (!product || product.status === 'ARCHIVED') {
    notFound();
  }

  // Related products from same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: 'ACTIVE',
    },
    include: {
      category: true,
      images: { orderBy: { displayOrder: 'asc' }, take: 1 },
      variants: { orderBy: { price: 'asc' } },
    },
    take: 3,
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center text-xs text-[#8A8175] gap-1.5">
          <Link href="/" className="hover:text-[#262320]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/catalog" className="hover:text-[#262320]">
            Catalog
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href={`/catalog?category=${product.category.slug}`}
            className="hover:text-[#262320]"
          >
            {product.category.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#262320] truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Product Hero: Gallery + Purchasing Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Left: Image Gallery */}
          <div>
            <ImageGallery title={product.title} images={product.images} />
          </div>

          {/* Right: Artwork Details & Variant Selection */}
          <div className="space-y-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#B8511B] font-sans font-semibold">
                {product.category.name}
              </span>
              <h1 className="font-serif text-2xl sm:text-4xl font-semibold text-[#1C1917] mt-1 leading-snug">
                {product.title}
              </h1>
            </div>

            {/* Variant Selector: size, frame, price, quantity, add to cart */}
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
            <div className="border-t border-[#E2DACD] pt-6 space-y-3">
              <h2 className="font-serif text-sm font-semibold text-[#262320]">
                Artwork Specifications
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <dt className="text-[#8A8175]">Medium and Technique:</dt>
                  <dd className="font-medium text-[#262320] mt-0.5">{product.medium}</dd>
                </div>
                <div>
                  <dt className="text-[#8A8175]">Standard Dimensions:</dt>
                  <dd className="font-medium text-[#262320] mt-0.5">{product.dimensions}</dd>
                </div>
                <div>
                  <dt className="text-[#8A8175]">Origin:</dt>
                  <dd className="font-medium text-[#262320] mt-0.5">Nathdwara, Rajasthan</dd>
                </div>
                <div>
                  <dt className="text-[#8A8175]">Artists:</dt>
                  <dd className="font-medium text-[#262320] mt-0.5">
                    Traditional Nathdwara Lineage Artists
                  </dd>
                </div>
              </dl>
            </div>

            {/* Artwork Description */}
            <div className="border-t border-[#E2DACD] pt-6 space-y-3">
              <h2 className="font-serif text-sm font-semibold text-[#262320]">
                Description and Iconography
              </h2>
              <div className="text-xs text-[#5C554C] leading-relaxed space-y-2 whitespace-pre-line">
                {product.description}
              </div>
            </div>

            {/* Care Instructions */}
            {product.careInstructions && (
              <div className="border-t border-[#E2DACD] pt-6 space-y-2">
                <h3 className="font-serif text-sm font-semibold text-[#262320] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#C47820]" />
                  <span>Preservation and Care</span>
                </h3>
                <p className="text-xs text-[#5C554C] leading-relaxed">
                  {product.careInstructions}
                </p>
              </div>
            )}

            {/* Shipping & Return Highlights */}
            <div className="p-4 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-3 text-xs text-[#5C554C]">
              <div className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-[#8A8175] shrink-0 mt-0.5" />
                <span>
                  Free insured dispatch on orders above Rs 5,000. Packed in reinforced wooden boxes.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#8A8175] shrink-0 mt-0.5" />
                <span>
                  Authenticity guarantee from our Nathdwara workshop with every painting.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <RotateCcw className="w-4 h-4 text-[#8A8175] shrink-0 mt-0.5" />
                <span>
                  Transit damage protection: immediate replacement or refund upon inspection.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Collector Reviews Section with Suspense Streaming Fallback */}
        <Suspense fallback={<ReviewSectionSkeleton />}>
          <ReviewSection productId={product.id} />
        </Suspense>

        {/* Related Paintings Section */}
        {relatedProducts.length > 0 && (
          <section className="space-y-6 pt-12 border-t border-[#E2DACD]">
            <div className="flex items-baseline justify-between">
              <h2 className="font-serif text-2xl font-semibold text-[#262320]">
                Related Paintings in {product.category.name}
              </h2>
              <Link
                href={`/catalog?category=${product.category.slug}`}
                className="text-xs text-[#C47820] hover:underline"
              >
                View Category
              </Link>
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
                    categoryName={p.category.name}
                    price={defaultVar ? defaultVar.price : 0}
                    mrp={defaultVar?.mrp}
                    image={pImg}
                    stock={totalStock}
                  />
                );
              })}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
