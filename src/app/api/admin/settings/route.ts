import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function PUT(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const updated = await prisma.siteSettings.upsert({
      where: { key: 'default' },
      update: {
        businessName: body.businessName,
        address: body.address,
        phone: body.phone,
        email: body.email,
        openingHours: body.openingHours,
        instagramUrl: body.instagramUrl || null,
        facebookUrl: body.facebookUrl || null,
        freeShippingThreshold: parseInt(body.freeShippingThreshold, 10),
        standardShippingCharge: parseInt(body.standardShippingCharge, 10),
        gstEnabled: body.gstEnabled,
        gstRatePercent: parseInt(body.gstRatePercent, 10),
        codEnabled: body.codEnabled,
        paymentModeDisplay: body.paymentModeDisplay,
        announcementBarText: body.announcementBarText || null,
        announcementBarActive: body.announcementBarActive,
        policyTerms: body.policyTerms || null,
        policyPrivacy: body.policyPrivacy || null,
        policyShipping: body.policyShipping || null,
      },
      create: {
        key: 'default',
        businessName: body.businessName || 'SHREENATH ART WORK',
        address: body.address || 'Opposite Temple Gate, Nathdwara, Rajasthan 313301',
        phone: body.phone || '9079901405',
        email: body.email || 'shreenathartwork@gmail.com',
        openingHours: body.openingHours || 'Monday to Sunday: 9:00 AM to 8:30 PM',
        freeShippingThreshold: 500000,
        standardShippingCharge: 25000,
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

