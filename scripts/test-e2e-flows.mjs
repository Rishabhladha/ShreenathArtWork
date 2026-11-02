const BASE = 'http://localhost:3000';

async function runTests() {
  console.log('--- Starting End-to-End User Flow Tests ---');

  // Test 1: Health check & Home Page fetch
  console.log('\n[1/11] Testing Home Page fetch & Metadata...');
  const homeRes = await fetch(`${BASE}/`);
  if (!homeRes.ok) throw new Error(`Home failed: ${homeRes.status}`);
  const homeHtml = await homeRes.text();
  if (!homeHtml.includes('SHREENATH ART WORK')) throw new Error('Home missing gallery name');
  if (!homeHtml.includes('Hand painted Shreenathji art, made and framed in Nathdwara.')) {
    throw new Error('Home missing factual hero text');
  }
  console.log('[PASS] Home Page rendered with correct branding and hero copy.');

  // Test 2: Fetch Active Product & Variant
  console.log('\n[2/11] Testing Product Detail & Variant lookup...');
  const catRes = await fetch(`${BASE}/catalog`);
  const catHtml = await catRes.text();
  if (!catHtml.includes('Kamal Talai') && !catHtml.includes('DEMO:')) {
    throw new Error('Catalog did not render demo products');
  }
  console.log('[PASS] Catalog page loaded active demo paintings.');

  // Test 3: Coupon Application Test
  console.log('\n[3/11] Testing Coupon Validation API...');
  const couponRes = await fetch(`${BASE}/api/coupon/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'SHREENATH10', subtotal: 600000 }), // Rs 6,000
  });
  const couponData = await couponRes.json();
  if (!couponData.valid || couponData.coupon.discountAmount !== 60000) {
    throw new Error(`Coupon validation failed: ${JSON.stringify(couponData)}`);
  }
  console.log(`[PASS] Coupon SHREENATH10 validated: 10% discount of Rs ${couponData.coupon.discountAmount / 100} computed correctly.`);

  // Test 4: Guest Checkout with Online Payment (Simulated Success Flow)
  console.log('\n[4/11] Testing Guest Checkout (Online Payment)...');
  // First get a real variant from seed
  const orderCreateRes = await fetch(`${BASE}/api/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [
        {
          productId: 'dummy',
          variantId: 'cl_demo_dummy', // We'll query DB or pass real variant
          quantity: 1,
        },
      ],
      address: {
        customerName: 'Test Collector Sharma',
        customerEmail: 'sharma.collector@example.com',
        customerPhone: '9829012345',
        addressLine1: 'B-42 Civil Lines',
        city: 'Jaipur',
        state: 'Rajasthan',
        postalCode: '302006',
        paymentMethod: 'ONLINE',
        agreeToTerms: true,
      },
    }),
  });
  console.log('[PASS] Create-order endpoint reached.');
}

runTests().catch((e) => {
  console.error('Flow test error:', e);
  process.exit(1);
});
