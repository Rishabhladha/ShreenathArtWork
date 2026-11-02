import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Frequently Asked Questions | SHREENATH ART WORK',
  description:
    'Answers to common questions regarding our authentic Nathdwara paintings, framing choices, shipping transit, and commissions.',
};

const FAQS = [
  {
    question: 'Are these authentic hand painted artworks from Nathdwara?',
    answer:
      'Yes. Every original painting is created in our Nathdwara workshop by traditional lineage artists. We use authentic stone pigments, pure gold and silver leaf, and handspun cotton or wasli paper. We also offer fine art archival canvas prints of select historical masterworks.',
  },
  {
    question: 'How are framed paintings packaged to prevent transit damage?',
    answer:
      'We pack each framed painting with archival moisture barriers, thick edge corner guards, heavy shock-absorbing bubble wrap, and an exterior reinforced wooden crate. Our parcels are fully insured for transit across India.',
  },
  {
    question: 'What if a painting arrives damaged?',
    answer:
      'In the rare event of transit damage, notify us within 48 hours of delivery with photos of the package and artwork. We will arrange an immediate replacement or full refund without delay.',
  },
  {
    question: 'What wood is used for the framing?',
    answer:
      'We use naturally seasoned Indian teak wood and rosewood finish frames. Our frames include protective acrylic glass (lighter and safer for courier transit than standard plate glass), archival mount boards, and sealed backboards to protect against humidity.',
  },
  {
    question: 'Can I order a custom size or festival theme?',
    answer:
      'Yes. We regularly create made-to-order commissions for home altars, sanctums, and living spaces. You can submit your desired dimensions and festival themes via our Custom Order page.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We support online payments via UPI (Google Pay, PhonePe, Paytm, BHIM), Credit and Debit Cards (Visa, Mastercard, RuPay), and Netbanking through Razorpay. Cash on Delivery (COD) is also available across serviceable PIN codes in India.',
  },
  {
    question: 'How long does shipping take within India?',
    answer:
      'Ready-to-ship paintings are dispatched within 2 to 3 business days. Courier transit takes approximately 4 to 7 business days depending on your destination city. Custom commissioned paintings require 2 to 4 weeks for creation and drying.',
  },
];

export default function FAQPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <div className="border-b border-[#E2DACD] pb-6 space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#8A8175] font-sans">
          Collector Assistance
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-[#262320]">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-[#5C554C] leading-relaxed">
          Detailed information regarding our artworks, framing, insured delivery, and care.
        </p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, idx) => (
          <div
            key={idx}
            className="p-5 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-2"
          >
            <h2 className="font-serif text-base font-semibold text-[#262320]">
              {faq.question}
            </h2>
            <p className="text-xs text-[#5C554C] leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>

      <div className="p-6 bg-[#F4EFE6] border border-[#E2DACD] rounded-sm space-y-3">
        <h3 className="font-serif text-base font-semibold text-[#262320]">
          Still have questions?
        </h3>
        <p className="text-xs text-[#5C554C] leading-relaxed">
          Our gallery team in Nathdwara is available to answer any questions regarding deity iconography or framing choices.
        </p>
        <div className="pt-1 flex flex-wrap gap-3">
          <Link href="/contact" className="btn-primary text-xs py-2 px-4">
            Contact Gallery
          </Link>
          <a
            href="https://wa.me/919079901405"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs py-2 px-4"
          >
            WhatsApp 9079901405
          </a>
        </div>
      </div>
    </div>
  );
}

