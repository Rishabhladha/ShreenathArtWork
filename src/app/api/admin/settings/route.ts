import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAdminSession } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function PUT(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const updateData: Prisma.SiteSettingsUpdateInput = {};
    if (body.businessName !== undefined) updateData.businessName = body.businessName;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.openingHours !== undefined) updateData.openingHours = body.openingHours;
    if (body.instagramUrl !== undefined) updateData.instagramUrl = body.instagramUrl || null;
    if (body.facebookUrl !== undefined) updateData.facebookUrl = body.facebookUrl || null;
    if (body.freeShippingThreshold !== undefined) updateData.freeShippingThreshold = parseInt(body.freeShippingThreshold, 10);
    if (body.standardShippingCharge !== undefined) updateData.standardShippingCharge = parseInt(body.standardShippingCharge, 10);
    if (body.gstEnabled !== undefined) updateData.gstEnabled = Boolean(body.gstEnabled);
    if (body.gstRatePercent !== undefined) updateData.gstRatePercent = parseInt(body.gstRatePercent, 10);
    if (body.codEnabled !== undefined) updateData.codEnabled = Boolean(body.codEnabled);
    if (body.paymentModeDisplay !== undefined) updateData.paymentModeDisplay = body.paymentModeDisplay;
    if (body.announcementBarText !== undefined) updateData.announcementBarText = body.announcementBarText || null;
    if (body.announcementBarActive !== undefined) updateData.announcementBarActive = Boolean(body.announcementBarActive);
    if (body.policyTerms !== undefined) updateData.policyTerms = body.policyTerms || null;
    if (body.policyPrivacy !== undefined) updateData.policyPrivacy = body.policyPrivacy || null;
    if (body.policyShipping !== undefined) updateData.policyShipping = body.policyShipping || null;

    const updated = await prisma.siteSettings.upsert({
      where: { key: 'default' },
      update: updateData,
      create: {
        key: 'default',
        businessName: body.businessName || 'SHREENATH ART WORK',
        address: body.address || 'Opposite Temple Gate, Nathdwara, Rajasthan 313301',
        phone: body.phone || '9079901405',
        email: body.email || 'shreenathartwork@gmail.com',
        openingHours: body.openingHours || 'Monday to Sunday: 9:00 AM to 8:30 PM',
        freeShippingThreshold: body.freeShippingThreshold !== undefined ? parseInt(body.freeShippingThreshold, 10) : 500000,
        standardShippingCharge: body.standardShippingCharge !== undefined ? parseInt(body.standardShippingCharge, 10) : 25000,
        gstEnabled: body.gstEnabled !== undefined ? Boolean(body.gstEnabled) : true,
        gstRatePercent: body.gstRatePercent !== undefined ? parseInt(body.gstRatePercent, 10) : 12,
        codEnabled: body.codEnabled !== undefined ? Boolean(body.codEnabled) : true,
        paymentModeDisplay: body.paymentModeDisplay || 'Razorpay Secure (UPI, Cards, Netbanking)',
        announcementBarText: body.announcementBarText || null,
        announcementBarActive: body.announcementBarActive !== undefined ? Boolean(body.announcementBarActive) : false,
        instagramUrl: body.instagramUrl || null,
        facebookUrl: body.facebookUrl || null,
        policyTerms: body.policyTerms || null,
        policyPrivacy: body.policyPrivacy || null,
        policyShipping: body.policyShipping || null,
      },
    });

    await logAuditAction({
      adminUserId: session.user.id,
      adminEmail: session.user.email || 'admin',
      action: 'UPDATE_SETTINGS',
      entity: 'SiteSettings',
      entityId: updated.id,
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

