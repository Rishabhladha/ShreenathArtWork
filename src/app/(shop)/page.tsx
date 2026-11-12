import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { ProductCard } from '@/components/shop/ProductCard';
import { PATHS } from '@/lib/paths';
import { MapPin, Phone, Clock, ArrowRight, ShieldCheck, Truck, Sparkles, CheckCircle2, Award } from 'lucide-react';

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
    <div className="space-y-16 sm:space-y-24 pb-16 bg-[#FAF6EF]">
      {/* Royal Mewar Chiaroscuro Hero Section */}
      <section className="bg-[#12100E] text-[#FAF6EF] border-b border-[#C5A059]/40 relative overflow-hidden">
        {/* Subtle royal background radial aura */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#C5A059]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-[#8B1E1E]/12 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 lg:pt-20 pb-16 sm:pb-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Sanctum Story & Regal CTAs */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-7">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-[#1A1714] border border-[#C5A059]/50 rounded-full text-xs font-medium text-[#DFBE72] shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#DFBE72]" />
                <span className="tracking-wider uppercase text-[10px] sm:text-[11px] font-semibold">
                  Mewar Royal Heritage • Pushtimarg Haveli Art Tradition
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#FAF6EF] font-semibold leading-[1.1] tracking-tight">
                Sacred Shreenathji Pichwai, handcrafted in Nathdwara.
              </h1>
              
              <p className="text-sm sm:text-base text-[#FAF6EF]/85 leading-relaxed max-w-2xl font-light">
                Authentic temple Pichwai paintings, sanctum portraits, and festival compositions. Every artwork is handcrafted with natural stone and mineral pigments, genuine 24kt gold foil (Varak), and seasoned teak wood framing by lineage artists in Rajasthan.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3.5">
                <Link href={PATHS.catalog()} className="btn-accent text-sm py-3 px-7 shadow-lg min-h-[48px] tracking-wide">
                  Explore Sacred Masterpieces
                </Link>
                <Link href={PATHS.customOrder} className="btn-primary text-sm py-3 px-7 shadow-lg min-h-[48px] tracking-wide bg-[#1A1714] hover:bg-[#221E1A] border-[#C5A059]">
                  Commission Custom Sanctum Art
                </Link>
              </div>

              {/* Heritage Bullet Points - Responsive grid */}
              <div className="pt-6 border-t border-[#C5A059]/25 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#FAF6EF]/80">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#DFBE72] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-serif font-bold text-sm text-[#FAF6EF]">400+ Years</p>
                    <p className="text-[11px] text-[#FAF6EF]/70 mt-0.5">Nathdwara Haveli Lineage</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#DFBE72] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-serif font-bold text-sm text-[#FAF6EF]">24kt Gold Varak</p>
                    <p className="text-[11px] text-[#FAF6EF]/70 mt-0.5">Real Gold & Stone Colors</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#DFBE72] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-serif font-bold text-sm text-[#FAF6EF]">Wooden Crate Transit</p>
                    <p className="text-[11px] text-[#FAF6EF]/70 mt-0.5">Insured Pan-India & Global</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Artwork Showcase in Royal Frame */}
            <div className="lg:col-span-5 relative w-full aspect-[4/5] max-w-md mx-auto lg:max-w-none rounded-xs overflow-hidden border-2 border-[#C5A059] shadow-[0_24px_50px_rgba(0,0,0,0.6)] bg-[#1A1714]">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hero-shreenathji-shrine.webp"
                alt="Sacred Shreenathji shrine sanctum portrait hand painted with natural mineral pigments and real gold foil"
                fill
                priority={true}
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-[#12100E] via-[#12100E]/80 to-transparent text-[#FAF6EF]">
                <div className="flex items-center gap-1.5 text-[#DFBE72] text-[10px] tracking-widest uppercase font-semibold">
                  <Award className="w-3.5 h-3.5" />
                  <span>Nathdwara Masterwork</span>
                </div>
                <p className="font-serif text-lg font-semibold mt-1">
                  Shreenathji Manorath Shringaar with Lotus Pond
                </p>
                <p className="text-xs text-[#FAF6EF]/75 mt-0.5 font-light">
                  Natural Mineral Pigments & 24kt Gold Leaf on Handspun Cotton
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Craft Standards Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 sm:p-8 bg-white border border-[#E5D7BF] rounded-xs shadow-[0_4px_20px_rgba(18,16,14,0.04)]">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xs bg-[#12100E] border border-[#C5A059]/40 flex items-center justify-center text-[#DFBE72] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-semibold text-[#12100E]">
                Natural Stone Pigments
              </h3>
              <p className="text-xs text-[#82776A] mt-1 leading-relaxed">
                Crushed lapis lazuli, turmeric yellow, real malachite, and genuine 24-karat gold foil.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xs bg-[#12100E] border border-[#C5A059]/40 flex items-center justify-center text-[#DFBE72] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-semibold text-[#12100E]">
                Insured Crating & Transit
              </h3>
              <p className="text-xs text-[#82776A] mt-1 leading-relaxed">
                Custom moisture-sealed wooden boxes crafted for museum-level protection across India and abroad.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xs bg-[#12100E] border border-[#C5A059]/40 flex items-center justify-center text-[#DFBE72] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-semibold text-[#12100E]">
                Certificate of Authenticity
              </h3>
              <p className="text-xs text-[#82776A] mt-1 leading-relaxed">
                Each painting arrives with an official provenance seal signed by lineage artists in Nathdwara.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xs bg-[#12100E] border border-[#C5A059]/40 flex items-center justify-center text-[#DFBE72] shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-semibold text-[#12100E]">
                Custom Sanctum Sizing
              </h3>
              <p className="text-xs text-[#82776A] mt-1 leading-relaxed">
                Tailored dimensions customized for your home temple altar, pooja room, or private collection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Collections Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E5D7BF] pb-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-sans font-semibold">
              Curated Collections
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#12100E] mt-1">
              Shop by Painting Category
            </h2>
          </div>
          <Link
            href={PATHS.catalog()}
            className="text-xs font-semibold text-[#8B1E1E] hover:text-[#731818] flex items-center gap-1.5 py-1 min-h-[44px] sm:min-h-0"
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
              className="p-5 bg-white border border-[#E5D7BF] rounded-xs hover:border-[#C5A059] hover:shadow-lg transition-all flex flex-col justify-between space-y-3 group"
            >
              <div>
                <h3 className="font-serif text-lg font-semibold text-[#12100E] group-hover:text-[#8B1E1E] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#82776A] mt-1 line-clamp-3 leading-relaxed">
                  {cat.description}
                </p>
              </div>
              <span className="text-[11px] text-[#C5A059] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform pt-1">
                <span>Explore artworks</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Masterpieces Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E5D7BF] pb-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-sans font-semibold">
              Curated Masterpieces
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#12100E] mt-1">
              Featured Sanctum Paintings
            </h2>
          </div>
          <Link
            href={PATHS.catalog()}
            className="text-xs font-semibold text-[#8B1E1E] hover:text-[#731818] flex items-center gap-1.5 py-1 min-h-[44px] sm:min-h-0"
          >
            <span>Explore Entire Gallery Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <p className="text-xs text-[#82776A] italic py-10 text-center bg-white border border-[#E5D7BF] rounded-xs">
            Featured artworks are currently being prepared by our Nathdwara workshop curators.
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#12100E] text-[#FAF6EF] border border-[#C5A059]/40 rounded-xs p-6 sm:p-10 lg:p-12 shadow-xl">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-[0.25em] text-[#DFBE72] font-sans font-semibold">
              The 400-Year Nathdwara Tradition
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#FAF6EF] leading-snug">
              Devotion expressed through crushed stone pigments and pure 24kt gold leaf.
            </h2>
            <p className="text-sm text-[#FAF6EF]/85 leading-relaxed font-light">
              Pichwai is a classical devotional art form originating in Nathdwara during the 17th century. Created as sacred backdrops behind the deity Shreenathji in the Shrinathji Haveli, each painting captures holy seasons, Annakoot, Sharad Purnima, and cowherd leela narratives.
            </p>
            <p className="text-sm text-[#FAF6EF]/85 leading-relaxed font-light">
              Our studio works directly with traditional lineage artisan families residing in Nathdwara. We maintain absolute fidelity to classical iconography, natural squirrel-hair brush precision, and authentic gold varak gilding.
            </p>
            <div className="pt-2">
              <Link href={PATHS.info.about} className="btn-primary text-xs py-3 px-5 min-h-[44px] bg-[#1A1714] border-[#C5A059] text-[#FAF6EF] hover:bg-[#221E1A]">
                Explore Our Artisan Lineage & Craft Process
              </Link>
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-[#1A1714] border border-[#C5A059]/40 rounded-xs space-y-4">
            <h3 className="font-serif text-xl font-semibold text-[#DFBE72]">
              Commission Custom Temple Works
            </h3>
            <p className="text-xs text-[#FAF6EF]/80 leading-relaxed font-light">
              Do you require an exact sanctum dimension for your home temple, or a depiction of a particular festival like Janmashtami, Kamal Talai, or Gopashtami?
            </p>
            <p className="text-xs text-[#FAF6EF]/80 leading-relaxed font-light">
              Our master artists can paint custom commissioned works tailored to your space, with customized frame finishes and museum-grade wooden crating.
            </p>
            <div className="pt-2">
              <Link href={PATHS.customOrder} className="btn-accent text-xs py-3 px-5 shadow-sm min-h-[44px]">
                Submit Commission Brief
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Visit the Gallery Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="border-b border-[#E5D7BF] pb-4">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-sans font-semibold">
            Visit Our Gallery
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#12100E] mt-1">
            Art Gallery & Framing Workshop in Nathdwara
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-[#E5D7BF] rounded-xs space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xs bg-[#12100E] border border-[#C5A059]/40 flex items-center justify-center text-[#DFBE72]">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-semibold text-[#12100E]">
              Gallery Location
            </h3>
            <p className="text-xs text-[#524B43] leading-relaxed">
              {settings?.address || 'Opposite Temple Gate, Nathdwara, Rajsamand District, Rajasthan 313301'}
            </p>
            <p className="text-[11px] text-[#82776A]">
              Located steps away from the Shreenathji Temple sanctum.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E5D7BF] rounded-xs space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xs bg-[#12100E] border border-[#C5A059]/40 flex items-center justify-center text-[#DFBE72]">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-semibold text-[#12100E]">
              Phone and WhatsApp
            </h3>
            <p className="text-xs text-[#524B43] leading-relaxed">
              Direct consultation with our gallery curator for custom sizes or temple requirements.
            </p>
            <p className="text-xs font-semibold text-[#12100E]">
              <a
                href={`tel:${settings?.phone || '9079901405'}`}
                className="hover:text-[#8B1E1E] transition-colors inline-block py-1"
              >
                {settings?.phone || '+91 9079901405'}
              </a>
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E5D7BF] rounded-xs space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xs bg-[#12100E] border border-[#C5A059]/40 flex items-center justify-center text-[#DFBE72]">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-semibold text-[#12100E]">
              Darshan Visiting Hours
            </h3>
            <p className="text-xs text-[#524B43] leading-relaxed">
              {settings?.openingHours || 'Monday to Sunday: 9:00 AM to 8:30 PM (Aligned with Temple Darshans)'}
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
                WhatsApp Consultation
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
