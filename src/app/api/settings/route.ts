import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst();
    return NextResponse.json({
      freeShippingThreshold: settings?.freeShippingThreshold ?? 500000,
      standardShippingCharge: settings?.standardShippingCharge ?? 25000,
      gstEnabled: settings?.gstEnabled ?? true,
      gstRatePercent: settings?.gstRatePercent ?? 12,
      codEnabled: settings?.codEnabled ?? true,
      paymentModeDisplay: settings?.paymentModeDisplay ?? 'Razorpay Secure (UPI, Cards, Netbanking)',
      announcementBarText: settings?.announcementBarText ?? null,
      announcementBarActive: settings?.announcementBarActive ?? false,
    });
  } catch (error) {
    console.error('Failed to load settings:', error);
    return NextResponse.json({
      freeShippingThreshold: 500000,
      standardShippingCharge: 25000,
      gstEnabled: true,
      gstRatePercent: 12,
      codEnabled: true,
      paymentModeDisplay: 'Razorpay Secure (UPI, Cards, Netbanking)',
      announcementBarText: null,
      announcementBarActive: false,
    });
  }
}
