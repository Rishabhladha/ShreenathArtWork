import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms and Conditions | SHREENATH ART WORK',
  description:
    'Terms and conditions governing purchases, framing, intellectual property, and orders from SHREENATH ART WORK, Nathdwara.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <div className="border-b border-[#E2DACD] pb-6 space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#8A8175] font-sans">
          Legal Agreement
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-[#262320]">
          Terms and Conditions
        </h1>
        <p className="text-xs text-[#8A8175]">
          Governing law: Republic of India. Exclusive legal jurisdiction: Nathdwara, Rajasthan.
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-[#5C554C] leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-[#262320]">
            1. Agreement and Identity
          </h2>
          <p>
            These Terms and Conditions govern all orders, purchases, and communications made with SHREENATH ART WORK ("we", "us", "gallery"), located at Opposite Temple Gate, Nathdwara, Rajasthan 313301. By placing an order, you agree to these terms in full.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-[#262320]">
            2. Orders, Authenticity and Handcrafted Nature
          </h2>
          <p>
            All original Pichwai paintings and devotional portraits sold through our catalog are handcrafted works of traditional art. Because our artisans use natural minerals, vegetable pigments, and pure gold foil, slight variations in color intensity, gold sheen, and line work are inherent to traditional manual painting and do not constitute defects.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-[#262320]">
            3. Pricing and GST
          </h2>
          <p>
            All prices are stated in Indian Rupees (INR) and are inclusive of applicable goods and services tax (GST). Shipping charges are clearly detailed at checkout. We reserve the right to correct typographical pricing errors before order fulfillment.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-[#262320]">
            4. Payment and Order Acceptance
          </h2>
          <p>
            Orders placed via Razorpay online payment are confirmed once payment authorization is verified by our servers. Cash on Delivery (COD) orders are confirmed via telephone or WhatsApp verification prior to wooden crate dispatch.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-[#262320]">
            5. Intellectual Property
          </h2>
          <p>
            The physical artwork purchased becomes the property of the collector. All copyright, reproduction rights, and intellectual property rights in the artwork compositions, photographs, and website content remain with SHREENATH ART WORK and the respective master artists. No painting may be mechanically reproduced or commercially redistributed without written authorization.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-[#262320]">
            6. Limitation of Liability
          </h2>
          <p>
            In all circumstances, our maximum aggregate liability arising from any order, whether in contract, tort, or warranty, shall not exceed the actual purchase price paid by the customer for that order.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-[#262320]">
            7. Governing Law and Jurisdiction
          </h2>
          <p>
            These terms are governed by the laws of India. Any legal dispute, claim, or proceeding arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in Nathdwara, Rajasthan.
          </p>
        </section>
      </div>
    </div>
  );
}

