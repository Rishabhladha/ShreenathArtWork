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

export async function DELETE(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Category ID required' }, { status: 400 });
    }

    const productsCount = await prisma.product.count({ where: { categoryId: id } });
    if (productsCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category: ${productsCount} product(s) are currently assigned to it.` },
        { status: 400 }
      );
    }

    const deleted = await prisma.category.delete({ where: { id } });

    await logAuditAction({
      adminUserId: session.user.id,
      adminEmail: session.user.email || 'admin',
      action: 'DELETE_CATEGORY',
      entity: 'Category',
      entityId: id,
      details: { name: deleted.name },
    });

    return NextResponse.json({ success: true, category: deleted });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}

