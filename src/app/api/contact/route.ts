import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { contactSchema } from '@/lib/validators';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
    const rateCheck = checkRateLimit(`contact:${ip}`, 5, 300);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many messages submitted. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { name, email, phone, subject, message } = result.data;

    const saved = await prisma.contactMessage.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        phone: phone || null,
        subject,
        message,
      },
    });

    return NextResponse.json({
      success: true,
      id: saved.id,
      message: 'Your inquiry has been received. Our gallery will respond shortly.',
    });
  } catch (error) {
    console.error('Contact error:', error);
    return NextResponse.json(
      { error: 'Unable to submit your message. Please try again.' },
      { status: 500 }
    );
  }
}

