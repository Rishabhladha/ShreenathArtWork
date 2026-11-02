import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

export async function uploadImage(file: File): Promise<{ url: string }> {
  // Check if Vercel Blob token is configured
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`artwork/${Date.now()}-${file.name}`, file, {
      access: 'public',
    });
    return { url: blob.url };
  }

  // Local fallback: save to public/uploads
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${Date.now()}-${cleanName}`;
  const filepath = path.join(uploadsDir, filename);

  fs.writeFileSync(filepath, buffer);
  return { url: `/uploads/${filename}` };
}

