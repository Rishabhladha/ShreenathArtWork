import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth';
import { getPaymentProvider } from '@/lib/payments';
import { logAuditAction } from '@/lib/audit';

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: RouteProps) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action, status, courierName, trackingNumber, internalNotes, refundAmount, reason } = body;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, payments: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Action: Update Order Status
    if (action === 'update_status' && status) {
      const updated = await prisma.$transaction(async (tx) => {
        // If order was cancelled, restock variants
        if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
          for (const item of order.items) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }

        const o = await tx.order.update({
          where: { id },
          data: {
            status,
            courierName: courierName !== undefined ? courierName : order.courierName,
            trackingNumber: trackingNumber !== undefined ? trackingNumber : order.trackingNumber,
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            status,
            note: `Status updated by ${session.user.name || session.user.email}${
              trackingNumber ? ` (Tracking: ${trackingNumber})` : ''
            }`,
            changedBy: session.user.email || 'ADMIN',
          },
        });

        return o;
      });

      await logAuditAction({
        adminUserId: session.user.id,
        adminEmail: session.user.email || 'admin',
        action: 'UPDATE_ORDER_STATUS',
        entity: 'Order',
        entityId: id,
        details: { status, orderNumber: order.orderNumber },
      });

      return NextResponse.json({ success: true, order: updated });
    }

    // Action: Mark COD Order as Paid on Delivery
    if (action === 'mark_cod_paid') {
      const updated = await prisma.$transaction(async (tx) => {
        const o = await tx.order.update({
          where: { id },
          data: { paymentStatus: 'PAID', status: 'DELIVERED' },
        });

        await tx.payment.create({
          data: {
            orderId: id,
            provider: 'cash_on_delivery',
            amount: order.total,
            status: 'PAID',
            method: 'COD',
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            status: 'DELIVERED',
            note: 'Cash on delivery payment collected and order delivered.',
            changedBy: session.user.email || 'ADMIN',
          },
        });

        return o;
      });

      await logAuditAction({
        adminUserId: session.user.id,
        adminEmail: session.user.email || 'admin',
        action: 'MARK_COD_PAID',
        entity: 'Order',
        entityId: id,
        details: { orderNumber: order.orderNumber, amount: order.total },
      });

      return NextResponse.json({ success: true, order: updated });
    }

    // Action: Issue Refund (Simulated or Real)
    if (action === 'issue_refund') {
      const amountToRefund = refundAmount ? parseInt(refundAmount, 10) : order.total;
      const provider = getPaymentProvider();
      const refundResult = await provider.refund(order.payments[0]?.providerPaymentId || '', amountToRefund);

      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id },
          data: {
            paymentStatus: amountToRefund >= order.total ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
          },
        });

        await tx.refund.create({
          data: {
            orderId: id,
            paymentId: order.payments[0]?.id || null,
            amount: amountToRefund,
            reason: reason || 'Admin initiated refund',
            status: refundResult.status,
            providerRefundId: refundResult.refundId,
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            status: order.status,
            note: `Refund of Rs ${Math.round(amountToRefund / 100)} processed (${refundResult.refundId})`,
            changedBy: session.user.email || 'ADMIN',
          },
        });
      });

      await logAuditAction({
        adminUserId: session.user.id,
        adminEmail: session.user.email || 'admin',
        action: 'ISSUE_REFUND',
        entity: 'Order',
        entityId: id,
        details: { refundId: refundResult.refundId, amount: amountToRefund },
      });

      return NextResponse.json({ success: true, refund: refundResult });
    }

    // Action: Save Internal Notes
    if (action === 'save_notes') {
      const updated = await prisma.order.update({
        where: { id },
        data: { internalNotes },
      });

      return NextResponse.json({ success: true, order: updated });
    }

    return NextResponse.json({ error: 'Unrecognized action' }, { status: 400 });
  } catch (error) {
    console.error('Order admin update error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

