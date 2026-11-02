import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Shipping and Safe Packaging Policy | SHREENATH ART WORK',
  description:
    'Information regarding our domestic transit across India, wooden crate packaging, and damage replacement policy.',
};

export default function ShippingReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <div className="border-b border-[#E2DACD] pb-6 space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#8A8175] font-sans">
          Logistics and Protection
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-[#262320]">
          Shipping and Returns Policy
        </h1>
        <p className="text-sm text-[#5C554C] leading-relaxed">
          How we carefully prepare, crate, and safely deliver sacred artworks across India.
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-[#5C554C] leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-[#262320]">
            1. Domestic Shipping Coverage and Timelines
          </h2>
          <p>
            SHREENATH ART WORK delivers to all serviceable PIN codes throughout India.
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
            <li>
              <strong>Ready to ship framed paintings:</strong> Dispatched within 2 to 3 business days from Nathdwara.
            </li>
            <li>
              <strong>Transit duration:</strong> Typically 4 to 7 business days depending on state and city distance.
            </li>
            <li>
              <strong>Custom commissions:</strong> Artwork execution takes 2 to 4 weeks, followed by standard transit.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-[#262320]">
            2. Insured Wooden Crate Packaging
          </h2>
          <p>
            Because devotional paintings with glass or acrylic framing require delicate handling, every parcel goes through multi-stage packaging:
          </p>
          <ol className="list-decimal list-inside space-y-1 pl-2 text-xs">
            <li>First layer: Acid-free tissue paper covering the paint and gold foil.</li>
            <li>Second layer: Moisture barrier polyethylene wrap.</li>
            <li>Third layer: High-density thermocol corner protectors and multi-layer bubble cushioning.</li>
            <li>Outer layer: Solid timber reinforced wooden crate labeled with fragile art notices.</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-[#262320]">
            3. Shipping Charges
          </h2>
          <p>
            Standard insured shipping is charged at Rs 250 per order. All orders with total artwork value of Rs 5,000 and above qualify for <strong>Free Insured Shipping</strong> anywhere in India.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-[#262320]">
            4. Damaged Transit Replacement and Return Policy
          </h2>
          <p>
            Each parcel is fully insured. If your package shows severe exterior damage upon delivery, or if upon unpacking the frame or artwork is damaged, please follow these steps:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
            <li>
              Notify us within 48 hours of receipt via WhatsApp at 9079901405 or email at shreenathartwork@gmail.com.
            </li>
            <li>
              Provide clear photographs of the damaged packaging and the artwork.
            </li>
            <li>
              We will promptly arrange reverse courier pickup and initiate an immediate replacement or full refund to your original payment method.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-[#262320]">
            5. Handcrafted Nature Disclaimer
          </h2>
          <p>
            As each original painting is hand painted using natural stone colors, subtle variations in brushwork, pigment tone, and gold leaf texture are natural hallmarks of authentic craftsmanship.
          </p>
        </section>
      </div>
    </div>
  );
}

