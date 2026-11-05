import React from 'react';
import Link from 'next/link';
import { MapPin, Sparkles, ShieldCheck, Palette, HeartHandshake } from 'lucide-react';

export const metadata = {
  title: 'Our Heritage and Process | SHREENATH ART WORK',
  description:
    'Learn about our traditional devotional art workshop in Nathdwara, the history of Pichwai paintings, and our natural stone pigments.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="border-b border-[#E2DACD] pb-6 space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#8A8175] font-sans">
          Nathdwara Art Tradition
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-[#262320]">
          About SHREENATH ART WORK
        </h1>
        <p className="text-sm text-[#5C554C] leading-relaxed">
          Devotional art gallery and traditional framing studio located opposite the temple gates in Nathdwara, Rajasthan.
        </p>
      </div>

      {/* Story of the Gallery */}
      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold text-[#262320]">
          The Sacred Tradition of Pichwai
        </h2>
        <div className="space-y-3 text-xs sm:text-sm text-[#5C554C] leading-relaxed">
          <p>
            The town of Nathdwara was established in the seventeenth century when the sacred deity of Shreenathji was brought from Mount Govardhan to Mewar. Along with the shrine came master craftsmen, sculptors, and painters whose devotional service was to create textile backdrops known as Pichwai (literally, &quot;that which hangs behind&quot;).
          </p>
          <p>
            For generations, families in Nathdwara have preserved this sacred art. SHREENATH ART WORK was founded to provide collectors across India direct access to authentic devotional paintings without intermediaries, maintaining traditional techniques and fair remuneration for artists.
          </p>
        </div>
      </section>

      {/* Materials and Process Grid */}
      <section className="space-y-6 pt-4 border-t border-[#E2DACD]">
        <h2 className="font-serif text-2xl font-semibold text-[#262320]">
          Materials and Techniques
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-5 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-2">
            <Palette className="w-5 h-5 text-[#C47820]" />
            <h3 className="font-serif text-base font-semibold text-[#262320]">
              Crushed Stone Pigments
            </h3>
            <p className="text-xs text-[#5C554C] leading-relaxed">
              We use natural mineral colors ground from semi-precious stones, lapis lazuli, malachite, cinnabar, and zinc white mixed with natural tree gum (babool gond).
            </p>
          </div>

          <div className="p-5 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-2">
            <Sparkles className="w-5 h-5 text-[#C47820]" />
            <h3 className="font-serif text-base font-semibold text-[#262320]">
              Gold and Silver Foil
            </h3>
            <p className="text-xs text-[#5C554C] leading-relaxed">
              Intricate jewelry, crowns, and sanctum ornaments are highlighted using pure gold dust (hilkari) and gold leaf burnished with agate stone tools.
            </p>
          </div>

          <div className="p-5 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-2">
            <ShieldCheck className="w-5 h-5 text-[#C47820]" />
            <h3 className="font-serif text-base font-semibold text-[#262320]">
              Handspun Cotton and Wasli Paper
            </h3>
            <p className="text-xs text-[#5C554C] leading-relaxed">
              Paintings are created on heavy handspun cotton starched with rice water and burnished smooth, or layered wasli paper made with traditional deckle techniques.
            </p>
          </div>

          <div className="p-5 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-2">
            <HeartHandshake className="w-5 h-5 text-[#C47820]" />
            <h3 className="font-serif text-base font-semibold text-[#262320]">
              Lineage Artisans
            </h3>
            <p className="text-xs text-[#5C554C] leading-relaxed">
              Every piece is painted by Nathdwara artists who have inherited their brushwork and knowledge of temple iconography from their ancestors.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Address & Visit */}
      <section className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-4">
        <h2 className="font-serif text-xl font-semibold text-[#262320]">
          Visit Our Workshop in Nathdwara
        </h2>
        <p className="text-xs text-[#5C554C] leading-relaxed">
          Visitors to Nathdwara are welcome to visit our gallery space to view works in progress, inspect wood framing samples, and meet the artisans.
        </p>
        <div className="text-xs text-[#5C554C] space-y-1">
          <p className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#8A8175]" />
            <span>Opposite Temple Gate, Nathdwara, Rajasthan 313301</span>
          </p>
          <p>Phone / WhatsApp: 9079901405</p>
        </div>
        <div className="pt-2">
          <Link href="/contact" className="btn-secondary text-xs py-2 px-4">
            Contact the Gallery
          </Link>
        </div>
      </section>
    </div>
  );
}

