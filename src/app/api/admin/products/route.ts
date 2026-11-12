import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma, ProductStatus } from '@prisma/client';
import { requireAdminSession } from '@/lib/auth';
import { productSchema } from '@/lib/validators';
import { logAuditAction } from '@/lib/audit';

export async function GET(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const status = searchParams.get('status') || '';

  const where: Prisma.ProductWhereInput = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (status) {
    where.status = status as ProductStatus;
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      variants: true,
      images: { orderBy: { displayOrder: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

    // 1. Check slug uniqueness
    const existingSlug = await prisma.product.findUnique({
      where: { slug: data.slug },
    });
    if (existingSlug) {
      return NextResponse.json(
        { error: `A painting with URL slug "${data.slug}" already exists. Please choose a distinct slug.` },
        { status: 400 }
      );
    }

    // 2. Check for duplicate SKUs within the submitted variants list
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

    // 3. Check for existing SKUs in the database
    const existingVariant = await prisma.productVariant.findFirst({
      where: {
        sku: { in: submittedSkus },
      },
      select: {
        sku: true,
        product: { select: { title: true } },
      },
    });

    if (existingVariant) {
      return NextResponse.json(
        {
          error: `SKU "${existingVariant.sku}" is already assigned to "${existingVariant.product.title}". Please enter a unique SKU code.`,
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
        { error: 'Selected artwork category does not exist in the database.' },
        { status: 400 }
      );
    }

    const created = await prisma.product.create({
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
            sku: v.sku.trim(),
            stock: v.stock,
            isDefault: v.isDefault,
          })),
        },
      },
      include: { variants: true, images: true },
    });

    await logAuditAction({
      adminUserId: session.user.id,
      adminEmail: session.user.email || 'admin',
      action: 'CREATE_PRODUCT',
      entity: 'Product',
      entityId: created.id,
      details: { title: created.title, slug: created.slug },
    });

    return NextResponse.json({ success: true, product: created });
  } catch (error) {
    console.error('Create product error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = (error.meta?.target as string[]) || [];
      return NextResponse.json(
        {
          error: `A unique constraint failed on ${target.join(', ') || 'product field'}. Please ensure all SKUs and slugs are unique.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create product. Please try again.',
      },
      { status: 500 }
    );
  }
}
