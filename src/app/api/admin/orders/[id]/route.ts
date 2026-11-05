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
      include: { items: true, payments: true, refunds: true },
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

    // Action: Issue Refund (Simulated, Real Razorpay, or COD Manual)
    if (action === 'issue_refund') {
      if (order.paymentStatus !== 'PAID' && order.paymentStatus !== 'PARTIALLY_REFUNDED') {
        return NextResponse.json(
          { error: 'Cannot issue a refund for an unpaid or cancelled order.' },
          { status: 400 }
        );
      }

      const totalAlreadyRefunded = order.refunds
        .filter((r) => r.status === 'SUCCESS')
        .reduce((sum, r) => sum + r.amount, 0);

      const maxRefundable = order.total - totalAlreadyRefunded;
      if (maxRefundable <= 0) {
        return NextResponse.json(
          { error: 'This order has already been fully refunded.' },
          { status: 400 }
        );
      }

      const amountToRefund = refundAmount ? parseInt(refundAmount, 10) : maxRefundable;
      if (isNaN(amountToRefund) || amountToRefund <= 0) {
        return NextResponse.json({ error: 'Refund amount must be greater than zero.' }, { status: 400 });
      }
      if (amountToRefund > maxRefundable) {
        return NextResponse.json(
          {
            error: `Refund amount cannot exceed remaining refundable balance of Rs ${Math.round(
              maxRefundable / 100
            )}.`,
          },
          { status: 400 }
        );
      }

      let refundId = `rfnd_MANUAL_${Date.now()}`;
      let refundStatus = 'SUCCESS';

      const onlinePayment = order.payments.find((p) => p.providerPaymentId);
      if (onlinePayment?.providerPaymentId && order.paymentMethod === 'ONLINE') {
        const provider = getPaymentProvider();
        const refundResult = await provider.refund(onlinePayment.providerPaymentId, amountToRefund);
        refundId = refundResult.refundId;
        refundStatus = refundResult.status;
      }

      await prisma.$transaction(async (tx) => {
        const isFullRefund = totalAlreadyRefunded + amountToRefund >= order.total;
        await tx.order.update({
          where: { id },
          data: {
            paymentStatus: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
          },
        });

        await tx.refund.create({
          data: {
            orderId: id,
            paymentId: onlinePayment?.id || order.payments[0]?.id || null,
            amount: amountToRefund,
            reason: reason || 'Admin initiated refund',
            status: refundStatus,
            providerRefundId: refundId,
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            status: order.status,
            note: `Refund of Rs ${Math.round(amountToRefund / 100)} processed (${refundId})`,
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
        details: { refundId, amount: amountToRefund },
      });

      return NextResponse.json({
        success: true,
        refund: {
          refundId,
          amount: amountToRefund,
          status: refundStatus,
        },
      });
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

