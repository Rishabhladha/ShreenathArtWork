import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/artworks');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function baseSvg({ id, title, subtitle, bgGradient, borderCol, accentCol, innerArt }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="100%" height="100%">
  <defs>
    ${bgGradient}
    <pattern id="pichwai-dots" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="10" cy="10" r="1.5" fill="${accentCol}" fill-opacity="0.12" />
    </pattern>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Outer Canvas Background -->
  <rect width="800" height="1000" fill="url(#bg)" />
  <rect width="800" height="1000" fill="url(#pichwai-dots)" />

  <!-- Traditional Ornate Outer Border -->
  <rect x="24" y="24" width="752" height="952" fill="none" stroke="${borderCol}" stroke-width="4" />
  <rect x="36" y="36" width="728" height="928" fill="none" stroke="${accentCol}" stroke-width="1.5" stroke-dasharray="6,4" />
  <rect x="44" y="44" width="712" height="912" fill="none" stroke="${borderCol}" stroke-width="1" />

  <!-- Four Ornate Corner Motifs -->
  <g fill="${borderCol}">
    <path d="M 44 44 L 84 44 L 84 52 L 52 52 L 52 84 L 44 84 Z" />
    <circle cx="64" cy="64" r="5" fill="${accentCol}" />
    <path d="M 756 44 L 716 44 L 716 52 L 748 52 L 748 84 L 756 84 Z" />
    <circle cx="736" cy="64" r="5" fill="${accentCol}" />
    <path d="M 44 956 L 84 956 L 84 948 L 52 948 L 52 916 L 44 916 Z" />
    <circle cx="64" cy="936" r="5" fill="${accentCol}" />
    <path d="M 756 956 L 716 956 L 716 948 L 748 948 L 748 916 L 756 916 Z" />
    <circle cx="736" cy="936" r="5" fill="${accentCol}" />
  </g>

  <!-- Inner Artwork Area -->
  <g id="artwork" transform="translate(60, 60)">
    ${innerArt}
  </g>

  <!-- Caption Plate at Bottom -->
  <g transform="translate(400, 915)" text-anchor="middle">
    <rect x="-240" y="-28" width="480" height="46" rx="2" fill="#1C1917" fill-opacity="0.88" stroke="${borderCol}" stroke-width="1" filter="url(#shadow)" />
    <text y="-6" fill="#FBF8F3" font-family="'Cormorant Garamond', Georgia, serif" font-size="20" font-weight="600" letter-spacing="1.5">${title}</text>
    <text y="12" fill="${accentCol}" font-family="'Inter', sans-serif" font-size="11" font-weight="500" letter-spacing="2" text-transform="uppercase">${subtitle}</text>
  </g>
</svg>`;
}

const artworks = [
  {
    file: 'kamal-talai.svg',
    title: 'Kamal Talai Pichwai',
    subtitle: 'Sacred Lotus Pond of Nathdwara',
    borderCol: '#D4AF37',
    accentCol: '#E8A7A1',
    bgGradient: `<linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#14213d"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1a2e40"/>
    </linearGradient>`,
    innerArt: `
      <!-- Deep sacred Yamuna waters -->
      <rect x="0" y="0" width="680" height="820" fill="#0A192F" rx="4" />
      <!-- Water ripples -->
      <g stroke="#1E3A8A" stroke-width="1.5" fill="none" opacity="0.6">
        <path d="M 40 200 Q 140 180 240 200 T 440 200 T 640 200" />
        <path d="M 20 350 Q 120 330 220 350 T 420 350 T 620 350" />
        <path d="M 40 500 Q 140 480 240 500 T 440 500 T 640 500" />
        <path d="M 20 650 Q 120 630 220 650 T 420 650 T 620 650" />
      </g>
      <!-- Central Sanctum Halo and Silhouette -->
      <circle cx="340" cy="320" r="140" fill="#D4AF37" fill-opacity="0.15" stroke="#D4AF37" stroke-width="2"/>
      <circle cx="340" cy="320" r="100" fill="#D4AF37" fill-opacity="0.25"/>
      <path d="M 340 220 L 325 250 L 355 250 Z" fill="#D4AF37" />
      <rect x="310" y="260" width="60" height="120" rx="20" fill="#1A1816" stroke="#D4AF37" stroke-width="2"/>
      <path d="M 290 290 Q 260 260 260 210 Q 280 210 300 240 Z" fill="#1A1816" stroke="#D4AF37" stroke-width="1.5"/>
      <!-- Giant Blooming Lotus Center -->
      <g transform="translate(340, 520)">
        <path d="M 0 -80 C -40 -30 -60 10 0 40 C 60 10 40 -30 0 -80 Z" fill="#F472B6" stroke="#D4AF37" stroke-width="2"/>
        <path d="M -50 -40 C -80 0 -70 40 -10 45 C 10 20 0 -20 -50 -40 Z" fill="#FB7185" stroke="#D4AF37" stroke-width="1.5"/>
        <path d="M 50 -40 C 80 0 70 40 10 45 C -10 20 0 -20 50 -40 Z" fill="#FB7185" stroke="#D4AF37" stroke-width="1.5"/>
        <circle cx="0" cy="15" r="16" fill="#FBBF24" />
      </g>
      <!-- Surrounding Lotus Buds and Leaves -->
      <g fill="#047857" stroke="#D4AF37" stroke-width="1.5">
        <circle cx="140" cy="220" r="45" fill="#065F46" />
        <circle cx="540" cy="220" r="45" fill="#065F46" />
        <circle cx="120" cy="620" r="55" fill="#065F46" />
        <circle cx="560" cy="620" r="55" fill="#065F46" />
      </g>
      <g fill="#F472B6" stroke="#D4AF37" stroke-width="1.5">
        <path d="M 140 180 C 120 195 120 220 140 230 C 160 220 160 195 140 180 Z" />
        <path d="M 540 180 C 520 195 520 220 540 230 C 560 220 560 195 540 180 Z" />
        <path d="M 120 570 C 90 590 90 630 120 645 C 150 630 150 590 120 570 Z" />
        <path d="M 560 570 C 530 590 530 630 560 645 C 590 630 590 590 560 570 Z" />
      </g>
      <!-- Holy Cow Silhouettes at Lower Edge -->
      <g transform="translate(180, 720)" fill="#F8FAFC" stroke="#D4AF37" stroke-width="1.5">
        <ellipse cx="0" cy="0" rx="45" ry="30" />
        <circle cx="45" cy="-15" r="18" />
        <path d="M 50 -32 L 58 -20 L 46 -18 Z" fill="#D4AF37" />
        <circle cx="52" cy="-15" r="2" fill="#1C1917" />
      </g>
      <g transform="translate(500, 720) scale(-1, 1)" fill="#F8FAFC" stroke="#D4AF37" stroke-width="1.5">
        <ellipse cx="0" cy="0" rx="45" ry="30" />
        <circle cx="45" cy="-15" r="18" />
        <path d="M 50 -32 L 58 -20 L 46 -18 Z" fill="#D4AF37" />
        <circle cx="52" cy="-15" r="2" fill="#1C1917" />
      </g>
    `
  },
  {
    file: 'annakoot.svg',
    title: 'Annakoot Manorath Shringaar',
    subtitle: 'Govardhan Puja Festival Art',
    borderCol: '#D97706',
    accentCol: '#F59E0B',
    bgGradient: `<linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#450a0a"/>
      <stop offset="50%" stop-color="#7f1d1d"/>
      <stop offset="100%" stop-color="#2b0707"/>
    </linearGradient>`,
    innerArt: `
      <rect x="0" y="0" width="680" height="820" fill="#3E0E0E" rx="4" />
      <!-- Archway of Sanctum -->
      <path d="M 60 760 L 60 300 Q 340 60 620 300 L 620 760 Z" fill="#581414" stroke="#D97706" stroke-width="2"/>
      <!-- Stepped Mountain of Sacred Annakoot Rice & Sweets -->
      <polygon points="340,220 180,680 500,680" fill="#F59E0B" stroke="#D97706" stroke-width="2"/>
      <!-- Layered Tiers -->
      <path d="M 220 580 L 460 580" stroke="#78350F" stroke-width="6"/>
      <path d="M 260 480 L 420 480" stroke="#78350F" stroke-width="6"/>
      <path d="M 300 380 L 380 380" stroke="#78350F" stroke-width="6"/>
      <circle cx="340" cy="220" r="24" fill="#FEF08A" stroke="#D97706" stroke-width="2"/>
      <!-- Earthen Pots (Handis) below -->
      <g fill="#991B1B" stroke="#FDE68A" stroke-width="1.5">
        <circle cx="160" cy="720" r="28" />
        <circle cx="230" cy="720" r="28" />
        <circle cx="300" cy="720" r="28" />
        <circle cx="370" cy="720" r="28" />
        <circle cx="440" cy="720" r="28" />
        <circle cx="510" cy="720" r="28" />
      </g>
      <!-- Hanging Toran of Marigolds -->
      <g fill="#F59E0B" stroke="#78350F" stroke-width="1">
        ${[100, 160, 220, 280, 340, 400, 460, 520, 580].map(x => `<circle cx="${x}" cy="180" r="14"/>`).join('')}
      </g>
    `
  },
  {
    file: 'mukharvind.svg',
    title: 'Classical Mukharvind Portrait',
    subtitle: 'The Sacred Posture & Chin Gem',
    borderCol: '#CA8A04',
    accentCol: '#EAB308',
    bgGradient: `<linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#18181b"/>
      <stop offset="50%" stop-color="#27272a"/>
      <stop offset="100%" stop-color="#09090b"/>
    </linearGradient>`,
    innerArt: `
      <rect x="0" y="0" width="680" height="820" fill="#141416" rx="4" />
      <!-- Radiant Divine Halo -->
      <circle cx="340" cy="380" r="240" fill="#CA8A04" fill-opacity="0.12" stroke="#CA8A04" stroke-width="2" stroke-dasharray="8,6"/>
      <circle cx="340" cy="380" r="180" fill="#CA8A04" fill-opacity="0.2"/>
      <!-- The Divine Head and Crown (Mukut) -->
      <path d="M 260 280 Q 340 180 420 280 L 400 440 Q 340 480 280 440 Z" fill="#0F172A" stroke="#CA8A04" stroke-width="3"/>
      <!-- Peacock Feather (Mor Pankh) -->
      <g transform="translate(340, 160)">
        <ellipse cx="0" cy="-40" rx="36" ry="60" fill="#047857" stroke="#CA8A04" stroke-width="2"/>
        <ellipse cx="0" cy="-40" rx="22" ry="38" fill="#1D4ED8" />
        <ellipse cx="0" cy="-40" rx="10" ry="18" fill="#FBBF24" />
      </g>
      <!-- Tilak and Chibuk (Diamond on Chin) -->
      <path d="M 335 300 L 345 300 L 343 350 L 337 350 Z" fill="#DC2626" />
      <circle cx="340" cy="358" r="4" fill="#FDE047" />
      <!-- Divine Lotus Eyes -->
      <path d="M 290 350 Q 315 330 330 355 Q 315 370 290 350 Z" fill="#FFFFFF" stroke="#CA8A04" stroke-width="1.5"/>
      <circle cx="315" cy="350" r="6" fill="#1C1917"/>
      <path d="M 390 350 Q 365 330 350 355 Q 365 370 390 350 Z" fill="#FFFFFF" stroke="#CA8A04" stroke-width="1.5"/>
      <circle cx="365" cy="350" r="6" fill="#1C1917"/>
      <!-- Pearl Chin Gem (Heera) -->
      <polygon points="340,435 348,443 340,451 332,443" fill="#67E8F9" stroke="#FFFFFF" stroke-width="2"/>
      <!-- Grand Pearl Garlands (Haar) -->
      <path d="M 230 460 Q 340 680 450 460" fill="none" stroke="#F1F5F9" stroke-width="8" stroke-dasharray="14,4"/>
      <path d="M 210 490 Q 340 730 470 490" fill="none" stroke="#CA8A04" stroke-width="6"/>
      <path d="M 190 520 Q 340 780 490 520" fill="none" stroke="#F1F5F9" stroke-width="8" stroke-dasharray="14,4"/>
    `
  },
  {
    file: 'sharad-purnima.svg',
    title: 'Sharad Purnima Raas Pichwai',
    subtitle: 'Autumn Full Moon Sacred Dance',
    borderCol: '#C0C0C0',
    accentCol: '#93C5FD',
    bgGradient: `<linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="60%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>`,
    innerArt: `
      <rect x="0" y="0" width="680" height="820" fill="#030712" rx="4" />
      <!-- Giant Silver Moon (Sharad Chandrama) -->
      <circle cx="340" cy="220" r="110" fill="#F8FAFC" stroke="#C0C0C0" stroke-width="3" filter="url(#shadow)"/>
      <circle cx="340" cy="220" r="140" fill="#93C5FD" fill-opacity="0.12"/>
      <circle cx="340" cy="220" r="180" fill="#93C5FD" fill-opacity="0.06"/>
      <!-- Night Stars -->
      ${[
        [100, 120], [200, 80], [520, 100], [600, 160], [80, 260], [620, 280]
      ].map(([cx, cy]) => `<polygon points="${cx},${cy-8} ${cx+2},${cy-2} ${cx+8},${cy} ${cx+2},${cy+2} ${cx},${cy+8} ${cx-2},${cy+2} ${cx-8},${cy} ${cx-2},${cy-2}" fill="#FDE047"/>`).join('')}
      <!-- Sacred Kadamba Trees on Flanks -->
      <path d="M 0 380 Q 140 320 180 550 L 0 550 Z" fill="#064E3B" stroke="#047857" stroke-width="2"/>
      <path d="M 680 380 Q 540 320 500 550 L 680 550 Z" fill="#064E3B" stroke="#047857" stroke-width="2"/>
      <!-- Silver Yamuna River Waves at Bottom -->
      <path d="M 0 620 Q 170 590 340 620 T 680 620 L 680 820 L 0 820 Z" fill="#0B132B"/>
      <g stroke="#94A3B8" stroke-width="1.5" fill="none">
        <path d="M 40 670 Q 180 655 340 670 T 640 670" />
        <path d="M 20 720 Q 180 705 340 720 T 660 720" />
        <path d="M 40 770 Q 180 755 340 770 T 640 770" />
      </g>
      <!-- Central Dancing Shreenathji Swaroop -->
      <g transform="translate(340, 480)">
        <ellipse cx="0" cy="0" rx="60" ry="100" fill="#1E293B" stroke="#C0C0C0" stroke-width="2"/>
        <path d="M -40 -30 Q -80 -70 -80 -120 Q -60 -120 -40 -90 Z" fill="#1E293B" stroke="#C0C0C0" stroke-width="2"/>
        <circle cx="0" cy="-60" r="30" fill="#C0C0C0" fill-opacity="0.25"/>
      </g>
    `
  },
  {
    file: 'gau-charan.svg',
    title: 'Gau Charan Miniature Art',
    subtitle: 'Vraja Pastures & Sacred Kamadhenu',
    borderCol: '#15803D',
    accentCol: '#86EFAC',
    bgGradient: `<linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#14532d"/>
      <stop offset="50%" stop-color="#166534"/>
      <stop offset="100%" stop-color="#052e16"/>
    </linearGradient>`,
    innerArt: `
      <rect x="0" y="0" width="680" height="820" fill="#14532D" rx="4" />
      <!-- Golden Vraja Pasture Sunset -->
      <rect x="0" y="0" width="680" height="340" fill="#FEF08A" fill-opacity="0.3"/>
      <circle cx="340" cy="180" r="70" fill="#F97316" fill-opacity="0.6"/>
      <!-- Soft Hills -->
      <path d="M 0 380 Q 200 300 400 370 T 680 340 L 680 820 L 0 820 Z" fill="#15803D"/>
      <path d="M 0 460 Q 240 400 480 470 T 680 440 L 680 820 L 0 820 Z" fill="#166534"/>
      <!-- Herd of 3 Beautiful Cows (Gau Mata) -->
      <!-- Cow 1 -->
      <g transform="translate(200, 520)" fill="#F8FAFC" stroke="#D4AF37" stroke-width="1.5">
        <ellipse cx="0" cy="0" rx="55" ry="38" />
        <circle cx="50" cy="-20" r="22" />
        <path d="M 58 -42 L 70 -26 L 56 -24 Z" fill="#D97706" />
        <circle cx="58" cy="-20" r="3" fill="#1C1917" />
        <rect x="-35" y="30" width="8" height="40" fill="#F8FAFC"/>
        <rect x="25" y="30" width="8" height="40" fill="#F8FAFC"/>
        <!-- Ornate bell around neck -->
        <circle cx="35" cy="5" r="8" fill="#F59E0B" stroke="#78350F" stroke-width="1"/>
      </g>
      <!-- Cow 2 -->
      <g transform="translate(480, 560) scale(-1, 1)" fill="#F8FAFC" stroke="#D4AF37" stroke-width="1.5">
        <ellipse cx="0" cy="0" rx="55" ry="38" />
        <circle cx="50" cy="-20" r="22" />
        <path d="M 58 -42 L 70 -26 L 56 -24 Z" fill="#D97706" />
        <circle cx="58" cy="-20" r="3" fill="#1C1917" />
        <rect x="-35" y="30" width="8" height="40" fill="#F8FAFC"/>
        <rect x="25" y="30" width="8" height="40" fill="#F8FAFC"/>
        <circle cx="35" cy="5" r="8" fill="#F59E0B" stroke="#78350F" stroke-width="1"/>
      </g>
      <!-- Young Krishna under Kadamba Tree -->
      <g transform="translate(340, 420)">
        <rect x="-20" y="-80" width="40" height="100" rx="14" fill="#0284C7" stroke="#FDE047" stroke-width="2"/>
        <circle cx="0" cy="-110" r="24" fill="#0284C7" stroke="#FDE047" stroke-width="2"/>
        <path d="M -40 -95 L 40 -95" stroke="#FBBF24" stroke-width="4"/> <!-- Golden Flute -->
      </g>
    `
  },
  {
    file: 'chhappan-bhog.svg',
    title: 'Chhappan Bhog Grand Festive Pichwai',
    subtitle: '56 Sacred Delicacies Offering',
    borderCol: '#D97706',
    accentCol: '#FDE047',
    bgGradient: `<linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#451a03"/>
      <stop offset="50%" stop-color="#78350f"/>
      <stop offset="100%" stop-color="#290f02"/>
    </linearGradient>`,
    innerArt: `
      <rect x="0" y="0" width="680" height="820" fill="#3B1504" rx="4" />
      <!-- Temple Sanctum Doorway -->
      <rect x="80" y="60" width="520" height="700" fill="#521C04" stroke="#D97706" stroke-width="3"/>
      <!-- Hanging Brass Bells -->
      ${[140, 220, 300, 380, 460, 540].map(x => `
        <line x1="${x}" y1="60" x2="${x}" y2="120" stroke="#FBBF24" stroke-width="2"/>
        <path d="M ${x-12} 120 L ${x+12} 120 L ${x+18} 145 L ${x-18} 145 Z" fill="#F59E0B" stroke="#78350F" stroke-width="1"/>
        <circle cx="${x}" cy="150" r="4" fill="#FBBF24"/>
      `).join('')}
      <!-- Array of 7x4 Golden Thalis (Platters) representing 56 Bhog -->
      <g fill="#FBBF24" stroke="#B45309" stroke-width="1.5">
        ${[220, 310, 400, 490, 580].flatMap(y => 
          [160, 250, 340, 430, 520].map(x => `
            <ellipse cx="${x}" cy="${y}" rx="32" ry="18" fill="#FDE047"/>
            <ellipse cx="${x}" cy="${y}" rx="22" ry="11" fill="#F59E0B"/>
            <circle cx="${x}" cy="${y}" r="4" fill="#B45309"/>
          `)
        ).join('')}
      </g>
    `
  },
  {
    file: 'ashta-sakha.svg',
    title: 'Shreenathji with Ashta Sakhas',
    subtitle: 'The Eight Companions of Pushtimarg',
    borderCol: '#9A3412',
    accentCol: '#FED7AA',
    bgGradient: `<linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#431407"/>
      <stop offset="50%" stop-color="#7c2d12"/>
      <stop offset="100%" stop-color="#2a0d05"/>
    </linearGradient>`,
    innerArt: `
      <rect x="0" y="0" width="680" height="820" fill="#3D1308" rx="4" />
      <!-- Central Sanctum Shrine -->
      <rect x="220" y="160" width="240" height="420" rx="12" fill="#1C1917" stroke="#D97706" stroke-width="3"/>
      <!-- The Divine Posture with Raised Left Arm -->
      <circle cx="340" cy="240" r="40" fill="#D97706" fill-opacity="0.25"/>
      <rect x="315" y="270" width="50" height="140" rx="15" fill="#0A0A0B" stroke="#D97706" stroke-width="2"/>
      <path d="M 315 285 Q 260 250 260 200 Q 285 200 315 240 Z" fill="#0A0A0B" stroke="#D97706" stroke-width="2"/>
      <!-- 4 Sakhas on Left, 4 on Right -->
      <g fill="#EA580C" stroke="#FED7AA" stroke-width="1.5">
        <!-- Left Sakhas -->
        <circle cx="120" cy="240" r="28"/>
        <rect x="95" y="275" width="50" height="90" rx="10"/>
        <circle cx="120" cy="420" r="28"/>
        <rect x="95" y="455" width="50" height="90" rx="10"/>
        <!-- Right Sakhas -->
        <circle cx="560" cy="240" r="28"/>
        <rect x="535" y="275" width="50" height="90" rx="10"/>
        <circle cx="560" cy="420" r="28"/>
        <rect x="535" y="455" width="50" height="90" rx="10"/>
      </g>
      <!-- Musical Tanpura Instrument below -->
      <g transform="translate(340, 680)" fill="#D97706" stroke="#FEF08A" stroke-width="2">
        <circle cx="0" cy="40" r="42" fill="#B45309"/>
        <rect x="-6" y="-70" width="12" height="110"/>
        <circle cx="0" cy="-75" r="14"/>
      </g>
    `
  },
  {
    file: 'vallabhacharya.svg',
    title: 'Mahaprabhu Vallabhacharya Darshan',
    subtitle: 'Mount Govardhan Sacred Revelation',
    borderCol: '#C2410C',
    accentCol: '#FED7AA',
    bgGradient: `<linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3b1d11"/>
      <stop offset="50%" stop-color="#6c3319"/>
      <stop offset="100%" stop-color="#241009"/>
    </linearGradient>`,
    innerArt: `
      <rect x="0" y="0" width="680" height="820" fill="#32160C" rx="4" />
      <!-- Govardhan Mountain Silhouette -->
      <polygon points="340,140 100,520 580,520" fill="#78350F" stroke="#B45309" stroke-width="3"/>
      <!-- Stone Textures -->
      <path d="M 160 440 Q 340 380 520 440" stroke="#92400E" stroke-width="3" fill="none"/>
      <path d="M 220 340 Q 340 300 460 340" stroke="#92400E" stroke-width="3" fill="none"/>
      <!-- Lord's Arm emerging from Govardhan Peak -->
      <path d="M 330 180 L 330 100 Q 350 90 350 120 L 350 180 Z" fill="#0A0A0B" stroke="#FDE047" stroke-width="2"/>
      <!-- Shri Vallabhacharya in Sacred Saffron offering Dandavat Pranam -->
      <g transform="translate(340, 640)">
        <ellipse cx="0" cy="0" rx="90" ry="35" fill="#EA580C" stroke="#FDE047" stroke-width="2"/>
        <circle cx="-90" cy="-10" r="26" fill="#FDBA74" stroke="#EA580C" stroke-width="1.5"/>
        <!-- Folded hands -->
        <path d="M -115 -10 L -130 -10" stroke="#FDE047" stroke-width="4"/>
      </g>
    `
  },
  {
    file: 'mor-kuti.svg',
    title: 'Mor Kuti Peacock Pichwai',
    subtitle: 'Barsana Monsoon Dance of Devotion',
    borderCol: '#059669',
    accentCol: '#34D399',
    bgGradient: `<linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#022c22"/>
      <stop offset="50%" stop-color="#064e3b"/>
      <stop offset="100%" stop-color="#021c15"/>
    </linearGradient>`,
    innerArt: `
      <rect x="0" y="0" width="680" height="820" fill="#022C22" rx="4" />
      <!-- Dark Monsoon Clouds (Megh) with Golden Lightning -->
      <path d="M 40 100 Q 140 40 240 90 Q 340 30 440 90 Q 540 40 640 100 L 640 0 L 40 0 Z" fill="#1E293B" stroke="#059669" stroke-width="2"/>
      <path d="M 280 90 L 300 130 L 290 140 L 320 180" stroke="#FBBF24" stroke-width="3" fill="none"/>
      <!-- Two Majestic Dancing Peacocks -->
      <!-- Left Peacock -->
      <g transform="translate(220, 480)">
        <!-- Fan of Tail Feathers -->
        <path d="M 0 0 C -120 -80 -180 -200 0 -240 C 180 -200 120 -80 0 0 Z" fill="#047857" stroke="#10B981" stroke-width="2"/>
        <!-- Eyespots on feathers -->
        ${[[-60, -180], [0, -210], [60, -180], [-80, -120], [0, -140], [80, -120]].map(([x, y]) => `
          <ellipse cx="${x}" cy="${y}" rx="16" ry="22" fill="#1D4ED8" stroke="#F59E0B" stroke-width="2"/>
          <circle cx="${x}" cy="${y}" r="6" fill="#059669"/>
        `).join('')}
        <!-- Peacock Body & Neck -->
        <path d="M 0 -80 Q -30 -140 -15 -180 Q 0 -170 10 -140 Z" fill="#1E40AF" stroke="#60A5FA" stroke-width="2"/>
        <!-- Crest -->
        <circle cx="-15" cy="-195" r="5" fill="#FBBF24"/>
      </g>
      <!-- Right Peacock -->
      <g transform="translate(460, 480) scale(-1, 1)">
        <path d="M 0 0 C -120 -80 -180 -200 0 -240 C 180 -200 120 -80 0 0 Z" fill="#047857" stroke="#10B981" stroke-width="2"/>
        ${[[-60, -180], [0, -210], [60, -180], [-80, -120], [0, -140], [80, -120]].map(([x, y]) => `
          <ellipse cx="${x}" cy="${y}" rx="16" ry="22" fill="#1D4ED8" stroke="#F59E0B" stroke-width="2"/>
          <circle cx="${x}" cy="${y}" r="6" fill="#059669"/>
        `).join('')}
        <path d="M 0 -80 Q -30 -140 -15 -180 Q 0 -170 10 -140 Z" fill="#1E40AF" stroke="#60A5FA" stroke-width="2"/>
        <circle cx="-15" cy="-195" r="5" fill="#FBBF24"/>
      </g>
    `
  },
  {
    file: 'sandhya-aarti.svg',
    title: 'Sandhya Aarti Shringaar',
    subtitle: 'Twilight Sanctum Lamp Offering',
    borderCol: '#D97706',
    accentCol: '#FDE68A',
    bgGradient: `<linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="50%" stop-color="#311042"/>
      <stop offset="100%" stop-color="#0f0714"/>
    </linearGradient>`,
    innerArt: `
      <rect x="0" y="0" width="680" height="820" fill="#180A22" rx="4" />
      <!-- Golden Aarti Lamps (Deepak) glowing on flanks -->
      <g transform="translate(140, 480)">
        <polygon points="-30,60 30,60 15,10 -15,10" fill="#D97706" stroke="#FDE68A" stroke-width="2"/>
        <!-- Golden Flame -->
        <path d="M 0 10 C -18 -10 -12 -35 0 -55 C 12 -35 18 -10 0 10 Z" fill="#F59E0B" stroke="#FEF08A" stroke-width="2"/>
        <circle cx="0" cy="-20" r="8" fill="#FFFFFF"/>
      </g>
      <g transform="translate(540, 480)">
        <polygon points="-30,60 30,60 15,10 -15,10" fill="#D97706" stroke="#FDE68A" stroke-width="2"/>
        <path d="M 0 10 C -18 -10 -12 -35 0 -55 C 12 -35 18 -10 0 10 Z" fill="#F59E0B" stroke="#FEF08A" stroke-width="2"/>
        <circle cx="0" cy="-20" r="8" fill="#FFFFFF"/>
      </g>
      <!-- Central Shreenathji in Evening Pearl and Velvet Shringaar -->
      <circle cx="340" cy="340" r="160" fill="#F59E0B" fill-opacity="0.2" stroke="#D97706" stroke-width="2"/>
      <rect x="290" y="240" width="100" height="240" rx="30" fill="#0C0A09" stroke="#FDE68A" stroke-width="3"/>
      <!-- Multi-strand Pearl Necklaces -->
      <path d="M 310 320 Q 340 370 370 320" stroke="#F8FAFC" stroke-width="6" fill="none" stroke-dasharray="8,4"/>
      <path d="M 300 350 Q 340 410 380 350" stroke="#F8FAFC" stroke-width="6" fill="none" stroke-dasharray="8,4"/>
      <path d="M 290 380 Q 340 460 390 380" stroke="#F8FAFC" stroke-width="6" fill="none" stroke-dasharray="8,4"/>
    `
  },
  {
    file: 'dan-ghal.svg',
    title: 'Dan Ghal Manorath Pichwai',
    subtitle: 'The Milk & Curd Offering Lila',
    borderCol: '#B45309',
    accentCol: '#FDE047',
    bgGradient: `<linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#451a03"/>
      <stop offset="50%" stop-color="#78350f"/>
      <stop offset="100%" stop-color="#1c0a02"/>
    </linearGradient>`,
    innerArt: `
      <rect x="0" y="0" width="680" height="820" fill="#3D1804" rx="4" />
      <!-- Braj Gopis carrying Curd Pots -->
      <!-- Left Gopi -->
      <g transform="translate(200, 480)">
        <rect x="-30" y="-80" width="60" height="180" rx="15" fill="#DC2626" stroke="#FEF08A" stroke-width="2"/>
        <circle cx="0" cy="-120" r="28" fill="#FDBA74"/>
        <!-- Earthen Pot atop Head -->
        <ellipse cx="0" cy="-160" rx="32" ry="22" fill="#78350F" stroke="#FDE047" stroke-width="2"/>
      </g>
      <!-- Right Gopi -->
      <g transform="translate(480, 480)">
        <rect x="-30" y="-80" width="60" height="180" rx="15" fill="#2563EB" stroke="#FEF08A" stroke-width="2"/>
        <circle cx="0" cy="-120" r="28" fill="#FDBA74"/>
        <ellipse cx="0" cy="-160" rx="32" ry="22" fill="#78350F" stroke="#FDE047" stroke-width="2"/>
      </g>
      <!-- Shreenathji in Center asking for Dan (Offerings) -->
      <g transform="translate(340, 420)">
        <rect x="-35" y="-100" width="70" height="220" rx="20" fill="#0C0A09" stroke="#FDE047" stroke-width="3"/>
        <circle cx="0" cy="-140" r="34" fill="#0C0A09" stroke="#FDE047" stroke-width="2"/>
        <!-- Peacock Crown -->
        <ellipse cx="0" cy="-190" rx="18" ry="30" fill="#047857" stroke="#FDE047" stroke-width="1.5"/>
      </g>
    `
  },
  {
    file: 'navneet-priyaji.svg',
    title: 'Navneet Priyaji Swaroop',
    subtitle: 'Child Krishna with Golden Butter',
    borderCol: '#BE123C',
    accentCol: '#FDA4AF',
    bgGradient: `<linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4c0519"/>
      <stop offset="50%" stop-color="#881337"/>
      <stop offset="100%" stop-color="#25020c"/>
    </linearGradient>`,
    innerArt: `
      <rect x="0" y="0" width="680" height="820" fill="#400412" rx="4" />
      <!-- Ornate Velvet Carpet with Lotus Patterns -->
      <rect x="80" y="440" width="520" height="300" rx="10" fill="#9F1239" stroke="#FDE047" stroke-width="3"/>
      <!-- Crawling Child Krishna (Bal Mukund) -->
      <g transform="translate(340, 460)">
        <!-- Child Body Crawling -->
        <ellipse cx="0" cy="0" rx="90" ry="60" fill="#0284C7" stroke="#FDE047" stroke-width="2"/>
        <!-- Head with Topknot and Jewels -->
        <circle cx="-80" cy="-60" r="42" fill="#0284C7" stroke="#FDE047" stroke-width="2"/>
        <circle cx="-80" cy="-115" r="15" fill="#FBBF24" stroke="#DC2626" stroke-width="2"/>
        <!-- Golden Ball of Fresh Butter in Right Hand -->
        <circle cx="-130" cy="-30" r="28" fill="#FEF08A" stroke="#CA8A04" stroke-width="3"/>
      </g>
      <!-- Anklet Bells (Ghungroo) -->
      <circle cx="420" cy="460" r="8" fill="#FBBF24" stroke="#78350F" stroke-width="1.5"/>
      <circle cx="435" cy="470" r="8" fill="#FBBF24" stroke="#78350F" stroke-width="1.5"/>
    `
  },
  {
    file: 'vasant-utsav.svg',
    title: 'Vasant Utsav Phag Khel',
    subtitle: 'Spring Festival of Saffron & Pink Gulal',
    borderCol: '#E11D48',
    accentCol: '#FBBF24',
    bgGradient: `<linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#831843"/>
      <stop offset="50%" stop-color="#9d174d"/>
      <stop offset="100%" stop-color="#4a0422"/>
    </linearGradient>`,
    innerArt: `
      <rect x="0" y="0" width="680" height="820" fill="#4B0824" rx="4" />
      <!-- Clouds of Pink Gulal & Yellow Abir -->
      <circle cx="200" cy="240" r="120" fill="#F43F5E" fill-opacity="0.35"/>
      <circle cx="480" cy="220" r="110" fill="#F59E0B" fill-opacity="0.35"/>
      <circle cx="340" cy="380" r="140" fill="#FB7185" fill-opacity="0.25"/>
      <!-- Pichkari (Brass Water Syringes) -->
      <g transform="translate(180, 520) rotate(-35)" fill="#FBBF24" stroke="#B45309" stroke-width="2">
        <rect x="-12" y="-100" width="24" height="160" rx="4"/>
        <line x1="0" y1="-100" x2="0" y2="-130" stroke="#FBBF24" stroke-width="4"/>
      </g>
      <g transform="translate(500, 520) rotate(35)" fill="#FBBF24" stroke="#B45309" stroke-width="2">
        <rect x="-12" y="-100" width="24" height="160" rx="4"/>
        <line x1="0" y1="-100" x2="0" y2="-130" stroke="#FBBF24" stroke-width="4"/>
      </g>
      <!-- Central Sanctum Figure in White & Gulal -->
      <rect x="300" y="240" width="80" height="220" rx="20" fill="#F8FAFC" stroke="#F43F5E" stroke-width="3"/>
      <circle cx="340" cy="200" r="36" fill="#0C0A09" stroke="#FBBF24" stroke-width="2"/>
    `
  },
  {
    file: 'kaliya-daman.svg',
    title: 'Kaliya Daman Sanctum Composition',
    subtitle: 'Triumph upon the Five-Headed Serpent',
    borderCol: '#0284C7',
    accentCol: '#38BDF8',
    bgGradient: `<linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#082f49"/>
      <stop offset="50%" stop-color="#0c4a6e"/>
      <stop offset="100%" stop-color="#041a29"/>
    </linearGradient>`,
    innerArt: `
      <rect x="0" y="0" width="680" height="820" fill="#062235" rx="4" />
      <!-- Swirling Whirlpools of River Yamuna -->
      <g stroke="#38BDF8" stroke-width="2" fill="none" opacity="0.7">
        <circle cx="340" cy="580" r="160" stroke-dasharray="16,8"/>
        <circle cx="340" cy="580" r="220" stroke-dasharray="24,12"/>
      </g>
      <!-- Five Hoods of Serpent Kaliya -->
      <g fill="#0F172A" stroke="#38BDF8" stroke-width="2">
        <ellipse cx="220" cy="500" rx="28" ry="50" transform="rotate(-30 220 500)"/>
        <ellipse cx="280" cy="460" rx="28" ry="55" transform="rotate(-15 280 460)"/>
        <ellipse cx="340" cy="440" rx="30" ry="60"/>
        <ellipse cx="400" cy="460" rx="28" ry="55" transform="rotate(15 400 460)"/>
        <ellipse cx="460" cy="500" rx="28" ry="50" transform="rotate(30 460 500)"/>
      </g>
      <!-- Red Eyes of Kaliya -->
      <circle cx="220" cy="490" r="4" fill="#EF4444"/>
      <circle cx="280" cy="450" r="4" fill="#EF4444"/>
      <circle cx="340" cy="430" r="4" fill="#EF4444"/>
      <circle cx="400" cy="450" r="4" fill="#EF4444"/>
      <circle cx="460" cy="490" r="4" fill="#EF4444"/>
      <!-- Lord Krishna Dancing Triumphantly Above Hoods -->
      <g transform="translate(340, 290)">
        <circle cx="0" cy="-60" r="32" fill="#0284C7" stroke="#FDE047" stroke-width="2"/>
        <rect x="-24" y="-20" width="48" height="110" rx="16" fill="#FBBF24" stroke="#EA580C" stroke-width="2"/>
        <!-- Dancing foot touching the central hood -->
        <line x1="0" y1="90" x2="0" y2="140" stroke="#0284C7" stroke-width="8"/>
        <!-- Golden Flute in Hand -->
        <line x1="-50" y1="-30" x2="50" y2="-10" stroke="#FDE047" stroke-width="5"/>
      </g>
    `
  }
];

for (const a of artworks) {
  const svg = baseSvg(a);
  fs.writeFileSync(path.join(outDir, a.file), svg, 'utf-8');
  console.log(`Generated: ${a.file}`);
}

console.log('All 14 artwork SVGs generated successfully.');

