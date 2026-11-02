import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth';
import { productSchema } from '@/lib/validators';
import { logAuditAction } from '@/lib/audit';

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteProps) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      variants: true,
      images: { orderBy: { displayOrder: 'asc' } },
    },
  });

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PUT(req: Request, { params }: RouteProps) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const result = productSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const data = result.data;

    // Check slug collision
    const existing = await prisma.product.findFirst({
      where: { slug: data.slug, id: { not: id } },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Another painting with this URL slug already exists.' },
        { status: 400 }
      );
    }

    // Update in transaction: replace images & variants with updated set
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Delete removed images and variants
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productVariant.deleteMany({ where: { productId: id } });

      // 2. Update product & recreate images and variants
      const p = await tx.product.update({
        where: { id },
        data: {
          title: data.title,
          slug: data.slug,
          description: data.description,
          categoryId: data.categoryId,
          medium: data.medium,
          dimensions: data.dimensions,
          careInstructions: data.careInstructions || null,
          tags: data.tags || null,
          featured: data.featured,
          status: data.status,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          images: {
            create: data.images.map((img, idx) => ({
              url: img.url,
              altText: img.altText || `${data.title} photo ${idx + 1}`,
              displayOrder: img.displayOrder ?? idx,
              isPrimary: img.isPrimary ?? idx === 0,
            })),
          },
          variants: {
            create: data.variants.map((v) => ({
              size: v.size,
              frame: v.frame,
              price: v.price,
              mrp: v.mrp || null,
              sku: v.sku,
              stock: v.stock,
              isDefault: v.isDefault,
            })),
          },
        },
        include: { variants: true, images: true },
      });

      return p;
    });

    await logAuditAction({
      adminUserId: session.user.id,
      adminEmail: session.user.email || 'admin',
      action: 'UPDATE_PRODUCT',
      entity: 'Product',
      entityId: id,
      details: { title: updated.title },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteProps) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const deleted = await prisma.product.delete({
      where: { id },
    });

    await logAuditAction({
      adminUserId: session.user.id,
      adminEmail: session.user.email || 'admin',
      action: 'DELETE_PRODUCT',
      entity: 'Product',
      entityId: id,
      details: { title: deleted.title },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Could not delete product. It may have associated customer orders.' },
      { status: 400 }
    );
  }
}

