import { PrismaClient, Role, ProductStatus, CouponDiscountType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Seed Admin from Environment
  const adminEmail = process.env.ADMIN_EMAIL || "owner@shreenathartwork.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "AdminPassword2026!";
  const adminName = process.env.ADMIN_NAME || "Gallery Curator";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      passwordHash,
      role: Role.OWNER,
      isActive: true,
    },
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash,
      role: Role.OWNER,
      phone: "9079901405",
      isActive: true,
    },
  });
  console.log(`Admin user ensured: ${admin.email}`);

  // 2. Seed Default Site Settings
  await prisma.siteSettings.upsert({
    where: { key: "default" },
    update: {
      businessName: "SHREENATH ART WORK",
      address: "Opposite Temple Gate, Nathdwara, Rajasthan 313301",
      phone: "9079901405",
      email: "shreenathartwork@gmail.com",
      openingHours: "Monday to Sunday: 9:00 AM to 8:30 PM",
      instagramUrl: "https://instagram.com/shreenathartwork",
      facebookUrl: "",
      freeShippingThreshold: 500000, // Rs 5,000 in paise
      standardShippingCharge: 25000, // Rs 250 in paise
      gstEnabled: true,
      gstRatePercent: 12,
      codEnabled: true,
      paymentModeDisplay: "Razorpay Secure (UPI, Cards, Netbanking)",
      announcementBarText: "Free insured shipping across India on all paintings above Rs 5,000.",
      announcementBarActive: true,
      policyTerms: "Standard gallery terms apply. All artworks are handcrafted in Nathdwara.",
      policyPrivacy: "We respect your privacy under the Digital Personal Data Protection Act 2023.",
      policyShipping: "Standard delivery time is 5 to 7 business days for framed works.",
    },
    create: {
      key: "default",
      businessName: "SHREENATH ART WORK",
      address: "Opposite Temple Gate, Nathdwara, Rajasthan 313301",
      phone: "9079901405",
      email: "shreenathartwork@gmail.com",
      openingHours: "Monday to Sunday: 9:00 AM to 8:30 PM",
      instagramUrl: "https://instagram.com/shreenathartwork",
      facebookUrl: "",
      freeShippingThreshold: 500000,
      standardShippingCharge: 25000,
      gstEnabled: true,
      gstRatePercent: 12,
      codEnabled: true,
      paymentModeDisplay: "Razorpay Secure (UPI, Cards, Netbanking)",
      announcementBarText: "Free insured shipping across India on all paintings above Rs 5,000.",
      announcementBarActive: true,
      policyTerms: "Standard gallery terms apply. All artworks are handcrafted in Nathdwara.",
      policyPrivacy: "We respect your privacy under the Digital Personal Data Protection Act 2023.",
      policyShipping: "Standard delivery time is 5 to 7 business days for framed works.",
    },
  });
  console.log("Site settings seeded.");

  // 3. Seed Categories
  const categoriesData = [
    {
      name: "Pichwai",
      slug: "pichwai",
      description: "Traditional cloth hanging paintings depicting Shreenathji in various seasonal appearances and moods.",
      displayOrder: 1,
    },
    {
      name: "Shreenathji Portraits",
      slug: "shreenathji-portraits",
      description: "Classical devotional sanctum portraits capturing the sacred posture, shringaar, and divine grace.",
      displayOrder: 2,
    },
    {
      name: "Festival and Utsav",
      slug: "festival-and-utsav",
      description: "Artworks celebrating sacred temple festivities including Annakoot, Sharad Purnima, Janmashtami, and Holi.",
      displayOrder: 3,
    },
    {
      name: "Miniature Art",
      slug: "miniature-art",
      description: "Intricate miniature paintings created with squirrel hair brushes and real stone pigment on handmade paper.",
      displayOrder: 4,
    },
    {
      name: "Large Format Works",
      slug: "large-format",
      description: "Statement sanctum artworks crafted for home temples, cultural spaces, and spacious interiors.",
      displayOrder: 5,
    },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap.set(cat.slug, c.id);
  }
  console.log("Categories seeded.");

  // 4. Seed 8 Demo Products
  const placeholderImg = "/placeholder-artwork.svg";

  const productsData = [
    {
      title: "DEMO: Shreenathji Kamal Talai Pichwai",
      slug: "demo-shreenathji-kamal-talai-pichwai",
      categorySlug: "pichwai",
      description: "Traditional lotus pond Pichwai showing Shreenathji surrounded by blooming kamal (lotuses) and sacred cows. Hand painted using natural mineral and vegetable pigments on handspun cotton cloth.",
      medium: "Natural stone and vegetable pigments on cotton cloth",
      dimensions: "36 x 48 inches (91 x 122 cm)",
      careInstructions: "Keep away from direct moisture and harsh sunlight. Dust gently with a clean dry microfiber cloth.",
      tags: "Pichwai, Kamal Talai, Lotus, Mineral Pigment",
      featured: true,
      status: ProductStatus.ACTIVE,
      variants: [
        { size: "24 x 36 in", frame: "Unframed / Rolled", price: 1800000, mrp: 2100000, sku: "DEMO-KT-2436-UF", stock: 4, isDefault: true },
        { size: "24 x 36 in", frame: "Teak Wood Frame", price: 2350000, mrp: 2700000, sku: "DEMO-KT-2436-TW", stock: 2, isDefault: false },
        { size: "36 x 48 in", frame: "Unframed / Rolled", price: 3200000, mrp: 3600000, sku: "DEMO-KT-3648-UF", stock: 3, isDefault: false },
        { size: "36 x 48 in", frame: "Antique Gold Frame", price: 3950000, mrp: 4400000, sku: "DEMO-KT-3648-AG", stock: 1, isDefault: false },
      ],
    },
    {
      title: "DEMO: Annakoot Manorath Shringaar Painting",
      slug: "demo-annakoot-manorath-shringaar-painting",
      categorySlug: "festival-and-utsav",
      description: "Detailed celebration of the Govardhan Puja Annakoot festival. Depicts the grand mountain of food offerings and the jewel-adorned divine attire in deep vermillion and gold.",
      medium: "Gold foil and natural stone pigment on primed cotton",
      dimensions: "30 x 40 inches (76 x 102 cm)",
      careInstructions: "Display under conservation acrylic or glass. Avoid humid walls.",
      tags: "Annakoot, Govardhan, Utsav, Gold Foil",
      featured: true,
      status: ProductStatus.ACTIVE,
      variants: [
        { size: "20 x 30 in", frame: "Unframed / Rolled", price: 1550000, mrp: 1800000, sku: "DEMO-AK-2030-UF", stock: 5, isDefault: true },
        { size: "20 x 30 in", frame: "Rosewood Finish Frame", price: 2050000, mrp: 2400000, sku: "DEMO-AK-2030-RF", stock: 3, isDefault: false },
        { size: "30 x 40 in", frame: "Teak Wood Frame", price: 3400000, mrp: 3800000, sku: "DEMO-AK-3040-TW", stock: 2, isDefault: false },
      ],
    },
    {
      title: "DEMO: Classical Shreenathji Mukharvind Portrait",
      slug: "demo-classical-shreenathji-mukharvind-portrait",
      categorySlug: "shreenathji-portraits",
      description: "A close devotional portrait focusing on the divine lotus face (Mukharvind), the diamond on the chin, and the peacock feather crown. Subtle shading and devotional stillness.",
      medium: "Tempera and gold leaf on handmade wasli paper",
      dimensions: "18 x 24 inches (45 x 60 cm)",
      careInstructions: "Framed under non-reflective glass recommended. Clean frame with dry lint-free cloth.",
      tags: "Mukharvind, Sanctum, Wasli, Gold Leaf",
      featured: true,
      status: ProductStatus.ACTIVE,
      variants: [
        { size: "14 x 18 in", frame: "Antique Gold Frame", price: 1250000, mrp: 1450000, sku: "DEMO-MK-1418-AG", stock: 6, isDefault: true },
        { size: "18 x 24 in", frame: "Teak Wood Frame", price: 1750000, mrp: 2000000, sku: "DEMO-MK-1824-TW", stock: 3, isDefault: false },
      ],
    },
    {
      title: "DEMO: Sharad Purnima Raas Pichwai",
      slug: "demo-sharad-purnima-raas-pichwai",
      categorySlug: "festival-and-utsav",
      description: "Depicting the autumn full moon night (Sharad Purnima) where Shreenathji stands under kadamba trees along the Yamuna river. The moon and silver river details use authentic silver and mineral paint.",
      medium: "Silver foil and mineral colors on indigo dyed cotton",
      dimensions: "48 x 60 inches (122 x 152 cm)",
      careInstructions: "Keep away from direct sunlight. Handle edges carefully when unrolling.",
      tags: "Sharad Purnima, Raas, Indigo, Silver",
      featured: true,
      status: ProductStatus.ACTIVE,
      variants: [
        { size: "36 x 48 in", frame: "Unframed / Rolled", price: 3800000, mrp: 4200000, sku: "DEMO-SP-3648-UF", stock: 2, isDefault: true },
        { size: "48 x 60 in", frame: "Teak Wood Frame", price: 5800000, mrp: 6500000, sku: "DEMO-SP-4860-TW", stock: 1, isDefault: false },
      ],
    },
    {
      title: "DEMO: Gau Charan Miniature Sanctum Painting",
      slug: "demo-gau-charan-miniature-sanctum-painting",
      categorySlug: "miniature-art",
      description: "Intricate Mewar school miniature showing Shreenathji as child Krishna tending cows in the pastures of Vraja. Features fine single-hair brush work in cows and foliage.",
      medium: "Stone pigment and 24kt gold dust on handmade wasli",
      dimensions: "12 x 16 inches (30 x 40 cm)",
      careInstructions: "Keep framed under UV protection glass.",
      tags: "Miniature, Gau Charan, Mewar School, 24kt Gold",
      featured: false,
      status: ProductStatus.ACTIVE,
      variants: [
        { size: "10 x 14 in", frame: "Teak Wood Frame", price: 950000, mrp: 1100000, sku: "DEMO-GC-1014-TW", stock: 4, isDefault: true },
        { size: "12 x 16 in", frame: "Antique Gold Frame", price: 1350000, mrp: 1550000, sku: "DEMO-GC-1216-AG", stock: 3, isDefault: false },
      ],
    },
    {
      title: "DEMO: Chhappan Bhog Grand Festive Pichwai",
      slug: "demo-chhappan-bhog-grand-festive-pichwai",
      categorySlug: "large-format",
      description: "Magnificent large canvas Pichwai detailing the sacred 56 bhog food preparations offered to Shreenathji. A centerpiece artwork meant for temple altars and expansive living spaces.",
      medium: "Natural mineral pigments and pure gold leaf on handwoven canvas",
      dimensions: "60 x 72 inches (152 x 183 cm)",
      careInstructions: "Professional art installation recommended. Maintain room temperature between 18 and 28 degrees Celsius.",
      tags: "Chhappan Bhog, Grand Canvas, Gold Leaf, Collector Piece",
      featured: true,
      status: ProductStatus.ACTIVE,
      variants: [
        { size: "48 x 60 in", frame: "Unframed / Rolled", price: 6500000, mrp: 7200000, sku: "DEMO-CB-4860-UF", stock: 1, isDefault: true },
        { size: "60 x 72 in", frame: "Antique Gold Frame", price: 9200000, mrp: 10500000, sku: "DEMO-CB-6072-AG", stock: 1, isDefault: false },
      ],
    },
    {
      title: "DEMO: Shreenathji with Ashta Sakhas Miniature",
      slug: "demo-shreenathji-with-ashta-sakhas-miniature",
      categorySlug: "miniature-art",
      description: "Miniature composition presenting the Lord with the eight principal cowherd companions. Richly detailed borders with floral motifs in Rajasthani traditional style.",
      medium: "Natural colors and gold accents on paper",
      dimensions: "14 x 18 inches (35 x 45 cm)",
      careInstructions: "Store flat or display framed in low humidity environment.",
      tags: "Ashta Sakha, Miniature, Rajasthani Border",
      featured: false,
      status: ProductStatus.ACTIVE,
      variants: [
        { size: "11 x 14 in", frame: "Unframed / Mount Board", price: 780000, mrp: 900000, sku: "DEMO-AS-1114-MB", stock: 5, isDefault: true },
        { size: "14 x 18 in", frame: "Rosewood Finish Frame", price: 1180000, mrp: 1350000, sku: "DEMO-AS-1418-RF", stock: 2, isDefault: false },
      ],
    },
    {
      title: "DEMO: Shrimad Vallabhacharya and Shreenathji Darshan",
      slug: "demo-vallabhacharya-shreenathji-darshan",
      categorySlug: "shreenathji-portraits",
      description: "Depicting the historic appearance and darshan of Shreenathji to Mahaprabhu Vallabhacharya on Mount Govardhan. Deep spiritual presence rendered in quiet earth tones.",
      medium: "Stone pigment on hand-spun khadi cotton",
      dimensions: "24 x 32 inches (60 x 81 cm)",
      careInstructions: "Dust periodically with dry brush. Keep away from water.",
      tags: "Vallabhacharya, Govardhan, Khadi Cotton, Pushtimarg",
      featured: false,
      status: ProductStatus.ACTIVE,
      variants: [
        { size: "20 x 28 in", frame: "Unframed / Rolled", price: 1400000, mrp: 1650000, sku: "DEMO-VD-2028-UF", stock: 3, isDefault: true },
        { size: "24 x 32 in", frame: "Teak Wood Frame", price: 1950000, mrp: 2250000, sku: "DEMO-VD-2432-TW", stock: 2, isDefault: false },
      ],
    },
    {
      title: "DEMO: Mor Kuti Pichwai (Peacock Dance of Barsana)",
      slug: "demo-mor-kuti-peacock-dance-pichwai",
      categorySlug: "pichwai",
      description: "Celebrated monsoon Pichwai depicting Shreenathji amidst dancing peacocks under gathering rainclouds. Hand painted with traditional ground malachite green, lapis lazuli indigo, and gold leaf highlights.",
      medium: "Natural mineral pigment and 24kt gold foil on handspun cotton",
      dimensions: "40 x 52 inches (102 x 132 cm)",
      careInstructions: "Protect from moisture and damp walls. Dust frame with soft camel hair brush.",
      tags: "Mor Kuti, Monsoon, Peacock, Malachite Green, Pichwai",
      featured: true,
      status: ProductStatus.ACTIVE,
      variants: [
        { size: "30 x 40 in", frame: "Unframed / Rolled", price: 2900000, mrp: 3300000, sku: "DEMO-MK-3040-UF", stock: 3, isDefault: true },
        { size: "30 x 40 in", frame: "Antique Teak Wood Frame", price: 3600000, mrp: 4100000, sku: "DEMO-MK-3040-ATW", stock: 2, isDefault: false },
        { size: "40 x 52 in", frame: "Gold Leaf Carved Frame", price: 4800000, mrp: 5500000, sku: "DEMO-MK-4052-GLC", stock: 1, isDefault: false },
      ],
    },
    {
      title: "DEMO: Sandhya Aarti Darshan Shringaar",
      slug: "demo-sandhya-aarti-darshan-shringaar",
      categorySlug: "shreenathji-portraits",
      description: "Capturing the serene and luminous atmosphere of the evening Sandhya Aarti at the Nathdwara Haveli. Detailed rendering of the sacred shringaar, pearl garlands, emerald chibuk (chin stone), and radiant halo.",
      medium: "Stone colors and real silver and gold foil on primed cloth",
      dimensions: "24 x 36 inches (61 x 91 cm)",
      careInstructions: "Frame with anti-reflective conservation glass. Do not hang in direct harsh lighting.",
      tags: "Sandhya Aarti, Haveli Darshan, Shringaar, Sanctum Art",
      featured: true,
      status: ProductStatus.ACTIVE,
      variants: [
        { size: "18 x 26 in", frame: "Unframed / Rolled", price: 1650000, mrp: 1900000, sku: "DEMO-SA-1826-UF", stock: 4, isDefault: true },
        { size: "18 x 26 in", frame: "Rosewood Finish Frame", price: 2150000, mrp: 2500000, sku: "DEMO-SA-1826-RF", stock: 3, isDefault: false },
        { size: "24 x 36 in", frame: "Antique Gold Frame", price: 2850000, mrp: 3300000, sku: "DEMO-SA-2436-AG", stock: 2, isDefault: false },
      ],
    },
    {
      title: "DEMO: Dan Ghal Manorath Pichwai",
      slug: "demo-dan-ghal-manorath-pichwai",
      categorySlug: "festival-and-utsav",
      description: "Classical narrative Pichwai portraying the Dan Lila on Govardhan hill. Shreenathji stands in majestic stance surrounded by the Braj gopis carrying curd pots, framed by a border of cows and Kadamba trees.",
      medium: "Organic vegetable dyes and mineral colors on cotton",
      dimensions: "48 x 64 inches (122 x 163 cm)",
      careInstructions: "Keep in a dry, ventilated indoor room. Avoid chemical glass sprays on the frame.",
      tags: "Dan Lila, Govardhan, Braj, Pichwai, Traditional Art",
      featured: false,
      status: ProductStatus.ACTIVE,
      variants: [
        { size: "36 x 48 in", frame: "Unframed / Rolled", price: 3400000, mrp: 3900000, sku: "DEMO-DG-3648-UF", stock: 2, isDefault: true },
        { size: "48 x 64 in", frame: "Teak Wood Frame", price: 5200000, mrp: 5900000, sku: "DEMO-DG-4864-TW", stock: 1, isDefault: false },
      ],
    },
    {
      title: "DEMO: Navneet Priyaji Swaroop Miniature",
      slug: "demo-navneet-priyaji-swaroop-miniature",
      categorySlug: "miniature-art",
      description: "Exquisite miniature study of Shri Navneet Priyaji crawling with the ball of fresh butter. Rendered in traditional Mewari miniature style with single-hair brush precision and authentic 24kt gold ornamentation.",
      medium: "Stone pigment and 24kt gold on handmade wasli paper",
      dimensions: "10 x 13 inches (25 x 33 cm)",
      careInstructions: "Store framed under non-glare museum acrylic. Keep away from humidity.",
      tags: "Navneet Priyaji, Mewar Miniature, Gold Detailing, Wasli",
      featured: true,
      status: ProductStatus.ACTIVE,
      variants: [
        { size: "8 x 10 in", frame: "Teak Wood Frame", price: 850000, mrp: 990000, sku: "DEMO-NP-0810-TW", stock: 5, isDefault: true },
        { size: "10 x 13 in", frame: "Carved Antique Gold Frame", price: 1250000, mrp: 1450000, sku: "DEMO-NP-1013-CAG", stock: 3, isDefault: false },
      ],
    },
    {
      title: "DEMO: Vasant Utsav Phag Khel Pichwai",
      slug: "demo-vasant-utsav-phag-khel-pichwai",
      categorySlug: "festival-and-utsav",
      description: "Festive celebration of Vasant Panchami and Dolotsav. Shreenathji wearing white shringaar dusted with natural fragrant abir and pink gulal colors, set against flowering trees and spring blossoms.",
      medium: "Natural pigments with herbal abir tones on cotton canvas",
      dimensions: "36 x 48 inches (91 x 122 cm)",
      careInstructions: "Dust regularly with soft dry feather duster. Do not wipe with water.",
      tags: "Vasant, Dolotsav, Gulal, Phag Khel, Spring Utsav",
      featured: false,
      status: ProductStatus.ACTIVE,
      variants: [
        { size: "28 x 38 in", frame: "Unframed / Rolled", price: 2400000, mrp: 2800000, sku: "DEMO-VU-2838-UF", stock: 4, isDefault: true },
        { size: "36 x 48 in", frame: "Teak Wood Frame", price: 3300000, mrp: 3800000, sku: "DEMO-VU-3648-TW", stock: 2, isDefault: false },
      ],
    },
    {
      title: "DEMO: Kaliya Daman Sacred Haveli Composition",
      slug: "demo-kaliya-daman-sacred-haveli-composition",
      categorySlug: "large-format",
      description: "Magnificent large sanctum artwork portraying Shri Krishna dancing triumphantly upon the multiple hoods of serpent Kaliya in the Yamuna. Surrounding panel features weeping Nagapatnis pleading with folded hands.",
      medium: "Natural mineral colors and gold leaf on treated linen",
      dimensions: "54 x 70 inches (137 x 178 cm)",
      careInstructions: "Professional hanging required. Do not place above heating or air conditioner vents.",
      tags: "Kaliya Daman, Yamuna, Large Format, Haveli Artwork",
      featured: true,
      status: ProductStatus.ACTIVE,
      variants: [
        { size: "42 x 54 in", frame: "Unframed / Rolled", price: 5400000, mrp: 6100000, sku: "DEMO-KD-4254-UF", stock: 2, isDefault: true },
        { size: "54 x 70 in", frame: "Antique Carved Teak Frame", price: 7800000, mrp: 8800000, sku: "DEMO-KD-5470-ACT", stock: 1, isDefault: false },
      ],
    },
  ];

  for (const p of productsData) {
    const categoryId = categoryMap.get(p.categorySlug)!;
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });

    if (!existing) {
      const created = await prisma.product.create({
        data: {
          title: p.title,
          slug: p.slug,
          description: p.description,
          categoryId,
          medium: p.medium,
          dimensions: p.dimensions,
          careInstructions: p.careInstructions,
          tags: p.tags,
          featured: p.featured,
          status: p.status,
          seoTitle: `${p.title} | SHREENATH ART WORK`,
          seoDescription: `Handmade devotional painting from Nathdwara: ${p.title}.`,
          images: {
            create: [
              {
                url: placeholderImg,
                altText: `${p.title} - Placeholder (Photo to be added)`,
                displayOrder: 0,
                isPrimary: true,
              },
            ],
          },
          variants: {
            create: p.variants.map((v) => ({
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
      console.log(`Created product: ${created.title}`);
    } else {
      console.log(`Product already exists: ${existing.title}`);
    }
  }

  // 5. Seed Coupons
  const couponsData = [
    {
      code: "SHREENATH10",
      description: "10% off on orders above Rs 5,000 (Maximum discount Rs 2,000)",
      discountType: CouponDiscountType.PERCENT,
      discountValue: 10,
      minOrderValue: 500000, // Rs 5,000
      maxDiscount: 200000,   // Rs 2,000
      usageLimit: 100,
      isActive: true,
    },
    {
      code: "FESTIVE500",
      description: "Flat Rs 500 off on orders above Rs 4,000",
      discountType: CouponDiscountType.FLAT,
      discountValue: 50000, // Rs 500 in paise
      minOrderValue: 400000, // Rs 4,000
      maxDiscount: 50000,
      usageLimit: 200,
      isActive: true,
    },
  ];

  for (const c of couponsData) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }
  console.log("Coupons seeded.");

  console.log("Database seed complete.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

