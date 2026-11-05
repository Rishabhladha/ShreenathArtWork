import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import { uploadImage } from '@/lib/storage';

export async function POST(req: Request) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!allowedTypes.includes(file.type) || !hasValidExtension) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WEBP raster image formats (.jpg, .jpeg, .png, .webp) are accepted.' },
        { status: 400 }
      );
    }

    const maxSize = 8 * 1024 * 1024; // 8MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowed limit of 8MB.' },
        { status: 400 }
      );
    }

    const result = await uploadImage(file);
    return NextResponse.json({ success: true, url: result.url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}

