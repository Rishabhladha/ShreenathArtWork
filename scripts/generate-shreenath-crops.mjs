import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const srcImg = path.resolve('public/image/shreenathji-shrine.png');
const outDir = path.resolve('public/artworks');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function generateCrops() {
  const metadata = await sharp(srcImg).metadata();
  console.log('Source dimensions:', metadata.width, 'x', metadata.height);

  const W = metadata.width;
  const H = metadata.height;

  // 1. Full Masterpiece Optimized (800 x 1067)
  await sharp(srcImg)
    .resize(800, 1067, { fit: 'cover' })
    .jpeg({ quality: 92 })
    .toFile(path.join(outDir, 'shreenathji-full-masterpiece.jpg'));

  // 2. Mukharvind Close-up (Focus on Crown, Face, Diamond Chin Gem)
  // Face and crown are in top-center region
  await sharp(srcImg)
    .extract({
      left: Math.round(W * 0.15),
      top: Math.round(H * 0.08),
      width: Math.round(W * 0.70),
      height: Math.round(H * 0.50),
    })
    .resize(800, 1000, { fit: 'cover' })
    .jpeg({ quality: 92 })
    .toFile(path.join(outDir, 'mukharvind-portrait.jpg'));

  // 3. Kamal Talai (Focus on Lotus Offerings & Altar at the base)
  await sharp(srcImg)
    .extract({
      left: Math.round(W * 0.10),
      top: Math.round(H * 0.45),
      width: Math.round(W * 0.80),
      height: Math.round(H * 0.52),
    })
    .resize(800, 1000, { fit: 'cover' })
    .jpeg({ quality: 92 })
    .toFile(path.join(outDir, 'kamal-talai-lotus.jpg'));

  // 4. Sandhya Aarti Shringaar (Central body, Pearl Necklaces, Velvet Shringaar)
  await sharp(srcImg)
    .extract({
      left: Math.round(W * 0.12),
      top: Math.round(H * 0.20),
      width: Math.round(W * 0.76),
      height: Math.round(H * 0.60),
    })
    .resize(800, 1000, { fit: 'cover' })
    .jpeg({ quality: 92 })
    .toFile(path.join(outDir, 'sandhya-aarti-shringaar.jpg'));

  // 5. Annakoot Manorath (Lower & mid sanctum with offerings)
  await sharp(srcImg)
    .extract({
      left: Math.round(W * 0.08),
      top: Math.round(H * 0.35),
      width: Math.round(W * 0.84),
      height: Math.round(H * 0.62),
    })
    .resize(800, 1000, { fit: 'cover' })
    .jpeg({ quality: 92 })
    .toFile(path.join(outDir, 'annakoot-manorath.jpg'));

  // 6. Chhappan Bhog Grand Festive (Broad view of the entire sanctum)
  await sharp(srcImg)
    .extract({
      left: Math.round(W * 0.05),
      top: Math.round(H * 0.10),
      width: Math.round(W * 0.90),
      height: Math.round(H * 0.85),
    })
    .resize(800, 1000, { fit: 'cover' })
    .jpeg({ quality: 92 })
    .toFile(path.join(outDir, 'chhappan-bhog-sanctum.jpg'));

  // 7. Mor Kuti Peacock Pichwai (Upper crown, peacock feather & prabhavali)
  await sharp(srcImg)
    .extract({
      left: Math.round(W * 0.10),
      top: Math.round(H * 0.05),
      width: Math.round(W * 0.80),
      height: Math.round(H * 0.45),
    })
    .resize(800, 1000, { fit: 'cover' })
    .jpeg({ quality: 92 })
    .toFile(path.join(outDir, 'mor-kuti-shringaar.jpg'));

  // 8. Navneet Priyaji Swaroop (Beloved child swaroop adornment detail)
  await sharp(srcImg)
    .extract({
      left: Math.round(W * 0.20),
      top: Math.round(H * 0.25),
      width: Math.round(W * 0.60),
      height: Math.round(H * 0.50),
    })
    .resize(800, 1000, { fit: 'cover' })
    .jpeg({ quality: 92 })
    .toFile(path.join(outDir, 'navneet-priyaji-detail.jpg'));

  // Also copy the full image as shreenathji-shrine.jpg
  await sharp(srcImg)
    .resize(900, 1341, { fit: 'cover' })
    .jpeg({ quality: 94 })
    .toFile(path.join(outDir, 'shreenathji-shrine.jpg'));

  console.log('All authentic Shreenathji photo crops generated successfully.');
}

generateCrops().catch(console.error);
