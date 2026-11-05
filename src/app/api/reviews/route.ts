import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerAuthSession } from '@/lib/auth';
import { reviewSchema } from '@/lib/validators';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: {
      productId,
      isApproved: true,
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      authorName: r.user.name || 'Verified Collector',
      createdAt: r.createdAt,
    })),
  });
}

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Please sign in to submit a review' },
        { status: 401 }
      );
    }

    const rateCheck = checkRateLimit(`review:${session.user.id}`, 3, 300);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many reviews submitted. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = reviewSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid review data' },
        { status: 400 }
      );
    }

    const { productId, rating, comment } = result.data;

    // Verify customer has a delivered order for this product
    const deliveredOrderWithProduct = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        status: 'DELIVERED',
        items: {
          some: {
            productId,
          },
        },
      },
    });

    if (!deliveredOrderWithProduct) {
      return NextResponse.json(
        {
          error:
            'Only verified customers with a delivered order for this painting can submit a review.',
        },
        { status: 403 }
      );
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId: session.user.id,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already submitted a review for this artwork.' },
        { status: 409 }
      );
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: session.user.id,
        rating,
        comment,
        isApproved: false, // Requires admin moderation
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Your review has been submitted for moderation and will appear once approved.',
      reviewId: review.id,
    });
  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
