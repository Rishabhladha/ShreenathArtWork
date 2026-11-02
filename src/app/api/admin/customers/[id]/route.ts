import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: RouteProps) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { isActive } = body;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
    });

    await logAuditAction({
      adminUserId: session.user.id,
      adminEmail: session.user.email || 'admin',
      action: isActive ? 'ENABLE_CUSTOMER' : 'DISABLE_CUSTOMER',
      entity: 'User',
      entityId: id,
      details: { email: user.email },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Customer update error:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

