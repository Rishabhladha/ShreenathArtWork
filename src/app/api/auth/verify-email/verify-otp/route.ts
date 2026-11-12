import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { logActivityEvent } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and 6-digit verification code are required.' },
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

    // Retrieve active OTP record
    const record = await prisma.emailVerificationOtp.findFirst({
      where: {
        email: cleanEmail,
        used: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return NextResponse.json(
        { error: 'No active verification code found for this account. Please request a new code.' },
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
        { error: 'Maximum attempts exceeded. For your security, please request a new verification code.' },
        { status: 429 }
      );
    }

    const isValid = await bcrypt.compare(cleanOtp, record.otpHash);
    if (!isValid) {
      await prisma.emailVerificationOtp.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });

      const remaining = 5 - (record.attempts + 1);
      return NextResponse.json(
        {
          error: `Invalid verification code. ${
            remaining > 0 ? `${remaining} attempts remaining.` : 'Please request a new code.'
          }`,
        },
        { status: 400 }
      );
    }

    // Mark OTP as used and update user's emailVerified timestamp in a transaction
    const [user] = await prisma.$transaction([
      prisma.user.update({
        where: { email: cleanEmail },
        data: { emailVerified: new Date() },
      }),
      prisma.emailVerificationOtp.update({
        where: { id: record.id },
        data: { used: true },
      }),
      prisma.auditLog.create({
        data: {
          adminEmail: cleanEmail,
          action: 'EMAIL_VERIFIED',
          entity: 'User',
          details: JSON.stringify({ email: cleanEmail, method: 'OTP_EMAIL_VERIFIED' }),
        },
      }),
    ]);

    await logActivityEvent({
      eventType: 'LOGIN',
      userId: user.id,
      metadata: { action: 'EMAIL_VERIFIED', email: cleanEmail },
    });

    return NextResponse.json({
      success: true,
      message: 'Email address verified successfully. You may now proceed.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err: unknown) {
    console.error('Failed to verify email OTP:', err);
    return NextResponse.json(
      { error: 'Internal technical error verifying code. Please try again.' },
      { status: 500 }
    );
  }
}
