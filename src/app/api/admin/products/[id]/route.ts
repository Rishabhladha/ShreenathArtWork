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

    // 1. Update basic product details
    await prisma.product.update({
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
      },
    });

    // 2. Safely replace images (product images have no external order FKs)
    await prisma.productImage.deleteMany({ where: { productId: id } });
    if (data.images && data.images.length > 0) {
      for (let idx = 0; idx < data.images.length; idx++) {
        const img = data.images[idx];
        await prisma.productImage.create({
          data: {
            productId: id,
            url: img.url,
            altText: img.altText || `${data.title} photo ${idx + 1}`,
            displayOrder: img.displayOrder ?? idx,
            isPrimary: img.isPrimary ?? idx === 0,
          },
        });
      }
    }

    // 3. Update variants without deleting those referenced by customer orders
    const existingVariants = await prisma.productVariant.findMany({
      where: { productId: id },
    });

    const submittedSkus = new Set(data.variants.map((v) => v.sku));

    // Upsert or update submitted variants
    for (const v of data.variants) {
      const match = existingVariants.find((ev) => ev.sku === v.sku);
      if (match) {
        await prisma.productVariant.update({
          where: { id: match.id },
          data: {
            size: v.size,
            frame: v.frame,
            price: v.price,
            mrp: v.mrp || null,
            stock: v.stock,
            isDefault: v.isDefault,
          },
        });
      } else {
        await prisma.productVariant.create({
          data: {
            productId: id,
            size: v.size,
            frame: v.frame,
            price: v.price,
            mrp: v.mrp || null,
            sku: v.sku,
            stock: v.stock,
            isDefault: v.isDefault,
          },
        });
      }
    }

    // Safely retire obsolete variants not in the submission
    for (const ev of existingVariants) {
      if (!submittedSkus.has(ev.sku)) {
        const orderRefCount = await prisma.orderItem.count({
          where: { variantId: ev.id },
        });
        if (orderRefCount === 0) {
          await prisma.productVariant.delete({ where: { id: ev.id } });
        } else {
          // If the variant was previously purchased, preserve record and zero stock
          await prisma.productVariant.update({
            where: { id: ev.id },
            data: { stock: 0, isDefault: false },
          });
        }
      }
    }

    const updated = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        images: { orderBy: { displayOrder: 'asc' } },
        category: true,
      },
    });

    if (!updated) {
      return NextResponse.json({ error: 'Product not found after update' }, { status: 404 });
    }

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

