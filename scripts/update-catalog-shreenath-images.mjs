import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const mapping = {
  'shreenathji-kamal-talai-pichwai': '/artworks/kamal-talai-lotus.jpg',
  'classical-shreenathji-mukharvind-portrait': '/artworks/mukharvind-portrait.jpg',
  'sandhya-aarti-darshan-shringaar': '/artworks/sandhya-aarti-shringaar.jpg',
  'annakoot-manorath-shringaar-painting': '/artworks/annakoot-manorath.jpg',
  'chhappan-bhog-grand-festive-pichwai': '/artworks/chhappan-bhog-sanctum.jpg',
  'mor-kuti-peacock-dance-pichwai': '/artworks/mor-kuti-shringaar.jpg',
  'navneet-priyaji-swaroop-miniature': '/artworks/navneet-priyaji-detail.jpg',
  'sharad-purnima-raas-pichwai': '/artworks/shreenathji-shrine.jpg',
  'gau-charan-miniature-sanctum-painting': '/artworks/kamal-talai-lotus.jpg',
  'shreenathji-with-ashta-sakhas-miniature': '/artworks/sandhya-aarti-shringaar.jpg',
  'vallabhacharya-shreenathji-darshan': '/artworks/shreenathji-full-masterpiece.jpg',
  'dan-ghal-manorath-pichwai': '/artworks/annakoot-manorath.jpg',
  'vasant-utsav-phag-khel-pichwai': '/artworks/shreenathji-shrine.jpg',
  'kaliya-daman-sacred-haveli-composition': '/artworks/shreenathji-full-masterpiece.jpg',
};

async function updateProductImages() {
  console.log("Updating catalog product images to authentic Shreenathji paintings...");
  const products = await prisma.product.findMany();

  for (const p of products) {
    const imgUrl = mapping[p.slug] || '/artworks/shreenathji-shrine.jpg';
    
    // Update or create product image
    const existing = await prisma.productImage.findFirst({
      where: { productId: p.id, isPrimary: true },
    });

    if (existing) {
      await prisma.productImage.update({
        where: { id: existing.id },
        data: {
          url: imgUrl,
          altText: `${p.title} - Authentic Shreenathji Painting`,
        },
      });
    } else {
      await prisma.productImage.create({
        data: {
          productId: p.id,
          url: imgUrl,
          altText: `${p.title} - Authentic Shreenathji Painting`,
          displayOrder: 0,
          isPrimary: true,
        },
      });
    }

    console.log(`Updated ${p.title} -> ${imgUrl}`);
  }

  console.log("All product images updated in MongoDB Atlas successfully!");
}

updateProductImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
