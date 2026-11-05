import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth';
import { couponSchema } from '@/lib/validators';
import { logAuditAction } from '@/lib/audit';

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { redemptions: true } } },
  });

  return NextResponse.json({ coupons });
}

export async function POST(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = couponSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const data = result.data;

    const created = await prisma.coupon.create({
      data: {
        code: data.code,
        description: data.description || null,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderValue: data.minOrderValue,
        maxDiscount: data.maxDiscount || null,
        usageLimit: data.usageLimit || null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isActive: data.isActive,
      },
    });

    await logAuditAction({
      adminUserId: session.user.id,
      adminEmail: session.user.email || 'admin',
      action: 'CREATE_COUPON',
      entity: 'Coupon',
      entityId: created.id,
      details: { code: created.code },
    });

    return NextResponse.json({ success: true, coupon: created });
  } catch (error) {
    console.error('Create coupon error:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, isActive } = body;
    if (!id || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'Coupon ID and isActive boolean required' }, { status: 400 });
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: { isActive },
    });

    await logAuditAction({
      adminUserId: session.user.id,
      adminEmail: session.user.email || 'admin',
      action: isActive ? 'ENABLE_COUPON' : 'DISABLE_COUPON',
      entity: 'Coupon',
      entityId: id,
      details: { code: updated.code },
    });

    return NextResponse.json({ success: true, coupon: updated });
  } catch (error) {
    console.error('Update coupon error:', error);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Coupon ID required' }, { status: 400 });
    }

    const redemptionsCount = await prisma.couponRedemption.count({ where: { couponId: id } });
    if (redemptionsCount > 0) {
      // Deactivate instead of deleting if redemptions exist
      const updated = await prisma.coupon.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({
        success: true,
        message: 'Coupon has existing redemptions and was deactivated instead of deleted.',
        coupon: updated,
      });
    }

    const deleted = await prisma.coupon.delete({ where: { id } });

    await logAuditAction({
      adminUserId: session.user.id,
      adminEmail: session.user.email || 'admin',
      action: 'DELETE_COUPON',
      entity: 'Coupon',
      entityId: id,
      details: { code: deleted.code },
    });

    return NextResponse.json({ success: true, coupon: deleted });
  } catch (error) {
    console.error('Delete coupon error:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}

