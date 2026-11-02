import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerAuthSession } from '@/lib/auth';
import { checkoutAddressSchema } from '@/lib/validators';
import { calculateOrderTotals } from '@/lib/money';
import { getPaymentProvider } from '@/lib/payments';
import { checkRateLimit } from '@/lib/rate-limit';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { logActivityEvent } from '@/lib/events';

interface ClientItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local';
    const rateCheck = checkRateLimit(`checkout:${ip}`, 10, 60);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many checkout requests. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { items, address } = body as { items: ClientItem[]; address: unknown };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const addressParsed = checkoutAddressSchema.safeParse(address);
    if (!addressParsed.success) {
      return NextResponse.json(
        { error: addressParsed.error.issues[0]?.message || 'Invalid address details' },
        { status: 400 }
      );
    }

    const shippingInfo = addressParsed.data;
    const session = await getServerAuthSession();
    const userId = session?.user?.id || null;

    // Load site settings
    const settings = await prisma.siteSettings.findFirst();

    const freeShippingThreshold = settings?.freeShippingThreshold ?? 500000;
    const standardShippingCharge = settings?.standardShippingCharge ?? 25000;
    const gstEnabled = settings?.gstEnabled ?? true;
    const gstRatePercent = settings?.gstRatePercent ?? 12;
    const codEnabled = settings?.codEnabled ?? true;

    if (shippingInfo.paymentMethod === 'COD' && !codEnabled) {
      return NextResponse.json(
        { error: 'Cash on delivery is currently not available.' },
        { status: 400 }
      );
    }

    // Verify all products and variants from database directly
    const variantIds = items.map((i) => i.variantId);
    const dbVariants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    const variantMap = new Map(dbVariants.map((v) => [v.id, v]));

    // Check stock availability
    for (const item of items) {
      const v = variantMap.get(item.variantId);
      if (!v) {
        return NextResponse.json(
          { error: 'One or more items in your cart is no longer available.' },
          { status: 400 }
        );
      }
      if (v.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${v.product.title}" (${v.size}, ${v.frame}). Only ${v.stock} remaining.`,
          },
          { status: 400 }
        );
      }
    }

    // Compute subtotal from DB prices
    let subtotal = 0;
    const orderItemsData = items.map((item) => {
      const v = variantMap.get(item.variantId)!;
      const lineTotal = v.price * item.quantity;
      subtotal += lineTotal;
      return {
        productId: v.productId,
        variantId: v.id,
        titleSnapshot: v.product.title,
        sizeSnapshot: v.size,
        frameSnapshot: v.frame,
        priceSnapshot: v.price,
        quantity: item.quantity,
        subtotal: lineTotal,
      };
    });

    // Validate coupon if applied
    let discount = 0;
    let couponRecord: { id: string; code: string } | null = null;

    if (shippingInfo.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: shippingInfo.couponCode.toUpperCase() },
      });

      if (
        coupon &&
        coupon.isActive &&
        (!coupon.expiresAt || new Date() <= coupon.expiresAt) &&
        (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) &&
        subtotal >= coupon.minOrderValue
      ) {
        if (coupon.discountType === 'PERCENT') {
          discount = Math.round((subtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = Math.min(coupon.discountValue, subtotal);
        }
        couponRecord = { id: coupon.id, code: coupon.code };
      }
    }

    // Calculate totals
    const totals = calculateOrderTotals({
      subtotal,
      discount,
      freeShippingThreshold,
      standardShippingCharge,
      gstEnabled,
      gstRatePercent,
    });

    // Human-friendly order number: ORD-2026-XXXXXX
    const count = await prisma.order.count();
    const orderNumber = `ORD-2026-${String(count + 1001).padStart(6, '0')}`;

    // Execute in a database transaction: reserve stock and create order
    const result = await prisma.$transaction(async (tx) => {
      // 1. Decrement stock
      for (const item of items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      // 2. Increment coupon usage if used
      if (couponRecord) {
        await tx.coupon.update({
          where: { id: couponRecord.id },
          data: { usageCount: { increment: 1 } },
        });
      }

      // 3. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          customerName: shippingInfo.customerName,
          customerEmail: shippingInfo.customerEmail.toLowerCase().trim(),
          customerPhone: shippingInfo.customerPhone,
          shippingAddress: JSON.stringify({
            customerName: shippingInfo.customerName,
            customerPhone: shippingInfo.customerPhone,
            addressLine1: shippingInfo.addressLine1,
            addressLine2: shippingInfo.addressLine2 || '',
            landmark: shippingInfo.landmark || '',
            city: shippingInfo.city,
            state: shippingInfo.state,
            postalCode: shippingInfo.postalCode,
          }),
          orderNotes: shippingInfo.orderNotes || null,
          subtotal: totals.subtotal,
          discount: totals.discount,
          shippingFee: totals.shippingFee,
          tax: totals.tax,
          total: totals.total,
          status: 'PLACED',
          paymentMethod: shippingInfo.paymentMethod,
          paymentStatus: shippingInfo.paymentMethod === 'COD' ? 'PENDING' : 'CREATED',
          items: {
            create: orderItemsData,
          },
          statusHistory: {
            create: {
              status: 'PLACED',
              note: `Order placed via ${shippingInfo.paymentMethod}`,
              changedBy: 'CUSTOMER',
            },
          },
          ...(couponRecord
            ? {
                couponRedemptions: {
                  create: {
                    couponId: couponRecord.id,
                    userId,
                    discountAmount: totals.discount,
                  },
                },
              }
            : {}),
        },
      });

      return newOrder;
    });

    await logActivityEvent({
      eventType: 'ORDER_PLACED',
      userId: userId || undefined,
      metadata: { orderNumber, total: totals.total, method: shippingInfo.paymentMethod },
    });

    // Handle COD order
    if (shippingInfo.paymentMethod === 'COD') {
      // Dispatches confirmation email
      await sendOrderConfirmationEmail({
        orderNumber: result.orderNumber,
        customerName: result.customerName,
        customerEmail: result.customerEmail,
        items: orderItemsData.map((i) => ({
          title: i.titleSnapshot,
          size: i.sizeSnapshot,
          frame: i.frameSnapshot,
          quantity: i.quantity,
          price: i.priceSnapshot,
        })),
        total: result.total,
        paymentMethod: 'Cash on Delivery',
        shippingAddress: {
          addressLine1: shippingInfo.addressLine1,
          city: shippingInfo.city,
          state: shippingInfo.state,
          postalCode: shippingInfo.postalCode,
        },
      });

      return NextResponse.json({
        success: true,
        orderId: result.id,
        orderNumber: result.orderNumber,
        paymentMethod: 'COD',
      });
    }

    // Handle Online Payment (Razorpay Simulator or Real Razorpay)
    const provider = getPaymentProvider();
    const paymentOrder = await provider.createOrder(result.total, 'INR', result.orderNumber);

    // Save payment intent in DB
    await prisma.payment.create({
      data: {
        orderId: result.id,
        provider: process.env.PAYMENT_MODE || 'simulated',
        providerOrderId: paymentOrder.providerOrderId,
        amount: result.total,
        status: 'CREATED',
        method: 'ONLINE',
      },
    });

    const isSimulated = (process.env.PAYMENT_MODE || 'simulated') === 'simulated';

    return NextResponse.json({
      success: true,
      orderId: result.id,
      orderNumber: result.orderNumber,
      providerOrderId: paymentOrder.providerOrderId,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      paymentMethod: 'ONLINE',
      isSimulated,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_simulated_key',
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while placing your order. Please try again.' },
      { status: 500 }
    );
  }
}

