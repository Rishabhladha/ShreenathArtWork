import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { registerSchema } from '@/lib/validators';
import { checkRateLimit } from '@/lib/rate-limit';
import { logActivityEvent } from '@/lib/events';
import { sendEmailVerificationOtpEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
    const rateCheck = checkRateLimit(`register:${ip}`, 5, 300);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { name, email, phone, password } = result.data;
    const cleanEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        phone: phone || null,
        passwordHash,
        role: 'CUSTOMER',
        emailVerified: null,
      },
    });

    // Generate 6-digit email verification OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.emailVerificationOtp.deleteMany({
      where: { email: cleanEmail },
    });

    await prisma.emailVerificationOtp.create({
      data: {
        email: cleanEmail,
        otpHash,
        expiresAt,
        attempts: 0,
        used: false,
      },
    });

    // Dispatch verification email via Gmail SMTP
    await sendEmailVerificationOtpEmail({
      email: cleanEmail,
      otp,
      customerName: name,
    });

    await logActivityEvent({
      eventType: 'SIGNUP',
      userId: user.id,
      metadata: { email: user.email },
    });

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      email: cleanEmail,
      message: 'Account created! A 6-digit verification code has been dispatched to your email.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
