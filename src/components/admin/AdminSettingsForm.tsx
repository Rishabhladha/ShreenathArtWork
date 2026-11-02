'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, CheckCircle2, AlertCircle } from 'lucide-react';

export function AdminSettingsForm({ initialSettings }: { initialSettings: any }) {
  const router = useRouter();

  const [businessName, setBusinessName] = useState(initialSettings?.businessName || 'SHREENATH ART WORK');
  const [address, setAddress] = useState(initialSettings?.address || 'Opposite Temple Gate, Nathdwara, Rajasthan 313301');
  const [phone, setPhone] = useState(initialSettings?.phone || '9079901405');
  const [email, setEmail] = useState(initialSettings?.email || 'shreenathartwork@gmail.com');
  const [openingHours, setOpeningHours] = useState(initialSettings?.openingHours || 'Monday to Sunday: 9:00 AM to 8:30 PM');
  const [freeShippingThresholdRupees, setFreeShippingThresholdRupees] = useState(
    initialSettings?.freeShippingThreshold ? String(Math.round(initialSettings.freeShippingThreshold / 100)) : '5000'
  );
  const [standardShippingRupees, setStandardShippingRupees] = useState(
    initialSettings?.standardShippingCharge ? String(Math.round(initialSettings.standardShippingCharge / 100)) : '250'
  );
  const [gstEnabled, setGstEnabled] = useState(initialSettings?.gstEnabled ?? true);
  const [gstRatePercent, setGstRatePercent] = useState(String(initialSettings?.gstRatePercent ?? 12));
  const [codEnabled, setCodEnabled] = useState(initialSettings?.codEnabled ?? true);
  const [paymentModeDisplay, setPaymentModeDisplay] = useState(
    initialSettings?.paymentModeDisplay || 'Razorpay Secure (UPI, Cards, Netbanking)'
  );
  const [announcementBarActive, setAnnouncementBarActive] = useState(initialSettings?.announcementBarActive ?? true);
  const [announcementBarText, setAnnouncementBarText] = useState(
    initialSettings?.announcementBarText || 'Free insured delivery across India on all paintings above Rs 5,000.'
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          address,
          phone,
          email,
          openingHours,
          freeShippingThreshold: parseInt(freeShippingThresholdRupees, 10) * 100,
          standardShippingCharge: parseInt(standardShippingRupees, 10) * 100,
          gstEnabled,
          gstRatePercent: parseInt(gstRatePercent, 10),
          codEnabled,
          paymentModeDisplay,
          announcementBarActive,
          announcementBarText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update settings');

      setMessage('Settings updated successfully.');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      {message && (
        <div className="p-3 bg-[#EAE2D5] border border-[#D1C6B4] rounded-sm text-xs text-[#2A5C38] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-[#FAF0F0] border border-[#D9B5B5] rounded-sm text-xs text-[#8C2B2B] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Business & Physical Gallery Information */}
      <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-4">
        <h2 className="font-serif text-base font-semibold text-[#262320]">
          Gallery & Contact Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[#5C554C]">Business Name</label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#FAF6EF] border border-[#E2DACD] rounded-sm text-[#262320]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[#5C554C]">Phone / WhatsApp</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#FAF6EF] border border-[#E2DACD] rounded-sm text-[#262320]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[#5C554C]">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#FAF6EF] border border-[#E2DACD] rounded-sm text-[#262320]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[#5C554C]">Opening Hours</label>
            <input
              type="text"
              required
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#FAF6EF] border border-[#E2DACD] rounded-sm text-[#262320]"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="block text-[#5C554C]">Physical Address in Nathdwara</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#FAF6EF] border border-[#E2DACD] rounded-sm text-[#262320]"
            />
          </div>
        </div>
      </div>

      {/* Shipping & Delivery Configuration */}
      <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-4">
        <h2 className="font-serif text-base font-semibold text-[#262320]">
          Insured Shipping Rates & Rules
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[#5C554C]">Standard Shipping Fee (INR)</label>
            <input
              type="number"
              required
              value={standardShippingRupees}
              onChange={(e) => setStandardShippingRupees(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#FAF6EF] border border-[#E2DACD] rounded-sm text-[#262320]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[#5C554C]">Free Shipping Threshold (INR)</label>
            <input
              type="number"
              required
              value={freeShippingThresholdRupees}
              onChange={(e) => setFreeShippingThresholdRupees(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#FAF6EF] border border-[#E2DACD] rounded-sm text-[#262320]"
            />
          </div>
        </div>
      </div>

      {/* Taxes & Payment Methods */}
      <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-4">
        <h2 className="font-serif text-base font-semibold text-[#262320]">
          GST & Payment Methods
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={gstEnabled}
                onChange={(e) => setGstEnabled(e.target.checked)}
                className="rounded-sm"
              />
              <span className="font-medium text-[#262320]">Enable GST Calculation</span>
            </label>
            <div className="space-y-1">
              <label className="block text-[#5C554C]">GST Rate Percentage (%)</label>
              <input
                type="number"
                value={gstRatePercent}
                onChange={(e) => setGstRatePercent(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#FAF6EF] border border-[#E2DACD] rounded-sm text-[#262320]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={codEnabled}
                onChange={(e) => setCodEnabled(e.target.checked)}
                className="rounded-sm"
              />
              <span className="font-medium text-[#262320]">Allow Cash on Delivery (COD)</span>
            </label>
            <div className="space-y-1">
              <label className="block text-[#5C554C]">Payment Mode Label</label>
              <input
                type="text"
                value={paymentModeDisplay}
                onChange={(e) => setPaymentModeDisplay(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#FAF6EF] border border-[#E2DACD] rounded-sm text-[#262320]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Announcement Bar */}
      <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-4">
        <h2 className="font-serif text-base font-semibold text-[#262320]">
          Announcement Banner
        </h2>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={announcementBarActive}
            onChange={(e) => setAnnouncementBarActive(e.target.checked)}
            className="rounded-sm"
          />
          <span className="font-medium text-[#262320]">Show Top Announcement Bar</span>
        </label>

        <div className="space-y-1">
          <label className="block text-[#5C554C]">Announcement Copy</label>
          <input
            type="text"
            value={announcementBarText}
            onChange={(e) => setAnnouncementBarText(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-[#FAF6EF] border border-[#E2DACD] rounded-sm text-[#262320]"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary text-xs py-3 px-6 flex items-center gap-2 disabled:opacity-60"
      >
        <Save className="w-4 h-4" />
        <span>{loading ? 'Saving...' : 'Save Settings'}</span>
      </button>
    </form>
  );
}

