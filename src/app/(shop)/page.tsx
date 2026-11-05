import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { ProductCard } from '@/components/shop/ProductCard';
import { MapPin, Phone, Clock, ArrowRight, ShieldCheck, Truck, Sparkles } from 'lucide-react';

export default async function HomePage() {
  const [featuredProducts, categories, settings] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true, status: 'ACTIVE' },
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' }, take: 1 },
        variants: { orderBy: { price: 'asc' } },
      },
      take: 6,
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.siteSettings.findFirst(),
  ]);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="border-b border-[#DEC99C] bg-[#FAF7EE] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-10 pb-12 sm:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start lg:items-center">
            {/* Left Column: Story & CTAs */}
            <div className="lg:col-span-7 space-y-5">
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#231C10] font-semibold leading-[1.12]">
                Hand painted Shreenathji art, made and framed in Nathdwara.
              </h1>
              <p className="text-sm sm:text-base text-[#4A3E2D] leading-relaxed max-w-2xl">
                Authentic Pichwai paintings, sanctum portraits, and festive utsav compositions. Every artwork is handcrafted with natural mineral pigments, 24kt gold foil, and seasoned teak wood framing by traditional lineage artists.
              </p>
              <div className="pt-1 flex flex-wrap gap-4">
                <Link href="/catalog" className="btn-primary text-sm py-3 px-6 shadow-sm">
                  Browse Paintings
                </Link>
                <Link href="/custom-order" className="btn-accent text-sm py-3 px-6 shadow-sm">
                  Commission Custom Work
                </Link>
              </div>

              {/* Heritage Bullet Points */}
              <div className="pt-4 border-t border-[#DEC99C]/60 grid grid-cols-3 gap-4 text-xs text-[#7A694F]">
                <div>
                  <p className="font-semibold text-sm text-[#231C10]">400+ Years</p>
                  <p className="text-[11px] mt-0.5">Nathdwara Art Tradition</p>
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#231C10]">Pure 24kt Gold</p>
                  <p className="text-[11px] mt-0.5">& Stone Mineral Pigments</p>
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#231C10]">Insured Transit</p>
                  <p className="text-[11px] mt-0.5">Dispatched Across India</p>
                </div>
              </div>
            </div>

            {/* Right Column: Framed Masterpiece Artwork */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group max-w-sm sm:max-w-md w-full">
                {/* Museum Style Carved Teak & Gold Mat Frame */}
                <div className="p-3 sm:p-4 bg-[#231C10] border-2 border-[#C59B27] rounded-sm shadow-2xl transition-transform duration-300 group-hover:scale-[1.01]">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xs bg-[#1C160E] border border-[#DEC99C]/60">
                    <Image
                      src="https://u3j1809ecuiuxa6g.public.blob.vercel-storage.com/artworks/shreenathji-shrine.webp"
                      alt="Jeweled Shreenathji Shrine with Lotus Offerings"
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 420px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Brass Caption Plaque */}
                  <div className="mt-3.5 text-center border-t border-[#DEC99C]/30 pt-2.5 px-2">
                    <p className="font-serif text-base font-semibold text-[#FAF2DC] tracking-wide">
                      Jeweled Shreenathji Sanctum Shrine
                    </p>
                    <p className="text-[11px] font-sans text-[#DEC99C] tracking-wider uppercase mt-0.5">
                      Natural Stone Pigments & Gold Leaf • Nathdwara
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Trust & Commitments */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8 bg-white border border-[#E8E2D8] rounded-sm shadow-sm">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#B8511B] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-serif text-sm font-semibold text-[#1C1917]">
                Traditional Nathdwara Methods
              </h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Hand painted on cotton cloth and wasli paper using natural stone colors, zinc white, and gold foil.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#B8511B] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-serif text-sm font-semibold text-[#1C1917]">
                Seasoned Teak and Gold Framing
              </h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Each artwork is framed with archival mount boards, dust backing, and hanging hardware installed.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-[#B8511B] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-serif text-sm font-semibold text-[#1C1917]">
                Insured Wooden Crate Shipping
              </h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Dispatched with multi-layer bubble wrap in reinforced timber crates across India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8E2D8] pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B8511B] font-sans font-semibold">
              Art Traditions
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1917] mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-medium text-[#1C1917] hover:text-[#B8511B] flex items-center gap-1"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalog?category=${cat.slug}`}
              className="p-5 bg-white border border-[#E8E2D8] rounded-sm hover:border-[#1C1917] hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
            >
              <div>
                <h3 className="font-serif text-lg font-semibold text-[#1C1917] group-hover:text-[#B8511B] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#57534E] mt-1 line-clamp-3 leading-relaxed">
                  {cat.description}
                </p>
              </div>
              <span className="text-[11px] text-[#B8511B] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>Explore artworks</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Paintings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8E2D8] pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B8511B] font-sans font-semibold">
              Curated Selection
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1917] mt-1">
              Featured Paintings
            </h2>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-medium text-[#1C1917] hover:text-[#B8511B] flex items-center gap-1"
          >
            <span>Explore Entire Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((p) => {
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
      </section>

      {/* About Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 sm:p-12 bg-white border border-[#E8E2D8] rounded-sm shadow-sm items-center">
          <div className="space-y-5">
            <span className="text-xs uppercase tracking-widest text-[#B8511B] font-sans font-semibold">
              Sanctum Art Heritage
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-semibold text-[#1C1917] leading-snug">
              Devotion expressed through stone pigments and gold leaf.
            </h2>
            <p className="text-sm text-[#57534E] leading-relaxed">
              Pichwai is a four-century-old devotional art form originating in Nathdwara. Originally crafted as sanctum backdrops for the shrine of Shreenathji, each painting portrays sacred seasons, utsav celebrations, and lila narratives.
            </p>
            <p className="text-sm text-[#57534E] leading-relaxed">
              Our workshop works directly with lineage artists residing in Nathdwara. We maintain strict fidelity to classical proportions, traditional iconography, and natural pigments derived from crushed stones and plants.
            </p>
            <div className="pt-2">
              <Link href="/about" className="btn-secondary text-xs py-2.5 px-5">
                Read About Our Artists and Process
              </Link>
            </div>
          </div>

          <div className="p-8 bg-[#FBF9F5] border border-[#E8E2D8] rounded-sm space-y-4">
            <h3 className="font-serif text-xl font-semibold text-[#1C1917]">
              Custom Art Commissions
            </h3>
            <p className="text-xs text-[#57534E] leading-relaxed">
              Do you require a specific sanctum size for your home temple, or a depiction of a particular festival like Annakoot or Sharad Purnima?
            </p>
            <p className="text-xs text-[#57534E] leading-relaxed">
              Our master artists can paint commissioned works tailored to your space, with customized frame finishes and temple-grade packaging.
            </p>
            <div className="pt-2">
              <Link href="/custom-order" className="btn-accent text-xs py-2.5 px-5 shadow-sm">
                Submit Commission Request
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Visit the Gallery Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-[#E8E2D8] pb-4">
          <span className="text-xs uppercase tracking-widest text-[#B8511B] font-sans font-semibold">
            Nathdwara Studio
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1917] mt-1">
            Visit Our Gallery
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8 bg-white border border-[#E8E2D8] rounded-sm shadow-sm">
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-semibold text-[#1C1917]">
              SHREENATH ART WORK
            </h3>
            <p className="text-xs text-[#57534E] leading-relaxed">
              Visitors are welcome to view finished paintings, inspect frame choices in person, and observe ongoing work.
            </p>
            <div className="space-y-3 pt-2 text-xs text-[#57534E]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#B8511B] shrink-0 mt-0.5" />
                <span>
                  {settings?.address || 'Opposite Temple Gate, Nathdwara, Rajasthan 313301'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#B8511B] shrink-0" />
                <span>
                  {settings?.openingHours || 'Monday to Sunday: 9:00 AM to 8:30 PM'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#B8511B] shrink-0" />
                <a
                  href={`tel:${settings?.phone || '9079901405'}`}
                  className="hover:text-[#B8511B] font-medium"
                >
                  {settings?.phone || '9079901405'}
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between p-6 bg-[#FBF9F5] border border-[#E8E2D8] rounded-sm space-y-4">
            <div>
              <h4 className="font-serif text-base font-semibold text-[#1C1917]">
                Directions to the Gallery
              </h4>
              <p className="text-xs text-[#57534E] mt-2 leading-relaxed">
                Located near the historic Shreenathji Temple in Nathdwara. We recommend reaching out on WhatsApp before visiting so our gallery team can guide your arrival.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://maps.google.com/?q=Nathdwara+Rajasthan+313301"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs py-2 px-4"
              >
                Open in Google Maps
              </a>
              <a
                href="https://wa.me/919079901405"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs py-2 px-4 shadow-sm"
              >
                Message on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
