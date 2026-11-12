import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
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

    // 1. Check slug collision with other paintings
    const existingSlug = await prisma.product.findFirst({
      where: { slug: data.slug, id: { not: id } },
    });
    if (existingSlug) {
      return NextResponse.json(
        { error: `Another painting with URL slug "${data.slug}" already exists.` },
        { status: 400 }
      );
    }

    // 2. Check for duplicate SKUs within the submitted list
    const submittedSkus = data.variants.map((v) => v.sku.trim());
    const seenSkus = new Set<string>();
    for (const sku of submittedSkus) {
      if (seenSkus.has(sku.toLowerCase())) {
        return NextResponse.json(
          { error: `Duplicate SKU "${sku}" found within your variants. Each variant must have a unique SKU.` },
          { status: 400 }
        );
      }
      seenSkus.add(sku.toLowerCase());
    }

    // 3. Check if any SKU is already taken by a variant belonging to a DIFFERENT product
    const conflictingVariant = await prisma.productVariant.findFirst({
      where: {
        sku: { in: submittedSkus },
        productId: { not: id },
      },
      select: {
        sku: true,
        product: { select: { title: true } },
      },
    });

    if (conflictingVariant) {
      return NextResponse.json(
        {
          error: `SKU "${conflictingVariant.sku}" is already assigned to "${conflictingVariant.product.title}". Please use a distinct SKU.`,
        },
        { status: 400 }
      );
    }

    // 4. Verify category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: data.categoryId },
      select: { id: true },
    });
    if (!categoryExists) {
      return NextResponse.json(
        { error: 'Selected artwork category does not exist.' },
        { status: 400 }
      );
    }

    // 5. Update basic product details
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

    // 6. Safely replace images (product images have no external order FKs)
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

    // 7. Update variants without deleting those referenced by customer orders
    const existingVariants = await prisma.productVariant.findMany({
      where: { productId: id },
    });

    const submittedSkusSet = new Set(submittedSkus);

    // Upsert or update submitted variants
    for (const v of data.variants) {
      const cleanSku = v.sku.trim();
      const match = existingVariants.find((ev) => ev.sku === cleanSku || (v.id && ev.id === v.id));
      if (match) {
        await prisma.productVariant.update({
          where: { id: match.id },
          data: {
            size: v.size,
            frame: v.frame,
            price: v.price,
            mrp: v.mrp || null,
            sku: cleanSku,
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
            sku: cleanSku,
            stock: v.stock,
            isDefault: v.isDefault,
          },
        });
      }
    }

    // Safely retire obsolete variants not in the submission
    for (const ev of existingVariants) {
      if (!submittedSkusSet.has(ev.sku)) {
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

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = (error.meta?.target as string[]) || [];
      return NextResponse.json(
        {
          error: `A unique constraint failed on ${target.join(', ') || 'field'}. Please ensure all SKUs and slugs are unique.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update painting. Please try again.',
      },
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
