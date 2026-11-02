import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to MongoDB Atlas...');

  // 1. Ensure all categories exist
  const categoriesData = [
    {
      name: 'Pichwai',
      slug: 'pichwai',
      description: 'Traditional cloth hanging paintings depicting Shreenathji in various seasonal appearances and moods.',
      displayOrder: 1,
    },
    {
      name: 'Shreenathji Portraits',
      slug: 'shreenathji-portraits',
      description: 'Classical devotional sanctum portraits capturing the sacred posture, shringaar, and divine grace.',
      displayOrder: 2,
    },
    {
      name: '24kt Gold Foil & Framed Works',
      slug: 'gold-foil-frames',
      description: 'Hand-embossed 24kt gold foil artworks and Swiss leaf sanctum portraits housed in museum teak frames.',
      displayOrder: 3,
    },
    {
      name: 'Sacred Murtis & Sculptures',
      slug: 'sculptures-and-murtis',
      description: 'Hand-carved black marble idols, lost-wax cast brass sculptures, and temple wall plaques from Nathdwara.',
      displayOrder: 4,
    },
    {
      name: 'Festival and Utsav',
      slug: 'festival-and-utsav',
      description: 'Artworks celebrating sacred temple festivities including Annakoot, Sharad Purnima, and Phag Khel.',
      displayOrder: 5,
    },
    {
      name: 'Miniature Art',
      slug: 'miniature-art',
      description: 'Intricate miniature paintings created with squirrel hair brushes and real stone pigment on handmade paper.',
      displayOrder: 6,
    },
    {
      name: 'Large Format Works',
      slug: 'large-format',
      description: 'Statement sanctum artworks and heirloom Pichwais crafted for home temples and spacious living interiors.',
      displayOrder: 7,
    },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, displayOrder: cat.displayOrder, isActive: true },
      create: { name: cat.name, slug: cat.slug, description: cat.description, displayOrder: cat.displayOrder, isActive: true },
    });
    categoryMap[cat.slug] = upserted.id;
    console.log(`Category verified: ${upserted.name} (${upserted.id})`);
  }

  console.log('Updating catalog products with genuine images and descriptions...');

  const products = [
    // 24kt Gold Foil & Framed Works
    {
      slug: '24kt-gold-foil-shreenathji-ornate-teak-frame',
      title: '24kt Gold Foil Shreenathji Swaroop in Ornate Teak Frame',
      categorySlug: 'gold-foil-frames',
      shortDescription: 'Deeply embossed 24kt gold foil Shreenathji Swaroop housed in a museum-grade carved teak wood frame with antique gold inner beading.',
      description: 'Exquisitely hand-embossed 24kt gold foil representation of Lord Shreenathji in his iconic Govardhan-dharan posture. The artwork features deeply raised three-dimensional gold relief detailing every jewel, pearl mala, and sacred lotus motif. Encased in a custom-carved teak wood frame with museum glass and antique gold inner beading.',
      medium: '24kt Gold Foil Relief on Velvet Matting',
      dimensions: '16 x 20 inches',
      tags: 'Gold Foil, Embossed, Carved Teak Frame, 24kt, Shreenathji',
      featured: true,
      images: [
        { url: '/artworks/gold-frame-augrav.jpg', altText: '24kt Gold Foil Shreenathji Swaroop in Ornate Teak Frame' },
        { url: '/artworks/shreenathji-gold-frame-avr.jpg', altText: 'Golden Frame Detail and Embossed Work' },
      ],
      variants: [
        { size: '16 x 20 in', frame: 'Carved Teak Wood Frame', price: 2450000, mrp: 2800000, sku: 'SAW-GF-1620-TK', stock: 4, isDefault: true },
        { size: '20 x 28 in', frame: 'Antique Gold Heritage Frame', price: 3800000, mrp: 4200000, sku: 'SAW-GF-2028-AG', stock: 2, isDefault: false },
      ]
    },
    {
      slug: 'divine-shreenathji-sanctum-swiss-gold-frame',
      title: 'Divine Shreenathji Sanctum in Swiss 24kt Gold Leaf Frame',
      categorySlug: 'gold-foil-frames',
      shortDescription: 'Certified 24kt Swiss gold leaf foil depiction of the Shreenathji sanctum, sealed against oxidation in an antique gold frame.',
      description: 'Crafted using certified 24kt pure Swiss gold leaf foil, this devotional wall frame depicts the divine sanctum darshan of Shreenathji. The delicate gold leaf is sealed under an archival protective layer against oxidation and mounted in an elegant gold-trimmed timber frame suitable for mandir altars and auspicious spaces.',
      medium: 'Certified 24kt Swiss Gold Leaf Foil',
      dimensions: '12 x 15 inches',
      tags: 'Swiss Gold Leaf, Archival Sealed, Altar Frame, 24kt',
      featured: true,
      images: [
        { url: '/artworks/gold-frame-diviniti.jpg', altText: 'Divine Shreenathji Sanctum in Swiss 24kt Gold Leaf Frame' },
        { url: '/artworks/shreenathji-prima-gold-art.jpg', altText: 'Swiss Gold Leaf Detail and Framing' },
      ],
      variants: [
        { size: '12 x 15 in', frame: 'Gold-Trimmed Timber Frame', price: 1850000, mrp: 2100000, sku: 'SAW-SG-1215-GT', stock: 6, isDefault: true },
        { size: '8 x 10 in', frame: 'Compact Altar Frame', price: 1150000, mrp: 1350000, sku: 'SAW-SG-0810-CA', stock: 8, isDefault: false },
      ]
    },
    {
      slug: 'shreenathji-swaroop-charan-paduka-gold-frame',
      title: 'Shreenathji Swaroop with Sacred Charan Paduka Gold Frame',
      categorySlug: 'gold-foil-frames',
      shortDescription: 'Classic Pushtimarg devotional ensemble presenting Shreenathji Swaroop and sacred lotus Charan Padukas in embossed gold.',
      description: 'A classic Pushtimarg devotional ensemble presenting the full Shreenathji Swaroop alongside the sacred Charan Padukas (divine lotus footprints). Embellished in embossed gold leaf with ceremonial kumkum and chandan accents, mounted in a gold-finished altar frame.',
      medium: 'Embossed 24kt Gold Leaf with Sacred Pigments',
      dimensions: '10 x 14 inches',
      tags: 'Charan Paduka, Lotus Feet, 24kt Gold, Altar Frame',
      featured: false,
      images: [
        { url: '/artworks/gold-frame-charan-paduka.jpg', altText: 'Shreenathji Swaroop with Sacred Charan Paduka Gold Frame' },
        { url: '/artworks/gold-frame-augrav.jpg', altText: 'Charan Paduka Detail' },
      ],
      variants: [
        { size: '10 x 14 in', frame: 'Gold Leaf Beaded Frame', price: 1450000, mrp: 1700000, sku: 'SAW-CP-1014-GB', stock: 5, isDefault: true },
      ]
    },

    // Sacred Murtis & Sculptures
    {
      slug: 'handcrafted-black-marble-shreenathji-murti',
      title: 'Handcrafted Black Marble Shreenathji Murti with Gemstone Shringaar',
      categorySlug: 'sculptures-and-murtis',
      shortDescription: 'Hand-carved from a single block of natural high-density black marble, adorned with pearl necklaces and 24kt gold leaf.',
      description: 'Hand-carved by master stone sculptors from a single block of natural high-density black marble. Depicts the sacred swaroop of Shreenathji with the left arm raised lifting Mount Govardhan. The idol is adorned with handcrafted gemstone necklaces, gold leaf foil accents, and polished to a smooth sanctum finish.',
      medium: 'Natural Black Marble with 24kt Gold Shringaar & Gemstones',
      dimensions: '18 inches height x 9 inches width',
      tags: 'Black Marble, Hand Carved, Gemstones, Sanctum Murti',
      featured: true,
      images: [
        { url: '/artworks/shreenathji-black-marble-murti.jpg', altText: 'Handcrafted Black Marble Shreenathji Murti' },
        { url: '/artworks/shreenathji-aakaar-black-marble.jpg', altText: 'Black Marble Facial Carving Detail' },
      ],
      variants: [
        { size: '18 in Height', frame: 'Single Block Black Marble', price: 4800000, mrp: 5500000, sku: 'SAW-BM-18-ID', stock: 2, isDefault: true },
        { size: '24 in Height', frame: 'Grand Altar Marble Murti', price: 7800000, mrp: 8800000, sku: 'SAW-BM-24-GM', stock: 1, isDefault: false },
      ]
    },
    {
      slug: 'traditional-nathdwara-black-stone-shreenathji-swaroop',
      title: 'Traditional Nathdwara Black Stone Shreenathji Altar Swaroop',
      categorySlug: 'sculptures-and-murtis',
      shortDescription: 'Pure black stone idol carved following strict Pushtimarg iconography, ideal for daily home mandir seva and puja.',
      description: 'Carved following the strict iconography prescribed by the Vallabha Pushtimarg tradition. This pure black stone idol features the serene facial expression, raised arm, and lotus pedestal. Ideal for home temple daily seva, aarti, and puja rituals.',
      medium: 'Single-Block Black Granite Stone',
      dimensions: '12 inches height x 6 inches width',
      tags: 'Black Stone, Pushtimarg, Mandir Seva, Handcrafted',
      featured: false,
      images: [
        { url: '/artworks/shreenathji-aakaar-black-marble.jpg', altText: 'Traditional Nathdwara Black Stone Shreenathji Altar Swaroop' },
        { url: '/artworks/shreenathji-black-marble-murti.jpg', altText: 'Back and Base Stone Detail' },
      ],
      variants: [
        { size: '12 in Height', frame: 'Pure Black Granite Stone', price: 2800000, mrp: 3200000, sku: 'SAW-BS-12-AL', stock: 3, isDefault: true },
      ]
    },
    {
      slug: 'solid-cast-brass-shreenathji-sanctum-sculpture',
      title: 'Solid Cast Brass Shreenathji Sanctum Sculpture',
      categorySlug: 'sculptures-and-murtis',
      shortDescription: 'Cast in virgin yellow brass using the lost-wax technique with hand-chiseled shringaar and cow pedestal.',
      description: 'Cast in virgin yellow brass using the traditional lost-wax metal casting technique. Features detailed engraving of the multi-string pearl malas, peacock feather mukut, and cows carved around the base pedestal. Hand-buffed to a rich golden luster.',
      medium: 'Virgin Cast Brass with Hand Chisel Work',
      dimensions: '15 inches height x 7 inches width',
      tags: 'Cast Brass, Lost Wax, Hand Chiseled, Golden Patina',
      featured: true,
      images: [
        { url: '/artworks/shreenathji-brass-sculpture.jpg', altText: 'Solid Cast Brass Shreenathji Sanctum Sculpture' },
        { url: '/artworks/shreenathji-aona-brass.jpg', altText: 'Brass Chisel Work and Crown Detail' },
      ],
      variants: [
        { size: '15 in Height', frame: 'Solid Cast Brass', price: 2200000, mrp: 2600000, sku: 'SAW-BR-15-SC', stock: 4, isDefault: true },
        { size: '10 in Height', frame: 'Compact Cast Brass', price: 1400000, mrp: 1650000, sku: 'SAW-BR-10-CP', stock: 5, isDefault: false },
      ]
    },
    {
      slug: 'carved-brass-shreenathji-mukharvind-wall-plaque',
      title: 'Intricately Carved Brass Shreenathji Mukharvind Wall Plaque',
      categorySlug: 'sculptures-and-murtis',
      shortDescription: 'Ornate brass devotional wall hanging displaying the sacred Mukharvind framed by lotus petals and temple bells.',
      description: 'An ornate devotional wall hanging displaying the sacred Mukharvind (face) of Shreenathji framed by lotus petals and temple bells. Finished with a natural antique brass patina that deepens gracefully with age.',
      medium: 'Cast Brass with Antique Patina',
      dimensions: '14 x 14 inches',
      tags: 'Brass Plaque, Wall Hanging, Mukharvind, Antique Patina',
      featured: false,
      images: [
        { url: '/artworks/shreenathji-brass-wall-hanging.jpg', altText: 'Intricately Carved Brass Shreenathji Mukharvind Wall Plaque' },
        { url: '/artworks/shreenathji-brass-sculpture.jpg', altText: 'Plaque Relief Detail' },
      ],
      variants: [
        { size: '14 x 14 in', frame: 'Cast Brass Wall Mount', price: 1650000, mrp: 1950000, sku: 'SAW-BP-1414-WM', stock: 5, isDefault: true },
      ]
    },

    // Large Format Works & Heirloom Pichwais
    {
      slug: '1825-masterpiece-pichvai-shri-nathji-gold-silver',
      title: '1825 Masterpiece Pichvai of Shri Nathji with Gold and Silver',
      categorySlug: 'large-format',
      shortDescription: 'Museum-grade heirloom Pichwai in natural stone tempera, pure silver wash, and 24kt gold leaf on organic cotton.',
      description: 'A museum-grade heirloom Pichwai created following the historical Nathdwara masterworks preserved in the Cleveland Museum of Art. Features Krishna as Shreenathji surrounded by ecstatic milkmaids (gopis), narrative vignettes from Braj Leela, and an adoring border of Kamadhenu cows painted in natural stone tempera, pure silver wash, and 24kt gold embellishments on organic cotton.',
      medium: 'Mineral Stone Tempera, Pure Silver and 24kt Gold on Handspun Cotton',
      dimensions: '48 x 72 inches',
      tags: 'Heirloom Pichwai, Silver & Gold, Cleveland Museum, Masterwork',
      featured: true,
      images: [
        { url: '/artworks/shreenathji-cleveland-pichwai.jpg', altText: '1825 Masterpiece Pichvai of Shri Nathji with Gold and Silver' },
        { url: '/artworks/shreenathji-full-masterpiece.jpg', altText: 'Central Swaroop and Kamadhenu Cows Border' },
      ],
      variants: [
        { size: '48 x 72 in', frame: 'Seasoned Teak Wood Museum Frame', price: 8500000, mrp: 9800000, sku: 'SAW-LP-4872-TK', stock: 2, isDefault: true },
      ]
    },
    {
      slug: 'devotees-shrine-shri-nathji-haveli-sanctum',
      title: 'Devotees at the Shrine of Shri Nathji Haveli Sanctum',
      categorySlug: 'shreenathji-portraits',
      shortDescription: 'Inspired by court master Khubiram Gopilal, capturing the profound moment of Rajbhog darshan in the inner sanctum.',
      description: 'Inspired by legendary Nathdwara court artist Khubiram Gopilal. Depicts the profound moment when devotees gather in the inner sanctum of the Haveli during Rajbhog darshan. Painted with miniature squirrel-hair brush precision using lapis lazuli, vermilion, and 24kt gold powder.',
      medium: 'Gouache and 24kt Gold Powder on Vasli Handmade Paper',
      dimensions: '24 x 36 inches',
      tags: 'Khubiram Gopilal, Rajbhog Darshan, Haveli Sanctum, Gold Powder',
      featured: true,
      images: [
        { url: '/artworks/cleveland-devotees-shrinathji.jpg', altText: 'Devotees at the Shrine of Shri Nathji Haveli Sanctum' },
        { url: '/artworks/shreenathji-shrine.jpg', altText: 'Inner Sanctum Shrine Detail' },
      ],
      variants: [
        { size: '24 x 36 in', frame: 'Rosewood Polish Teak Frame', price: 4200000, mrp: 4800000, sku: 'SAW-DS-2436-RF', stock: 3, isDefault: true },
      ]
    },
    {
      slug: 'kota-school-sacred-shrinathji-sanctum-painting',
      title: 'Kota School Sacred Shrinathji Sanctum Painting',
      categorySlug: 'shreenathji-portraits',
      shortDescription: '19th-century royal Rajasthan school composition depicting Shreenathji in full ceremonial attire against crimson silk.',
      description: 'A faithful recreation of the 19th-century royal Rajasthan school composition depicting Shreenathji in full ceremonial attire. The black swaroop is contrasted against vibrant crimson silk hangings, with delicate floral garlands and gold-leaf jewelry rendered in miniature detail.',
      medium: 'Natural Mineral Pigments and Gold Leaf on Handmade Rag Paper',
      dimensions: '20 x 30 inches',
      tags: 'Kota School, Royal Rajasthani, Gold Leaf, Crimson Silk',
      featured: false,
      images: [
        { url: '/artworks/cleveland-shrinathji-kota.jpg', altText: 'Kota School Sacred Shrinathji Sanctum Painting' },
        { url: '/artworks/mukharvind-portrait.jpg', altText: 'Facial Shringaar Detail' },
      ],
      variants: [
        { size: '20 x 30 in', frame: 'Antique Gold Beaded Frame', price: 3400000, mrp: 3900000, sku: 'SAW-KS-2030-AG', stock: 4, isDefault: true },
      ]
    },

    // Classical Shreenathji Portraits
    {
      slug: 'classical-shreenathji-mukharvind-portrait',
      title: 'Classical Shreenathji Mukharvind Portrait',
      categorySlug: 'shreenathji-portraits',
      shortDescription: 'Intimate sacred portrait focusing on the divine Mukharvind, almond eyes, chibuk diamond, and peacock feather mukut.',
      description: 'Intimate sacred portrait focusing on the divine face (Mukharvind) of Shreenathji. Highlights the almond-shaped eyes gazing with unceasing compassion, the diamond on the chin (chibuk heera), and the elaborate peacock feather mukut.',
      medium: 'Natural Stone Pigment & 24kt Gold Foil on Cotton',
      dimensions: '14 x 18 inches',
      tags: 'Mukharvind, Chibuk Heera, Peacock Mukut, Gold Foil',
      featured: true,
      images: [
        { url: '/artworks/mukharvind-portrait.jpg', altText: 'Classical Shreenathji Mukharvind Portrait' },
        { url: '/artworks/shreenathji-shrine.jpg', altText: 'Framed Presentation View' },
      ],
      variants: [
        { size: '14 x 18 in', frame: 'Antique Gold Frame', price: 2600000, mrp: 2950000, sku: 'SAW-MK-1418-AG', stock: 5, isDefault: true },
        { size: '18 x 24 in', frame: 'Carved Teak Wood Frame', price: 3600000, mrp: 4100000, sku: 'SAW-MK-1824-TW', stock: 3, isDefault: false },
      ]
    },
    {
      slug: 'sandhya-aarti-darshan-shringaar',
      title: 'Sandhya Aarti Darshan Shringaar',
      categorySlug: 'shreenathji-portraits',
      shortDescription: 'Captures the sacred evening Aarti darshan with opulent golden brocade zari angarakha and brass lamp illumination.',
      description: 'Capturing the evening Aarti darshan where Shreenathji is adorned in opulent golden brocade zari angarakha, illuminated by the gentle glow of brass ghee lamps.',
      medium: 'Gouache with 24kt Gold Foil on Cotton',
      dimensions: '24 x 32 inches',
      tags: 'Sandhya Aarti, Zari Angarakha, Temple Lamps, 24kt Gold',
      featured: false,
      images: [
        { url: '/artworks/sandhya-aarti-shringaar.jpg', altText: 'Sandhya Aarti Darshan Shringaar' },
        { url: '/artworks/mukharvind-portrait.jpg', altText: 'Crown and Aarti Glow' },
      ],
      variants: [
        { size: '24 x 32 in', frame: 'Walnut Finish Teak Frame', price: 3600000, mrp: 4000000, sku: 'SAW-SA-2432-WF', stock: 3, isDefault: true },
      ]
    },

    // Pichwais & Utsavs
    {
      slug: 'shreenathji-kamal-talai-pichwai',
      title: 'Shreenathji Kamal Talai Pichwai',
      categorySlug: 'pichwai',
      shortDescription: 'Devotional composition depicting Shreenathji surrounded by blossoming pink water lilies in the sacred lotus pond.',
      description: 'A serene composition depicting Shreenathji standing amidst the sacred lotus pond of Nathdwara (Kamal Talai). Hand-painted pink water lilies blossom across deep indigo waters, symbolizing pure bhakti and divine tranquility.',
      medium: 'Natural Pigment and Gold on Cotton Fabric',
      dimensions: '36 x 48 inches',
      tags: 'Kamal Talai, Lotus Pond, Pink Lilies, Indigo Waters',
      featured: true,
      images: [
        { url: '/artworks/kamal-talai-lotus.jpg', altText: 'Shreenathji Kamal Talai Pichwai' },
        { url: '/artworks/shreenathji-cleveland-pichwai.jpg', altText: 'Full Cloth Hanging Overview' },
      ],
      variants: [
        { size: '36 x 48 in', frame: 'Natural Teak Wood Frame', price: 4500000, mrp: 5200000, sku: 'SAW-KT-3648-TK', stock: 3, isDefault: true },
        { size: '48 x 64 in', frame: 'Sanctum Scale Gold Leaf Frame', price: 6800000, mrp: 7800000, sku: 'SAW-KT-4864-GL', stock: 2, isDefault: false },
      ]
    },
    {
      slug: 'mor-kuti-peacock-dance-pichwai',
      title: 'Mor Kuti Pichwai (Peacock Dance of Barsana)',
      categorySlug: 'pichwai',
      shortDescription: 'Celebrating monsoon pastime with vibrant malachite greens, dancing peacocks, and 24kt gold foil accents.',
      description: 'Celebrating the monsoon pastime where Krishna and Radha danced in the peacock bower of Barsana. Painted with vibrant malachite greens, lapis blues, and fine gold leaf accents on handwoven cotton.',
      medium: 'Natural Mineral Pigments & Gold Leaf on Cotton',
      dimensions: '36 x 48 inches',
      tags: 'Mor Kuti, Monsoon, Dancing Peacocks, Barsana, Malachite',
      featured: false,
      images: [
        { url: '/artworks/mor-kuti-shringaar.jpg', altText: 'Mor Kuti Pichwai' },
        { url: '/artworks/kamal-talai-lotus.jpg', altText: 'Foliage and Peacock Detailing' },
      ],
      variants: [
        { size: '36 x 48 in', frame: 'Rosewood Finish Frame', price: 4800000, mrp: 5400000, sku: 'SAW-MK-3648-RF', stock: 4, isDefault: true },
      ]
    },
    {
      slug: 'annakoot-manorath-shringaar-painting',
      title: 'Annakoot Manorath Shringaar Painting',
      categorySlug: 'festival-and-utsav',
      shortDescription: 'Commemorating Govardhan Puja with mountains of consecrated offerings, ceremonial cows, and lineage priests.',
      description: 'Commemorating the Govardhan Puja Annakoot festival where a mountain of consecrated sweets and delicacies is lovingly offered to Shreenathji. Features traditional lineage figures, priests, and cows decorated with turmeric and henna.',
      medium: 'Natural Stone Pigments with Gold Foil on Canvas',
      dimensions: '30 x 40 inches',
      tags: 'Annakoot, Govardhan Puja, Chhappan Bhog, Lineage Artists',
      featured: false,
      images: [
        { url: '/artworks/annakoot-manorath.jpg', altText: 'Annakoot Manorath Shringaar Painting' },
        { url: '/artworks/chhappan-bhog-sanctum.jpg', altText: 'Temple Offering Vessels' },
      ],
      variants: [
        { size: '30 x 40 in', frame: 'Teak Wood Altar Frame', price: 3800000, mrp: 4400000, sku: 'SAW-AK-3040-TK', stock: 3, isDefault: true },
      ]
    },
    {
      slug: 'chhappan-bhog-grand-festive-pichwai',
      title: 'Chhappan Bhog Grand Festive Pichwai',
      categorySlug: 'large-format',
      shortDescription: 'Grand monumental Pichwai depicting the 56 sacred delicacies arranged before the golden sanctum.',
      description: 'Grand monumental Pichwai depicting the 56 sacred delicacies (Chhappan Bhog) arranged before the golden sanctum. Detailed with miniature culinary pots, silver thalis, and celestial attendants.',
      medium: 'Natural Mineral Pigments with 24kt Gold Powder on Cotton',
      dimensions: '48 x 60 inches',
      tags: 'Chhappan Bhog, 56 Offerings, Large Scale, Sanctum Darshan',
      featured: false,
      images: [
        { url: '/artworks/chhappan-bhog-sanctum.jpg', altText: 'Chhappan Bhog Grand Festive Pichwai' },
        { url: '/artworks/annakoot-manorath.jpg', altText: 'Offering Display Detail' },
      ],
      variants: [
        { size: '48 x 60 in', frame: 'Grand Teak Wood Frame', price: 6200000, mrp: 7200000, sku: 'SAW-CB-4860-TK', stock: 2, isDefault: true },
      ]
    },
    {
      slug: 'navneet-priyaji-swaroop-miniature',
      title: 'Navneet Priyaji Swaroop Miniature',
      categorySlug: 'miniature-art',
      shortDescription: 'Intricate miniature portrayal of infant Krishna holding a ball of freshly churned butter.',
      description: 'Delicate miniature portrayal of Navneet Priyaji (infant Krishna holding a ball of freshly churned butter), celebrated in the morning darshans of the Nathdwara Haveli.',
      medium: 'Stone Pigment & Gold on Vasli Paper',
      dimensions: '10 x 12 inches',
      tags: 'Navneet Priyaji, Makhan Chor, Miniature, Vasli Paper',
      featured: false,
      images: [
        { url: '/artworks/navneet-priyaji-detail.jpg', altText: 'Navneet Priyaji Swaroop Miniature' },
        { url: '/artworks/mukharvind-portrait.jpg', altText: 'Miniature Brushwork Detail' },
      ],
      variants: [
        { size: '10 x 12 in', frame: 'Silk Mat Antique Gold Frame', price: 1550000, mrp: 1800000, sku: 'SAW-NP-1012-AG', stock: 5, isDefault: true },
      ]
    },
  ];

  for (const item of products) {
    const categoryId = categoryMap[item.categorySlug];
    if (!categoryId) {
      console.error(`Missing category for slug: ${item.categorySlug}`);
      continue;
    }

    // Upsert product
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        categoryId: categoryId,
        description: item.description,
        seoDescription: item.shortDescription,
        medium: item.medium,
        dimensions: item.dimensions,
        tags: item.tags,
        featured: item.featured,
        status: 'ACTIVE',
      },
      create: {
        title: item.title,
        slug: item.slug,
        categoryId: categoryId,
        description: item.description,
        seoDescription: item.shortDescription,
        medium: item.medium,
        dimensions: item.dimensions,
        tags: item.tags,
        featured: item.featured,
        status: 'ACTIVE',
      },
    });

    // Replace images
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    for (let i = 0; i < item.images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: item.images[i].url,
          altText: item.images[i].altText,
          displayOrder: i + 1,
        },
      });
    }

    // Upsert variants
    for (const v of item.variants) {
      const existing = await prisma.productVariant.findFirst({
        where: { productId: product.id, sku: v.sku },
      });
      if (existing) {
        await prisma.productVariant.update({
          where: { id: existing.id },
          data: {
            size: v.size,
            frame: v.frame,
            price: v.price,
            mrp: v.mrp,
            stock: v.stock,
            isDefault: v.isDefault,
          },
        });
      } else {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            size: v.size,
            frame: v.frame,
            price: v.price,
            mrp: v.mrp,
            sku: v.sku,
            stock: v.stock,
            isDefault: v.isDefault,
          },
        });
      }
    }

    console.log(`Updated Product: ${product.title} (${item.images.length} images)`);
  }

  // Also remove old products that don't match the new authentic collection
  const validSlugs = products.map((p) => p.slug);
  const obsoleteProducts = await prisma.product.findMany({
    where: { slug: { notIn: validSlugs } },
    select: { id: true, title: true, slug: true },
  });

  for (const obs of obsoleteProducts) {
    const variantIds = (await prisma.productVariant.findMany({ where: { productId: obs.id }, select: { id: true } })).map(v => v.id);
    const orderItemCount = await prisma.orderItem.count({ where: { variantId: { in: variantIds } } });
    if (orderItemCount === 0) {
      await prisma.productImage.deleteMany({ where: { productId: obs.id } });
      await prisma.productVariant.deleteMany({ where: { productId: obs.id } });
      await prisma.product.delete({ where: { id: obs.id } });
      console.log(`Cleaned up obsolete product: ${obs.title}`);
    } else {
      await prisma.product.update({ where: { id: obs.id }, data: { status: 'ARCHIVED', featured: false } });
      console.log(`Archived historical product: ${obs.title}`);
    }
  }

  console.log('All catalog products and categories updated successfully in MongoDB Atlas!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
