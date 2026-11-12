import { Resend } from 'resend';
import { formatPrice } from '@/lib/money';

let resendClient: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resendClient = new Resend(process.env.RESEND_API_KEY);
}

export async function sendOrderConfirmationEmail(params: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    title: string;
    size: string;
    frame: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  paymentMethod: string;
  shippingAddress: {
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
  };
}) {
  const fromEmail = process.env.EMAIL_FROM || 'SHREENATH ART WORK <orders@shreenathartwork.com>';
  const subject = `Order Confirmation: ${params.orderNumber} - SHREENATH ART WORK`;

  const itemsList = params.items
    .map(
      (item) =>
        `- ${item.title} (${item.size}, ${item.frame}) x ${item.quantity}: ${formatPrice(
          item.price * item.quantity
        )}`
    )
    .join('\n');

  const textBody = `
Namaste ${params.customerName},

Thank you for your order with SHREENATH ART WORK.
We have received your order ${params.orderNumber}.

Order Summary:
${itemsList}

Total Amount: ${formatPrice(params.total)}
Payment Method: ${params.paymentMethod}

Shipping Address:
${params.shippingAddress.addressLine1}
${params.shippingAddress.city}, ${params.shippingAddress.state} - ${params.shippingAddress.postalCode}

Each artwork is inspected and carefully packed in our Nathdwara workshop before dispatch.
You will receive courier tracking details once your order is shipped.

For any inquiries, reach us at:
Phone / WhatsApp: 9079901405
Address: Opposite Temple Gate, Nathdwara, Rajasthan 313301

Warm regards,
SHREENATH ART WORK
`.trim();

  if (resendClient && process.env.RESEND_API_KEY) {
    try {
      await resendClient.emails.send({
        from: fromEmail,
        to: params.customerEmail,
        subject,
        text: textBody,
      });
      console.log(`Order confirmation email sent via Resend to ${params.customerEmail}`);
      return;
    } catch (error) {
      console.error('Failed to send email via Resend, falling back to console:', error);
    }
  }

  // Development and fallback logging
  console.log('====================================================');
  console.log(`[ORDER EMAIL DISPATCHED] To: ${params.customerEmail}`);
  console.log(`Subject: ${subject}`);
  console.log(textBody);
  console.log('====================================================');
}



export async function sendPasswordResetOtpEmail(params: {
  email: string;
  otp: string;
  customerName?: string;
}) {
  const fromEmail = process.env.EMAIL_FROM || 'SHREENATH ART WORK <security@shreenathartwork.com>';
  const subject = `Your Password Reset OTP: ${params.otp} - SHREENATH ART WORK`;

  const textBody = `
Namaste ${params.customerName || 'Collector'},

You recently requested to reset the password for your SHREENATH ART WORK account.

Your 6-digit Verification Code (OTP) is:
------------------------
       ${params.otp}
------------------------

This verification code is valid for 10 minutes. Please do not share this code with anyone.

If you did not request this password reset, please disregard this email or contact our Nathdwara workshop immediately at +91 9079901405.

Warm regards,
SHREENATH ART WORK, Nathdwara
`.trim();

  if (resendClient && process.env.RESEND_API_KEY) {
    try {
      await resendClient.emails.send({
        from: fromEmail,
        to: params.email,
        subject,
        text: textBody,
      });
      console.log(`Password reset OTP email sent via Resend to ${params.email}`);
      return;
    } catch (error) {
      console.error('Failed to send OTP via Resend, falling back to console:', error);
    }
  }

  // Development and fallback logging
  console.log('====================================================');
  console.log(`[PASSWORD RESET OTP] To: ${params.email}`);
  console.log(`OTP Code: ${params.otp}`);
  console.log('Valid for: 10 minutes');
  console.log('====================================================');
}
