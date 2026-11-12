import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { logActivityEvent } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Email, verification code, and new password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanOtp = String(otp).trim();
    const password = String(newPassword);

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters in length.' },
        { status: 400 }
      );
    }

    // Verify OTP record
    const record = await prisma.passwordResetOtp.findFirst({
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
        { error: 'This verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (record.attempts >= 5) {
      return NextResponse.json(
        { error: 'Maximum verification attempts exceeded. Please request a new code.' },
        { status: 429 }
      );
    }

    const isMatch = await bcrypt.compare(cleanOtp, record.otpHash);
    if (!isMatch) {
      await prisma.passwordResetOtp.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json(
        { error: 'Invalid verification code.' },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user password and mark OTP as used in a transaction
    const [user] = await prisma.$transaction([
      prisma.user.update({
        where: { email: cleanEmail },
        data: { passwordHash },
      }),
      prisma.passwordResetOtp.update({
        where: { id: record.id },
        data: { used: true },
      }),
      prisma.auditLog.create({
        data: {
          adminEmail: cleanEmail,
          action: 'PASSWORD_RESET',
          entity: 'User',
          details: JSON.stringify({ method: 'OTP_EMAIL_VERIFIED', email: cleanEmail }),
        },
      }),
    ]);

    logActivityEvent({
      eventType: 'PASSWORD_RESET_SUCCESS',
      userId: user.id,
      metadata: { email: cleanEmail },
    });

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully updated. You may now sign in.',
    });
  } catch (err: unknown) {
    console.error('Failed to reset password:', err);
    return NextResponse.json(
      { error: 'Internal technical error resetting password. Please try again.' },
      { status: 500 }
    );
  }
}
