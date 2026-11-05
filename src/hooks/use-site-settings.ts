'use client';

import { create } from 'zustand';

export interface PublicSettings {
  freeShippingThreshold: number;
  standardShippingCharge: number;
  gstEnabled: boolean;
  gstRatePercent: number;
  codEnabled: boolean;
  paymentModeDisplay: string;
  announcementBarText: string | null;
  announcementBarActive: boolean;
  loaded: boolean;
}

const DEFAULT_SETTINGS: PublicSettings = {
  freeShippingThreshold: 500000,
  standardShippingCharge: 25000,
  gstEnabled: true,
  gstRatePercent: 12,
  codEnabled: true,
  paymentModeDisplay: 'Razorpay Secure (UPI, Cards, Netbanking)',
  announcementBarText: null,
  announcementBarActive: false,
  loaded: false,
};

export const useSiteSettings = create<
  PublicSettings & {
    fetchSettings: (force?: boolean) => Promise<void>;
  }
>((set, get) => ({
  ...DEFAULT_SETTINGS,
  fetchSettings: async (force?: boolean) => {
    if (get().loaded && !force) return;
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        set({ ...data, loaded: true });
      }
    } catch {
      // Keep defaults
    }
  },
}));
