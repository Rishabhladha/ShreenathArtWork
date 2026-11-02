import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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

  const where: any = {};
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
    where.status = status;
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

    // Check slug uniqueness
    const existing = await prisma.product.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'A product with this URL slug already exists.' },
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
            sku: v.sku,
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
    return NextResponse.json(
      { error: 'Failed to create product. Please try again.' },
      { status: 500 }
    );
  }
}

