import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  });

  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, slug, description, displayOrder } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and Slug required' }, { status: 400 });
    }

    const created = await prisma.category.create({
      data: {
        name,
        slug: slug.trim().toLowerCase(),
        description: description || null,
        displayOrder: displayOrder ? parseInt(displayOrder, 10) : 0,
      },
    });

    await logAuditAction({
      adminUserId: session.user.id,
      adminEmail: session.user.email || 'admin',
      action: 'CREATE_CATEGORY',
      entity: 'Category',
      entityId: created.id,
      details: { name: created.name },
    });

    return NextResponse.json({ success: true, category: created });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

