import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendEmailVerificationOtpEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
    const rateCheck = checkRateLimit(`email-otp:${ip}`, 5, 300);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many verification code requests. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, name: true, email: true, emailVerified: true, isActive: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email address. Please register an account.' },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'This account is inactive. Please contact customer care.' },
        { status: 403 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Clean up old verification codes for this email
    await prisma.emailVerificationOtp.deleteMany({
      where: { email: cleanEmail },
    });

    // Save new code
    await prisma.emailVerificationOtp.create({
      data: {
        email: cleanEmail,
        otpHash,
        expiresAt,
        attempts: 0,
        used: false,
      },
    });

    // Send real email via Gmail SMTP
    await sendEmailVerificationOtpEmail({
      email: cleanEmail,
      otp,
      customerName: user.name || undefined,
    });

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}.`,
    });
  } catch (err: unknown) {
    console.error('Failed to send verification OTP:', err);
    return NextResponse.json(
      { error: 'Technical error dispatching verification code. Please try again.' },
      { status: 500 }
    );
  }
}
