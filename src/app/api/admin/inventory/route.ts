import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function POST(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { variantId, newStock, reason } = body;

    if (!variantId || newStock === undefined || newStock < 0) {
      return NextResponse.json({ error: 'Valid variant ID and non-negative stock required' }, { status: 400 });
    }

    const previous = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!previous) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    const updated = await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: parseInt(newStock, 10) },
    });

    await logAuditAction({
      adminUserId: session.user.id,
      adminEmail: session.user.email || 'admin',
      action: 'ADJUST_STOCK',
      entity: 'ProductVariant',
      entityId: variantId,
      details: {
        product: previous.product.title,
        sku: previous.sku,
        previousStock: previous.stock,
        newStock: updated.stock,
        reason: reason || 'Manual workshop count adjustment',
      },
    });

    return NextResponse.json({ success: true, variant: updated });
  } catch (error) {
    console.error('Stock adjustment error:', error);
    return NextResponse.json({ error: 'Failed to adjust stock' }, { status: 500 });
  }
}

