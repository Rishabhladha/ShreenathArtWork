import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and verification code are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      return NextResponse.json(
        { error: 'Please enter a valid 6-digit numeric verification code.' },
        { status: 400 }
      );
    }

    const record = await prisma.passwordResetOtp.findFirst({
      where: {
        email: cleanEmail,
        used: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return NextResponse.json(
        { error: 'No active verification code found. Please request a new code.' },
        { status: 400 }
      );
    }

    if (new Date() > record.expiresAt) {
      return NextResponse.json(
        { error: 'This verification code has expired (valid for 10 minutes). Please request a new code.' },
        { status: 400 }
      );
    }

    if (record.attempts >= 5) {
      return NextResponse.json(
        { error: 'Maximum attempts exceeded. For your security, please request a new code.' },
        { status: 429 }
      );
    }

    const isValid = await bcrypt.compare(cleanOtp, record.otpHash);

    if (!isValid) {
      await prisma.passwordResetOtp.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });

      const remaining = 5 - (record.attempts + 1);
      return NextResponse.json(
        { error: `Invalid verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Please request a new code.'}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code confirmed.',
    });
  } catch (err: unknown) {
    console.error('Failed to verify OTP:', err);
    return NextResponse.json(
      { error: 'Internal technical error verifying code.' },
      { status: 500 }
    );
  }
}
