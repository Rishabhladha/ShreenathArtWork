import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { couponApplySchema } from '@/lib/validators';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local';
    const rateCheck = checkRateLimit(`coupon:${ip}`, 10, 60);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many coupon attempts. Please slow down.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = couponApplySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid coupon format' },
        { status: 400 }
      );
    }

    const { code, subtotal } = result.data;

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json(
        { error: 'Invalid or inactive coupon code' },
        { status: 404 }
      );
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json(
        { error: 'This coupon has expired' },
        { status: 400 }
      );
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: 'This coupon usage limit has been reached' },
        { status: 400 }
      );
    }

    if (subtotal < coupon.minOrderValue) {
      const minInRupees = Math.round(coupon.minOrderValue / 100);
      return NextResponse.json(
        { error: `This coupon requires a minimum cart value of Rs ${minInRupees}` },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENT') {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      // FLAT discount in paise
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { error: 'Failed to apply coupon' },
      { status: 500 }
    );
  }
}

