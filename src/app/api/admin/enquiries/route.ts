import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function PUT(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, id, status, adminReplyNotes } = body;

    if (type === 'custom_order') {
      const updated = await prisma.customOrderRequest.update({
        where: { id },
        data: {
          status,
          adminReplyNotes: adminReplyNotes !== undefined ? adminReplyNotes : undefined,
        },
      });
      return NextResponse.json({ success: true, item: updated });
    } else {
      const updated = await prisma.contactMessage.update({
        where: { id },
        data: {
          status,
          adminReplyNotes: adminReplyNotes !== undefined ? adminReplyNotes : undefined,
        },
      });
      return NextResponse.json({ success: true, item: updated });
    }
  } catch (error) {
    console.error('Enquiry update error:', error);
    return NextResponse.json({ error: 'Failed to update enquiry' }, { status: 500 });
  }
}

