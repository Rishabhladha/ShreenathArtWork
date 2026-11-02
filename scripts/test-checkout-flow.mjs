import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function run() {
  console.log("Testing end-to-end checkout & payment simulator...");

  // 1. Get first active product & variant
  const product = await prisma.product.findFirst({
    where: { status: 'ACTIVE' },
    include: { variants: true },
  });

  if (!product || product.variants.length === 0) {
    throw new Error("No active products or variants found!");
  }

  const variant = product.variants[0];
  console.log(`Testing with product: "${product.title}" (${variant.size}, ${variant.frame}) - Price: Rs ${variant.price/100}`);

  // 2. Call create-order API
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const createRes = await fetch(`${baseUrl}/api/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [
        {
          productId: product.id,
          variantId: variant.id,
          quantity: 1,
        },
      ],
      address: {
        customerName: 'Manthan Kabra',
        customerEmail: 'shreenathartwork@gmail.com',
        customerPhone: '9079901405',
        addressLine1: 'Opposite Temple Gate',
        addressLine2: 'Main Haveli Marg',
        city: 'Nathdwara',
        state: 'Rajasthan',
        postalCode: '313301',
        paymentMethod: 'ONLINE',
      },
    }),
  });

  const orderData = await createRes.json();
  console.log("Create Order Response:", orderData);
  if (!createRes.ok || !orderData.orderId) {
    throw new Error(`Failed to create order: ${JSON.stringify(orderData)}`);
  }

  // 3. Call simulate-signature API
  const paymentId = `pay_SIM_${Math.random().toString(36).substring(2, 10)}`;
  const sigRes = await fetch(`${baseUrl}/api/payments/simulate-signature`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: orderData.providerOrderId,
      paymentId,
    }),
  });

  const sigData = await sigRes.json();
  console.log("Simulate Signature Response:", sigData);
  if (!sigRes.ok || !sigData.signature) {
    throw new Error(`Failed to generate test signature: ${JSON.stringify(sigData)}`);
  }

  // 4. Call verify API
  const verifyRes = await fetch(`${baseUrl}/api/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: orderData.orderId,
      providerOrderId: orderData.providerOrderId,
      paymentId,
      signature: sigData.signature,
    }),
  });

  const verifyData = await verifyRes.json();
  console.log("Payment Verification Response:", verifyData);
  if (!verifyRes.ok || !verifyData.success) {
    throw new Error(`Payment verification failed: ${JSON.stringify(verifyData)}`);
  }

  // 5. Query MongoDB Atlas directly to confirm order status
  const verifiedOrder = await prisma.order.findUnique({
    where: { id: orderData.orderId },
    include: { payments: true, statusHistory: true },
  });

  console.log("Verified Order in MongoDB Atlas:");
  console.log(`- Order Number: ${verifiedOrder.orderNumber}`);
  console.log(`- Status: ${verifiedOrder.status}`);
  console.log(`- Payment Status: ${verifiedOrder.paymentStatus}`);
  console.log(`- Total: Rs ${verifiedOrder.total / 100}`);
  console.log(`- Payments count: ${verifiedOrder.payments.length}`);

  if (verifiedOrder.status !== 'CONFIRMED' || verifiedOrder.paymentStatus !== 'PAID') {
    throw new Error("Order was not updated to CONFIRMED / PAID in database!");
  }

  console.log("SUCCESS! Complete checkout and payment simulation verified end-to-end!");
}

run()
  .catch((e) => {
    console.error("Test flow failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

