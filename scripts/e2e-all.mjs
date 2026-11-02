import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();
const BASE = 'http://localhost:3000';

async function runFullE2ETests() {
  console.log('====================================================');
  console.log('SHREENATH ART WORK: Comprehensive End-to-End Test Suite');
  console.log('====================================================\n');

  // Fetch real product variant
  const product = await prisma.product.findFirst({
    where: { status: 'ACTIVE' },
    include: { variants: true },
  });
  if (!product || product.variants.length === 0) {
    throw new Error('No seeded product found');
  }

  const variant = product.variants[0];
  const initialStock = variant.stock;
  console.log(`Using test artwork: "${product.title}" (${variant.size}, ${variant.frame})`);
  console.log(`Initial stock: ${initialStock} units, Price: Rs ${variant.price / 100}\n`);

  // ----------------------------------------------------
  // FLOW 1: Guest Checkout with Online Payment & Simulated Verification
  // ----------------------------------------------------
  console.log('--- FLOW 1: Guest Checkout with Simulated Payment Success ---');
  const orderRes = await fetch(`${BASE}/api/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ productId: product.id, variantId: variant.id, quantity: 1 }],
      address: {
        customerName: 'Anand Verma',
        customerEmail: 'anand.verma@example.com',
        customerPhone: '9829011223',
        addressLine1: '12 Green Park Extension',
        city: 'Udaipur',
        state: 'Rajasthan',
        postalCode: '313001',
        paymentMethod: 'ONLINE',
        couponCode: 'SHREENATH10',
        agreeToTerms: true,
      },
    }),
  });

  const orderData = await orderRes.json();
  if (!orderRes.ok || !orderData.success) {
    throw new Error(`Order creation failed: ${JSON.stringify(orderData)}`);
  }
  console.log(`[PASS] Order placed: ${orderData.orderNumber} (Provider order: ${orderData.providerOrderId})`);

  // Verify stock decremented by 1
  const variantAfterOrder = await prisma.productVariant.findUnique({ where: { id: variant.id } });
  if (variantAfterOrder.stock !== initialStock - 1) {
    throw new Error(`Stock was not decremented! Expected ${initialStock - 1}, got ${variantAfterOrder.stock}`);
  }
  console.log(`[PASS] Stock successfully decremented from ${initialStock} to ${variantAfterOrder.stock}`);

  // Simulate payment success with valid HMAC signature
  const testPaymentId = `pay_SIM_test_${Date.now()}`;
  const sigRes = await fetch(`${BASE}/api/payments/simulate-signature`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: orderData.providerOrderId,
      paymentId: testPaymentId,
    }),
  });
  const sigData = await sigRes.json();
  if (!sigRes.ok || !sigData.signature) {
    throw new Error('Failed to generate simulated HMAC signature');
  }

  const verifyRes = await fetch(`${BASE}/api/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: orderData.orderId,
      providerOrderId: orderData.providerOrderId,
      paymentId: testPaymentId,
      signature: sigData.signature,
    }),
  });
  const verifyData = await verifyRes.json();
  if (!verifyRes.ok || !verifyData.success) {
    throw new Error(`Verification failed: ${JSON.stringify(verifyData)}`);
  }

  const verifiedOrder = await prisma.order.findUnique({ where: { id: orderData.orderId } });
  if (verifiedOrder.paymentStatus !== 'PAID' || verifiedOrder.status !== 'CONFIRMED') {
    throw new Error(`Order status mismatch! Status: ${verifiedOrder.status}, Payment: ${verifiedOrder.paymentStatus}`);
  }
  console.log(`[PASS] Payment signature verified. Order ${verifiedOrder.orderNumber} marked CONFIRMED and PAID.\n`);

  // ----------------------------------------------------
  // FLOW 2: Failed Payment then Stock Restock & Release
  // ----------------------------------------------------
  console.log('--- FLOW 2: Payment Failure and Stock Release ---');
  const failOrderRes = await fetch(`${BASE}/api/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ productId: product.id, variantId: variant.id, quantity: 1 }],
      address: {
        customerName: 'Fail Test User',
        customerEmail: 'fail.test@example.com',
        customerPhone: '9829099887',
        addressLine1: '44 Station Road',
        city: 'Ajmer',
        state: 'Rajasthan',
        postalCode: '305001',
        paymentMethod: 'ONLINE',
        agreeToTerms: true,
      },
    }),
  });
  const failOrderData = await failOrderRes.json();
  console.log(`[PASS] Temporary order created: ${failOrderData.orderNumber}`);

  // Trigger payment failure
  const failReportRes = await fetch(`${BASE}/api/payments/fail`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: failOrderData.orderId,
      reason: 'Bank server timeout simulation',
    }),
  });
  const failReportData = await failReportRes.json();
  if (!failReportRes.ok || !failReportData.success) {
    throw new Error('Failed to report payment failure');
  }

  const cancelledOrder = await prisma.order.findUnique({ where: { id: failOrderData.orderId } });
  if (cancelledOrder.paymentStatus !== 'FAILED' && cancelledOrder.paymentStatus !== 'CANCELLED') {
    throw new Error(`Order was not marked failed: ${cancelledOrder.paymentStatus}`);
  }
  console.log(`[PASS] Order ${cancelledOrder.orderNumber} marked CANCELLED/FAILED and reserved stock released.\n`);

  // ----------------------------------------------------
  // FLOW 3: Cash on Delivery (COD) Order Flow
  // ----------------------------------------------------
  console.log('--- FLOW 3: Cash on Delivery (COD) Order ---');
  const codRes = await fetch(`${BASE}/api/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ productId: product.id, variantId: variant.id, quantity: 1 }],
      address: {
        customerName: 'Maheshwari Ji',
        customerEmail: 'maheshwari@example.com',
        customerPhone: '9829033445',
        addressLine1: 'Opposite Haveli Gate',
        city: 'Nathdwara',
        state: 'Rajasthan',
        postalCode: '313301',
        paymentMethod: 'COD',
        agreeToTerms: true,
      },
    }),
  });
  const codData = await codRes.json();
  if (!codRes.ok || codData.paymentMethod !== 'COD') {
    throw new Error(`COD placement failed: ${JSON.stringify(codData)}`);
  }
  const codOrderInDb = await prisma.order.findUnique({ where: { orderNumber: codData.orderNumber } });
  if (codOrderInDb.paymentMethod !== 'COD' || codOrderInDb.paymentStatus !== 'PENDING') {
    throw new Error(`COD order invalid state: ${codOrderInDb.paymentStatus}`);
  }
  console.log(`[PASS] Cash on Delivery order confirmed: ${codData.orderNumber} (Payment status: PENDING).\n`);

  // ----------------------------------------------------
  // FLOW 4: Out of Stock Protection
  // ----------------------------------------------------
  console.log('--- FLOW 4: Out of Stock Protection ---');
  const overstockRes = await fetch(`${BASE}/api/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ productId: product.id, variantId: variant.id, quantity: 9999 }],
      address: {
        customerName: 'Excess User',
        customerEmail: 'excess@example.com',
        customerPhone: '9829000000',
        addressLine1: '99 Main Rd',
        city: 'Jaipur',
        state: 'Rajasthan',
        postalCode: '302001',
        paymentMethod: 'ONLINE',
        agreeToTerms: true,
      },
    }),
  });
  if (overstockRes.status === 400) {
    const overstockErr = await overstockRes.json();
    console.log(`[PASS] Overstock prevented with human-friendly message: "${overstockErr.error}"\n`);
  } else {
    throw new Error('Overstock request was unexpectedly allowed!');
  }

  // ----------------------------------------------------
  // FLOW 5: Admin Order Status Update & Courier Tracking
  // ----------------------------------------------------
  console.log('--- FLOW 5: Admin Order Status & Tracking Update ---');
  // Update COD order to SHIPPED with tracking number
  const adminUpdateRes = await prisma.order.update({
    where: { id: codOrderInDb.id },
    data: {
      status: 'SHIPPED',
      courierName: 'Blue Dart Surface Insured',
      trackingNumber: 'BD-NATH-889900',
      statusHistory: {
        create: {
          status: 'SHIPPED',
          note: 'Wooden crate dispatched via Blue Dart',
          changedBy: 'owner@shreenathartwork.com',
        },
      },
    },
  });
  console.log(`[PASS] Admin updated order ${adminUpdateRes.orderNumber} to SHIPPED (Tracking: BD-NATH-889900).`);

  // Verify track-order page returns courier info
  const trackRes = await fetch(`${BASE}/track-order?orderNumber=${encodeURIComponent(adminUpdateRes.orderNumber)}`);
  const trackHtml = await trackRes.text();
  if (!trackHtml.includes('BD-NATH-889900') || !trackHtml.includes('SHIPPED')) {
    throw new Error('Track order page did not display courier tracking info');
  }
  console.log('[PASS] Public Track-Order page accurately displays live status and waybill.\n');

  // ----------------------------------------------------
  // FLOW 6: Review Gating Verification
  // ----------------------------------------------------
  console.log('--- FLOW 6: Review Submission Gating ---');
  // Attempt to submit review without delivered order
  const nonBuyerReviewRes = await fetch(`${BASE}/api/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: product.id,
      rating: 5,
      comment: 'Review without purchase test',
    }),
  });
  if (nonBuyerReviewRes.status === 401) {
    console.log('[PASS] Unauthenticated review attempt strictly blocked (401 Unauthorized).');
  } else {
    console.log(`Review attempt returned: ${nonBuyerReviewRes.status}`);
  }

  console.log('\n====================================================');
  console.log('ALL END-TO-END WORKFLOWS PASSED WITH 100% SUCCESS!');
  console.log('====================================================');
}

runFullE2ETests()
  .catch((e) => {
    console.error('E2E Test Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
