import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { ProductCard } from '@/components/shop/ProductCard';
import { PATHS } from '@/lib/paths';
import { MapPin, Phone, Clock, ArrowRight, ShieldCheck, Truck, Sparkles, CheckCircle2 } from 'lucide-react';

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-16 pb-12 sm:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left Column: Story & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#DEC99C] rounded-full text-xs font-medium text-[#231C10] shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
                <span>Nathdwara Temple Shringaar & Pichwai Lineage</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#231C10] font-semibold leading-[1.12]">
                Hand painted Shreenathji art, crafted and framed in Nathdwara.
              </h1>
              
              <p className="text-sm sm:text-base text-[#4A3E2D] leading-relaxed max-w-2xl">
                Authentic Pichwai paintings, sanctum portraits, and festive utsav compositions. Every artwork is handcrafted with natural mineral pigments, 24kt gold foil, and seasoned teak wood framing by traditional lineage artists.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3.5">
                <Link href={PATHS.catalog()} className="btn-primary text-sm py-3 px-6 shadow-sm min-h-[48px]">
                  Browse Sacred Paintings
                </Link>
                <Link href={PATHS.customOrder} className="btn-accent text-sm py-3 px-6 shadow-sm min-h-[48px]">
                  Commission Custom Sanctum Work
                </Link>
              </div>

              {/* Heritage Bullet Points - Responsive grid */}
              <div className="pt-6 border-t border-[#DEC99C]/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#7A694F]">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-[#231C10]">400+ Years</p>
                    <p className="text-[11px] mt-0.5">Nathdwara Art Tradition</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-[#231C10]">100% Genuine</p>
                    <p className="text-[11px] mt-0.5">Mineral & Stone Pigments</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-[#231C10]">Safe Delivery</p>
                    <p className="text-[11px] mt-0.5">Insured Wooden Box Transit</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Artwork Showcase */}
            <div className="lg:col-span-5 relative w-full aspect-[4/5] max-w-md mx-auto lg:max-w-none rounded-xs overflow-hidden border-2 border-[#DEC99C] shadow-[0_16px_40px_rgba(35,28,16,0.12)] bg-[#231C10]">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hero-shreenathji-shrine.webp"
                alt="Sacred Shreenathji shrine sanctum portrait hand painted with natural mineral pigments and real gold foil"
                fill
                priority={true}
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-[#231C10]/95 via-[#231C10]/70 to-transparent text-[#FAF7EE]">
                <p className="text-[10px] tracking-widest uppercase text-[#C59B27] font-sans font-semibold">
                  Original Sanctum Artwork
                </p>
                <p className="font-serif text-base font-semibold mt-0.5">
                  Shreenathji Manorath Shringaar with Lotus Pond
                </p>
                <p className="text-xs text-[#DEC99C] mt-0.5">
                  Pichwai on Handspun Cotton, Antique Teak Framing
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Craft Standards Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 sm:p-8 bg-white border border-[#DEC99C] rounded-xs shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xs bg-[#FAF7EE] border border-[#DEC99C] flex items-center justify-center text-[#B8860B] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-semibold text-[#231C10]">
                Natural Stone Pigments
              </h3>
              <p className="text-xs text-[#7A694F] mt-1 leading-relaxed">
                Hand-ground mineral colors, lapis lazuli, turmeric yellow, and genuine 24-karat gold leaf work.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xs bg-[#FAF7EE] border border-[#DEC99C] flex items-center justify-center text-[#B8860B] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-semibold text-[#231C10]">
                Insured Crating & Dispatch
              </h3>
              <p className="text-xs text-[#7A694F] mt-1 leading-relaxed">
                Shipped in reinforced moisture-sealed wooden boxes across India and internationally.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xs bg-[#FAF7EE] border border-[#DEC99C] flex items-center justify-center text-[#B8860B] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-semibold text-[#231C10]">
                Certificate of Authenticity
              </h3>
              <p className="text-xs text-[#7A694F] mt-1 leading-relaxed">
                Every original Pichwai includes provenance details signed by the artisan family in Nathdwara.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xs bg-[#FAF7EE] border border-[#DEC99C] flex items-center justify-center text-[#B8860B] shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-semibold text-[#231C10]">
                Custom Sizes on Request
              </h3>
              <p className="text-xs text-[#7A694F] mt-1 leading-relaxed">
                Tailored dimensions to fit your home sanctum, pooja room, or gallery wall.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#DEC99C] pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B8860B] font-sans font-semibold">
              Curated Collections
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#231C10] mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            href={PATHS.catalog()}
            className="text-xs font-semibold text-[#231C10] hover:text-[#B8860B] flex items-center gap-1.5 py-1 min-h-[44px] sm:min-h-0"
          >
            <span>View All Collections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={PATHS.category(cat.slug)}
              className="p-5 bg-white border border-[#DEC99C] rounded-xs hover:border-[#B8860B] hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
            >
              <div>
                <h3 className="font-serif text-lg font-semibold text-[#231C10] group-hover:text-[#B8860B] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#7A694F] mt-1 line-clamp-3 leading-relaxed">
                  {cat.description}
                </p>
              </div>
              <span className="text-[11px] text-[#B8860B] font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform pt-1">
                <span>Explore artworks</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Paintings Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#DEC99C] pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B8860B] font-sans font-semibold">
              Curated Selection
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#231C10] mt-1">
              Featured Paintings
            </h2>
          </div>
          <Link
            href={PATHS.catalog()}
            className="text-xs font-semibold text-[#231C10] hover:text-[#B8860B] flex items-center gap-1.5 py-1 min-h-[44px] sm:min-h-0"
          >
            <span>Explore Entire Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <p className="text-xs text-[#7A694F] italic py-10 text-center bg-white border border-[#DEC99C] rounded-xs">
            Featured artworks are currently being updated by the curator.
          </p>
        ) : (
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
      </section>

      {/* Workshop & Heritage Story Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white border border-[#DEC99C] rounded-xs p-6 sm:p-10 lg:p-12 shadow-xs">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#B8860B] font-sans font-semibold">
              The Nathdwara Tradition
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#231C10]">
              Devotion expressed through stone pigments and gold leaf.
            </h2>
            <p className="text-sm text-[#4A3E2D] leading-relaxed">
              Pichwai is a four-century-old devotional art form originating in Nathdwara. Originally crafted as sanctum backdrops for the shrine of Shreenathji, each painting portrays sacred seasons, utsav celebrations, and lila narratives.
            </p>
            <p className="text-sm text-[#4A3E2D] leading-relaxed">
              Our workshop works directly with lineage artists residing in Nathdwara. We maintain strict fidelity to classical proportions, traditional iconography, and natural pigments derived from crushed stones and plants.
            </p>
            <div className="pt-2">
              <Link href={PATHS.info.about} className="btn-secondary text-xs py-3 px-5 min-h-[44px]">
                Read About Our Artists and Process
              </Link>
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-[#FAF7EE] border border-[#DEC99C] rounded-xs space-y-4">
            <h3 className="font-serif text-xl font-semibold text-[#231C10]">
              Custom Sanctum Art Commissions
            </h3>
            <p className="text-xs text-[#4A3E2D] leading-relaxed">
              Do you require a specific sanctum size for your home temple, or a depiction of a particular festival like Annakoot or Sharad Purnima?
            </p>
            <p className="text-xs text-[#4A3E2D] leading-relaxed">
              Our master artists can paint commissioned works tailored to your space, with customized frame finishes and temple-grade packaging.
            </p>
            <div className="pt-2">
              <Link href={PATHS.customOrder} className="btn-accent text-xs py-3 px-5 shadow-sm min-h-[44px]">
                Submit Commission Request
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Visit the Gallery Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="border-b border-[#DEC99C] pb-4">
          <span className="text-xs uppercase tracking-widest text-[#B8860B] font-sans font-semibold">
            Visit Our Gallery
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#231C10] mt-1">
            Art Gallery & Framing Workshop in Nathdwara
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-[#DEC99C] rounded-xs space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xs bg-[#FAF7EE] border border-[#DEC99C] flex items-center justify-center text-[#B8860B]">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-semibold text-[#231C10]">
              Gallery Location
            </h3>
            <p className="text-xs text-[#4A3E2D] leading-relaxed">
              {settings?.address || 'Opposite Temple Gate, Nathdwara, Rajsamand District, Rajasthan 313301'}
            </p>
            <p className="text-[11px] text-[#7A694F]">
              Located steps away from the Shreenathji Temple sanctum.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#DEC99C] rounded-xs space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xs bg-[#FAF7EE] border border-[#DEC99C] flex items-center justify-center text-[#B8860B]">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-semibold text-[#231C10]">
              Phone and WhatsApp
            </h3>
            <p className="text-xs text-[#4A3E2D] leading-relaxed">
              Direct consultation with our gallery curator for custom sizes or temple requirements.
            </p>
            <p className="text-xs font-semibold text-[#231C10]">
              <a
                href={`tel:${settings?.phone || '9079901405'}`}
                className="hover:text-[#B8860B] transition-colors inline-block py-1"
              >
                {settings?.phone || '+91 9079901405'}
              </a>
            </p>
          </div>

          <div className="p-6 bg-white border border-[#DEC99C] rounded-xs space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xs bg-[#FAF7EE] border border-[#DEC99C] flex items-center justify-center text-[#B8860B]">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-semibold text-[#231C10]">
              Visiting Hours
            </h3>
            <p className="text-xs text-[#4A3E2D] leading-relaxed">
              {settings?.openingHours || 'Monday to Sunday: 9:00 AM to 8:30 PM (Darshan timings)'}
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              <a
                href="https://maps.google.com/?q=Nathdwara+Rajasthan+313301"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-[11px] py-2 px-3.5 min-h-[44px]"
              >
                Directions
              </a>
              <a
                href="https://wa.me/919079901405"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-[11px] py-2 px-3.5 min-h-[44px]"
              >
                WhatsApp Chat
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
