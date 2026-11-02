import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | SHREENATH ART WORK',
  description:
    'Our privacy policy drafted in compliance with the Digital Personal Data Protection Act 2023 (DPDP Act).',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <div className="border-b border-[#E2DACD] pb-6 space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#8A8175] font-sans">
          Legal & Compliance
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-[#262320]">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#8A8175]">
          Last revised: November 2026. Drafted in compliance with the Digital Personal Data Protection Act 2023 (DPDP Act, India).
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-[#5C554C] leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-[#262320]">
            1. Overview and Scope
          </h2>
          <p>
            SHREENATH ART WORK ("we", "our", or "gallery"), operating from Nathdwara, Rajasthan, values the privacy of every art collector and visitor. This policy explains how we collect, store, and process personal data when you browse our website, acquire paintings, or submit commission requests.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-[#262320]">
            2. Personal Data We Collect
          </h2>
          <p>We collect only data necessary to fulfill your orders and deliver sacred artworks:</p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
            <li>
              <strong>Identity and Contact Data:</strong> Name, email address, mobile phone number.
            </li>
            <li>
              <strong>Delivery Information:</strong> Physical delivery address in India, state, city, landmark, PIN code.
            </li>
            <li>
              <strong>Transaction History:</strong> Artwork purchased, size, framing selection, order number, and payment status.
            </li>
            <li>
              <strong>Communication Records:</strong> Messages submitted via contact or custom commission inquiry forms.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-[#262320]">
            3. Payment Processing Security
          </h2>
          <p>
            Online transactions are processed securely through payment gateway infrastructure (Razorpay). SHREENATH ART WORK does not store or process your complete credit card numbers, debit card numbers, UPI MPIN, or netbanking passwords. All payment authorization occurs on PCI-DSS certified gateway environments.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-[#262320]">
            4. Cookies and Session State
          </h2>
          <p>
            We use only essential functional cookies required to maintain your active shopping cart, remember your session when logged in, and secure checkout forms against CSRF attacks. We do not use third-party behavioral advertising cookies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-[#262320]">
            5. Your Rights Under the DPDP Act 2023
          </h2>
          <p>
            In accordance with the Digital Personal Data Protection Act 2023, you have the following rights regarding your personal data:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
            <li>
              <strong>Right to Access:</strong> You may request a summary of the personal data we hold about you.
            </li>
            <li>
              <strong>Right to Correction and Erasure:</strong> You may request correction of inaccurate address details or deletion of your customer account.
            </li>
            <li>
              <strong>Right of Grievance Redressal:</strong> You have the right to register concerns with our designated Grievance Officer.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-[#262320]">
            6. Data Retention
          </h2>
          <p>
            We retain invoice and order transaction records as required by Indian taxation and GST regulations. Marketing dispatch subscriptions can be opted out at any time upon request.
          </p>
        </section>

        <section className="space-y-3 p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm">
          <h2 className="font-serif text-xl font-semibold text-[#262320]">
            7. Grievance Officer Contact
          </h2>
          <p>
            For any queries, requests for data correction, or privacy grievances, please contact our Grievance Officer:
          </p>
          <div className="mt-2 text-xs space-y-1 text-[#262320]">
            <p><strong>Designation:</strong> Grievance Officer, SHREENATH ART WORK</p>
            <p><strong>Address:</strong> Opposite Temple Gate, Nathdwara, Rajasthan 313301, India</p>
            <p><strong>Phone / WhatsApp:</strong> 9079901405</p>
            <p><strong>Email:</strong> shreenathartwork@gmail.com</p>
          </div>
        </section>
      </div>
    </div>
  );
}

