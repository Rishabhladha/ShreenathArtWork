import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { customOrderSchema } from '@/lib/validators';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local';
    const rateCheck = checkRateLimit(`custom-order:${ip}`, 5, 300);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = customOrderSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { name, email, phone, medium, dimensions, budget, description, referenceImageUrl } =
      result.data;

    const saved = await prisma.customOrderRequest.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        phone,
        medium: medium || null,
        dimensions: dimensions || null,
        budget: budget || null,
        description,
        referenceImageUrl: referenceImageUrl || null,
      },
    });

    return NextResponse.json({
      success: true,
      id: saved.id,
      message: 'Your custom commission request has been received. Our artists will contact you.',
    });
  } catch (error) {
    console.error('Custom order error:', error);
    return NextResponse.json(
      { error: 'Failed to submit request. Please try again.' },
      { status: 500 }
    );
  }
}

