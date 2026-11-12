import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendPasswordResetOtpEmail } from '@/lib/email';
import { logActivityEvent } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if account exists
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, name: true, email: true, isActive: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email address. Please verify your spelling or create an account.' },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'This account has been deactivated. Please contact our gallery for assistance.' },
        { status: 403 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Clean up previous OTPs for this email
    await prisma.passwordResetOtp.deleteMany({
      where: { email: cleanEmail },
    });

    // Save new OTP
    await prisma.passwordResetOtp.create({
      data: {
        email: cleanEmail,
        otpHash,
        expiresAt,
        attempts: 0,
        used: false,
      },
    });

    // Send email dispatch
    await sendPasswordResetOtpEmail({
      email: cleanEmail,
      otp,
      customerName: user.name || undefined,
    });

    logActivityEvent({
      eventType: 'PASSWORD_RESET_OTP_REQUESTED',
      userId: user.id,
      metadata: { email: cleanEmail },
    });

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}.`,
      ...(process.env.NODE_ENV !== 'production' ? { devOtp: otp } : {}),
    });
  } catch (err: unknown) {
    console.error('Failed to dispatch password reset OTP:', err);
    return NextResponse.json(
      { error: 'Internal technical error while processing password reset. Please try again.' },
      { status: 500 }
    );
  }
}
