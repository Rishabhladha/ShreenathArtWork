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

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive boolean flag required' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Protection 1: Prevent disabling OWNER accounts
    if (targetUser.role === 'OWNER' && isActive === false) {
      return NextResponse.json({ error: 'Gallery owner accounts cannot be disabled.' }, { status: 403 });
    }

    // Protection 2: Prevent self-lockout
    if (targetUser.id === session.user.id && isActive === false) {
      return NextResponse.json({ error: 'You cannot disable your own active session.' }, { status: 400 });
    }

    // Protection 3: Staff can only manage customer accounts
    if (session.user.role === 'STAFF' && targetUser.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Staff members can only manage customer accounts.' }, { status: 403 });
    }

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

