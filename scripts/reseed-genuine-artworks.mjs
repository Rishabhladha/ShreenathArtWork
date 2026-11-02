import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const genuineArtworks = [
  {
    title: "Shreenathji Kamal Talai Pichwai",
    slug: "shreenathji-kamal-talai-pichwai",
    categorySlug: "pichwai",
    image: "/artworks/kamal-talai.svg",
    description: "Traditional lotus pond Pichwai showing Shreenathji surrounded by blooming kamal (lotuses) and sacred cows. Hand painted using natural mineral and vegetable pigments on handspun cotton cloth.",
    medium: "Natural stone and vegetable pigments on cotton cloth",
    dimensions: "36 x 48 inches (91 x 122 cm)",
    careInstructions: "Keep away from direct moisture and harsh sunlight. Dust gently with a clean dry microfiber cloth.",
    tags: "Pichwai, Kamal Talai, Lotus, Mineral Pigment",
    featured: true,
    variants: [
      { size: "24 x 36 in", frame: "Unframed / Rolled", price: 1800000, mrp: 2100000, sku: "KT-2436-UF", stock: 4, isDefault: true },
      { size: "24 x 36 in", frame: "Teak Wood Frame", price: 2350000, mrp: 2700000, sku: "KT-2436-TW", stock: 2, isDefault: false },
      { size: "36 x 48 in", frame: "Unframed / Rolled", price: 3200000, mrp: 3600000, sku: "KT-3648-UF", stock: 3, isDefault: false },
      { size: "36 x 48 in", frame: "Antique Gold Frame", price: 3950000, mrp: 4400000, sku: "KT-3648-AG", stock: 1, isDefault: false },
    ],
  },
  {
    title: "Annakoot Manorath Shringaar Painting",
    slug: "annakoot-manorath-shringaar-painting",
    categorySlug: "festival-and-utsav",
    image: "/artworks/annakoot.svg",
    description: "Detailed celebration of the Govardhan Puja Annakoot festival. Depicts the grand mountain of food offerings and the jewel-adorned divine attire in deep vermillion and gold.",
    medium: "Gold foil and natural stone pigment on primed cotton",
    dimensions: "30 x 40 inches (76 x 102 cm)",
    careInstructions: "Display under conservation acrylic or glass. Avoid humid walls.",
    tags: "Annakoot, Govardhan, Utsav, Gold Foil",
    featured: true,
    variants: [
      { size: "20 x 30 in", frame: "Unframed / Rolled", price: 1550000, mrp: 1800000, sku: "AK-2030-UF", stock: 5, isDefault: true },
      { size: "20 x 30 in", frame: "Rosewood Finish Frame", price: 2050000, mrp: 2400000, sku: "AK-2030-RF", stock: 3, isDefault: false },
      { size: "30 x 40 in", frame: "Teak Wood Frame", price: 3400000, mrp: 3800000, sku: "AK-3040-TW", stock: 2, isDefault: false },
    ],
  },
  {
    title: "Classical Shreenathji Mukharvind Portrait",
    slug: "classical-shreenathji-mukharvind-portrait",
    categorySlug: "shreenathji-portraits",
    image: "/artworks/mukharvind.svg",
    description: "A close devotional portrait focusing on the divine lotus face (Mukharvind), the diamond on the chin, and the peacock feather crown. Subtle shading and devotional stillness.",
    medium: "Tempera and gold leaf on handmade wasli paper",
    dimensions: "18 x 24 inches (45 x 60 cm)",
    careInstructions: "Framed under non-reflective glass recommended. Clean frame with dry lint-free cloth.",
    tags: "Mukharvind, Sanctum, Wasli, Gold Leaf",
    featured: true,
    variants: [
      { size: "14 x 18 in", frame: "Antique Gold Frame", price: 1250000, mrp: 1450000, sku: "MK-1418-AG", stock: 6, isDefault: true },
      { size: "18 x 24 in", frame: "Teak Wood Frame", price: 1750000, mrp: 2000000, sku: "MK-1824-TW", stock: 3, isDefault: false },
    ],
  },
  {
    title: "Sharad Purnima Raas Pichwai",
    slug: "sharad-purnima-raas-pichwai",
    categorySlug: "festival-and-utsav",
    image: "/artworks/sharad-purnima.svg",
    description: "Depicting the autumn full moon night (Sharad Purnima) where Shreenathji stands under kadamba trees along the Yamuna river. The moon and silver river details use authentic silver and mineral paint.",
    medium: "Silver foil and mineral colors on indigo dyed cotton",
    dimensions: "48 x 60 inches (122 x 152 cm)",
    careInstructions: "Keep away from direct sunlight. Handle edges carefully when unrolling.",
    tags: "Sharad Purnima, Raas, Indigo, Silver",
    featured: true,
    variants: [
      { size: "36 x 48 in", frame: "Unframed / Rolled", price: 3800000, mrp: 4200000, sku: "SP-3648-UF", stock: 2, isDefault: true },
      { size: "48 x 60 in", frame: "Teak Wood Frame", price: 5800000, mrp: 6500000, sku: "SP-4860-TW", stock: 1, isDefault: false },
    ],
  },
  {
    title: "Gau Charan Miniature Sanctum Painting",
    slug: "gau-charan-miniature-sanctum-painting",
    categorySlug: "miniature-art",
    image: "/artworks/gau-charan.svg",
    description: "Intricate Mewar school miniature showing Shreenathji as child Krishna tending cows in the pastures of Vraja. Features fine single-hair brush work in cows and foliage.",
    medium: "Stone pigment and 24kt gold dust on handmade wasli",
    dimensions: "12 x 16 inches (30 x 40 cm)",
    careInstructions: "Keep framed under UV protection glass.",
    tags: "Miniature, Gau Charan, Mewar School, 24kt Gold",
    featured: false,
    variants: [
      { size: "10 x 14 in", frame: "Teak Wood Frame", price: 950000, mrp: 1100000, sku: "GC-1014-TW", stock: 4, isDefault: true },
      { size: "12 x 16 in", frame: "Antique Gold Frame", price: 1350000, mrp: 1550000, sku: "GC-1216-AG", stock: 3, isDefault: false },
    ],
  },
  {
    title: "Chhappan Bhog Grand Festive Pichwai",
    slug: "chhappan-bhog-grand-festive-pichwai",
    categorySlug: "large-format",
    image: "/artworks/chhappan-bhog.svg",
    description: "Magnificent large canvas Pichwai detailing the sacred 56 bhog food preparations offered to Shreenathji. A centerpiece artwork meant for temple altars and expansive living spaces.",
    medium: "Natural mineral pigments and pure gold leaf on handwoven canvas",
    dimensions: "60 x 72 inches (152 x 183 cm)",
    careInstructions: "Professional art installation recommended. Maintain room temperature between 18 and 28 degrees Celsius.",
    tags: "Chhappan Bhog, Grand Canvas, Gold Leaf, Collector Piece",
    featured: true,
    variants: [
      { size: "48 x 60 in", frame: "Unframed / Rolled", price: 6500000, mrp: 7200000, sku: "CB-4860-UF", stock: 1, isDefault: true },
      { size: "60 x 72 in", frame: "Antique Gold Frame", price: 9200000, mrp: 10500000, sku: "CB-6072-AG", stock: 1, isDefault: false },
    ],
  },
  {
    title: "Shreenathji with Ashta Sakhas Miniature",
    slug: "shreenathji-with-ashta-sakhas-miniature",
    categorySlug: "miniature-art",
    image: "/artworks/ashta-sakha.svg",
    description: "Miniature composition presenting the Lord with the eight principal cowherd companions. Richly detailed borders with floral motifs in Rajasthani traditional style.",
    medium: "Natural colors and gold accents on paper",
    dimensions: "14 x 18 inches (35 x 45 cm)",
    careInstructions: "Store flat or display framed in low humidity environment.",
    tags: "Ashta Sakha, Miniature, Rajasthani Border",
    featured: false,
    variants: [
      { size: "11 x 14 in", frame: "Unframed / Mount Board", price: 780000, mrp: 900000, sku: "AS-1114-MB", stock: 5, isDefault: true },
      { size: "14 x 18 in", frame: "Rosewood Finish Frame", price: 1180000, mrp: 1350000, sku: "AS-1418-RF", stock: 2, isDefault: false },
    ],
  },
  {
    title: "Shrimad Vallabhacharya and Shreenathji Darshan",
    slug: "vallabhacharya-shreenathji-darshan",
    categorySlug: "shreenathji-portraits",
    image: "/artworks/vallabhacharya.svg",
    description: "Depicting the historic appearance and darshan of Shreenathji to Mahaprabhu Vallabhacharya on Mount Govardhan. Deep spiritual presence rendered in quiet earth tones.",
    medium: "Stone pigment on hand-spun khadi cotton",
    dimensions: "24 x 32 inches (60 x 81 cm)",
    careInstructions: "Dust periodically with dry brush. Keep away from water.",
    tags: "Vallabhacharya, Govardhan, Khadi Cotton, Pushtimarg",
    featured: false,
    variants: [
      { size: "20 x 28 in", frame: "Unframed / Rolled", price: 1400000, mrp: 1650000, sku: "VD-2028-UF", stock: 3, isDefault: true },
      { size: "24 x 32 in", frame: "Teak Wood Frame", price: 1950000, mrp: 2250000, sku: "VD-2432-TW", stock: 2, isDefault: false },
    ],
  },
  {
    title: "Mor Kuti Pichwai (Peacock Dance of Barsana)",
    slug: "mor-kuti-peacock-dance-pichwai",
    categorySlug: "pichwai",
    image: "/artworks/mor-kuti.svg",
    description: "Celebrated monsoon Pichwai depicting Shreenathji amidst dancing peacocks under gathering rainclouds. Hand painted with traditional ground malachite green, lapis lazuli indigo, and gold leaf highlights.",
    medium: "Natural mineral pigment and 24kt gold foil on handspun cotton",
    dimensions: "40 x 52 inches (102 x 132 cm)",
    careInstructions: "Protect from moisture and damp walls. Dust frame with soft camel hair brush.",
    tags: "Mor Kuti, Monsoon, Peacock, Malachite Green, Pichwai",
    featured: true,
    variants: [
      { size: "30 x 40 in", frame: "Unframed / Rolled", price: 2900000, mrp: 3300000, sku: "MK-3040-UF", stock: 3, isDefault: true },
      { size: "30 x 40 in", frame: "Antique Teak Wood Frame", price: 3600000, mrp: 4100000, sku: "MK-3040-ATW", stock: 2, isDefault: false },
      { size: "40 x 52 in", frame: "Gold Leaf Carved Frame", price: 4800000, mrp: 5500000, sku: "MK-4052-GLC", stock: 1, isDefault: false },
    ],
  },
  {
    title: "Sandhya Aarti Darshan Shringaar",
    slug: "sandhya-aarti-darshan-shringaar",
    categorySlug: "shreenathji-portraits",
    image: "/artworks/sandhya-aarti.svg",
    description: "Capturing the serene and luminous atmosphere of the evening Sandhya Aarti at the Nathdwara Haveli. Detailed rendering of the sacred shringaar, pearl garlands, emerald chibuk (chin stone), and radiant halo.",
    medium: "Stone colors and real silver and gold foil on primed cloth",
    dimensions: "24 x 36 inches (61 x 91 cm)",
    careInstructions: "Frame with anti-reflective conservation glass. Do not hang in direct harsh lighting.",
    tags: "Sandhya Aarti, Haveli Darshan, Shringaar, Sanctum Art",
    featured: true,
    variants: [
      { size: "18 x 26 in", frame: "Unframed / Rolled", price: 1650000, mrp: 1900000, sku: "SA-1826-UF", stock: 4, isDefault: true },
      { size: "18 x 26 in", frame: "Rosewood Finish Frame", price: 2150000, mrp: 2500000, sku: "SA-1826-RF", stock: 3, isDefault: false },
      { size: "24 x 36 in", frame: "Antique Gold Frame", price: 2850000, mrp: 3300000, sku: "SA-2436-AG", stock: 2, isDefault: false },
    ],
  },
  {
    title: "Dan Ghal Manorath Pichwai",
    slug: "dan-ghal-manorath-pichwai",
    categorySlug: "festival-and-utsav",
    image: "/artworks/dan-ghal.svg",
    description: "Classical narrative Pichwai portraying the Dan Lila on Govardhan hill. Shreenathji stands in majestic stance surrounded by the Braj gopis carrying curd pots, framed by a border of cows and Kadamba trees.",
    medium: "Organic vegetable dyes and mineral colors on cotton",
    dimensions: "48 x 64 inches (122 x 163 cm)",
    careInstructions: "Keep in a dry, ventilated indoor room. Avoid chemical glass sprays on the frame.",
    tags: "Dan Lila, Govardhan, Braj, Pichwai, Traditional Art",
    featured: false,
    variants: [
      { size: "36 x 48 in", frame: "Unframed / Rolled", price: 3400000, mrp: 3900000, sku: "DG-3648-UF", stock: 2, isDefault: true },
      { size: "48 x 64 in", frame: "Teak Wood Frame", price: 5200000, mrp: 5900000, sku: "DG-4864-TW", stock: 1, isDefault: false },
    ],
  },
  {
    title: "Navneet Priyaji Swaroop Miniature",
    slug: "navneet-priyaji-swaroop-miniature",
    categorySlug: "miniature-art",
    image: "/artworks/navneet-priyaji.svg",
    description: "Exquisite miniature study of Shri Navneet Priyaji crawling with the ball of fresh butter. Rendered in traditional Mewari miniature style with single-hair brush precision and authentic 24kt gold ornamentation.",
    medium: "Stone pigment and 24kt gold on handmade wasli paper",
    dimensions: "10 x 13 inches (25 x 33 cm)",
    careInstructions: "Store framed under non-glare museum acrylic. Keep away from humidity.",
    tags: "Navneet Priyaji, Mewar Miniature, Gold Detailing, Wasli",
    featured: true,
    variants: [
      { size: "8 x 10 in", frame: "Teak Wood Frame", price: 850000, mrp: 990000, sku: "NP-0810-TW", stock: 5, isDefault: true },
      { size: "10 x 13 in", frame: "Carved Antique Gold Frame", price: 1250000, mrp: 1450000, sku: "NP-1013-CAG", stock: 3, isDefault: false },
    ],
  },
  {
    title: "Vasant Utsav Phag Khel Pichwai",
    slug: "vasant-utsav-phag-khel-pichwai",
    categorySlug: "festival-and-utsav",
    image: "/artworks/vasant-utsav.svg",
    description: "Festive celebration of Vasant Panchami and Dolotsav. Shreenathji wearing white shringaar dusted with natural fragrant abir and pink gulal colors, set against flowering trees and spring blossoms.",
    medium: "Natural pigments with herbal abir tones on cotton canvas",
    dimensions: "36 x 48 inches (91 x 122 cm)",
    careInstructions: "Dust regularly with soft dry feather duster. Do not wipe with water.",
    tags: "Vasant, Dolotsav, Gulal, Phag Khel, Spring Utsav",
    featured: false,
    variants: [
      { size: "28 x 38 in", frame: "Unframed / Rolled", price: 2400000, mrp: 2800000, sku: "VU-2838-UF", stock: 4, isDefault: true },
      { size: "36 x 48 in", frame: "Teak Wood Frame", price: 3300000, mrp: 3800000, sku: "VU-3648-TW", stock: 2, isDefault: false },
    ],
  },
  {
    title: "Kaliya Daman Sacred Haveli Composition",
    slug: "kaliya-daman-sacred-haveli-composition",
    categorySlug: "large-format",
    image: "/artworks/kaliya-daman.svg",
    description: "Magnificent large sanctum artwork portraying Shri Krishna dancing triumphantly upon the multiple hoods of serpent Kaliya in the Yamuna. Surrounding panel features weeping Nagapatnis pleading with folded hands.",
    medium: "Natural mineral colors and gold leaf on treated linen",
    dimensions: "54 x 70 inches (137 x 178 cm)",
    careInstructions: "Professional hanging required. Do not place above heating or air conditioner vents.",
    tags: "Kaliya Daman, Yamuna, Large Format, Haveli Artwork",
    featured: true,
    variants: [
      { size: "42 x 54 in", frame: "Unframed / Rolled", price: 5400000, mrp: 6100000, sku: "KD-4254-UF", stock: 2, isDefault: true },
      { size: "54 x 70 in", frame: "Antique Carved Teak Frame", price: 7800000, mrp: 8800000, sku: "KD-5470-ACT", stock: 1, isDefault: false },
    ],
  },
];

async function run() {
  console.log("Cleaning old demo products from MongoDB Atlas...");
  // Delete all old order items, reviews, wishlist items, product images and variants attached to old products
  await prisma.productImage.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  console.log("Old products cleared.");

  // Fetch category map
  const categories = await prisma.category.findMany();
  const catMap = new Map(categories.map((c) => [c.slug, c.id]));

  // Ensure announcement bar is disabled in SiteSettings
  await prisma.siteSettings.upsert({
    where: { key: "default" },
    update: {
      announcementBarActive: false,
      announcementBarText: null,
    },
    create: {
      key: "default",
      businessName: "SHREENATH ART WORK",
      address: "Opposite Temple Gate, Nathdwara, Rajasthan 313301",
      phone: "9079901405",
      email: "shreenathartwork@gmail.com",
      announcementBarActive: false,
      announcementBarText: null,
    },
  });
  console.log("Announcement bar disabled.");

  for (const item of genuineArtworks) {
    const categoryId = catMap.get(item.categorySlug);
    if (!categoryId) {
      console.warn(`Category not found for slug: ${item.categorySlug}`);
      continue;
    }

    const created = await prisma.product.create({
      data: {
        title: item.title,
        slug: item.slug,
        description: item.description,
        categoryId,
        medium: item.medium,
        dimensions: item.dimensions,
        careInstructions: item.careInstructions,
        tags: item.tags,
        featured: item.featured,
        status: 'ACTIVE',
        seoTitle: `${item.title} | SHREENATH ART WORK`,
        seoDescription: `Handcrafted Pichwai devotional painting from Nathdwara: ${item.title}.`,
        images: {
          create: [
            {
              url: item.image,
              altText: `${item.title} - Handcrafted Painting in Nathdwara`,
              displayOrder: 0,
              isPrimary: true,
            },
          ],
        },
        variants: {
          create: item.variants.map((v) => ({
            size: v.size,
            frame: v.frame,
            price: v.price,
            mrp: v.mrp,
            sku: v.sku,
            stock: v.stock,
            isDefault: v.isDefault,
          })),
        },
      },
    });

    console.log(`Created genuine artwork: ${created.title} (${created.slug})`);
  }

  console.log("All 14 genuine artworks seeded successfully in MongoDB Atlas!");
}

run()
  .catch((e) => {
    console.error("Reseed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

