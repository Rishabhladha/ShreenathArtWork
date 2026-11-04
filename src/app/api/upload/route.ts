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

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WEBP, and SVG are accepted.' },
        { status: 400 }
      );
    }

    // Process and store the image (optimized on the client before arrival)
    const result = await uploadImage(file);
    return NextResponse.json({ success: true, url: result.url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
