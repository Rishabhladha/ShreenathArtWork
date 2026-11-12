import nodemailer from 'nodemailer';
import { formatPrice } from '@/lib/money';

// Gmail SMTP configuration provided by store owner
const SMTP_USER = process.env.SMTP_USER || 'ribush.tech@gmail.com';
const SMTP_PASS = (process.env.SMTP_PASS || 'sdyw dmca nobx zndu').replace(/\s+/g, '');
const FROM_ADDRESS = process.env.SMTP_FROM || `"SHREENATH ART WORK" <${SMTP_USER}>`;

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Sends order confirmation email to the patron upon checkout.
 */
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
  const subject = `Order Confirmed: ${params.orderNumber} - SHREENATH ART WORK`;

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
We have safely received your order ${params.orderNumber}.

Order Summary:
${itemsList}

Total Amount: ${formatPrice(params.total)}
Payment Method: ${params.paymentMethod}

Shipping Address:
${params.shippingAddress.addressLine1}
${params.shippingAddress.city}, ${params.shippingAddress.state} - ${params.shippingAddress.postalCode}

Each artwork is inspected and carefully packed in our Nathdwara workshop in multi-layer moisture-resistant wooden box packaging.
You will receive courier waybill tracking details once your order is dispatched.

For any inquiries, reach us at:
Phone / WhatsApp: +91 9079901405
Address: Opposite Temple Gate, Nathdwara, Rajasthan 313301

Warm regards,
SHREENATH ART WORK, Nathdwara
`.trim();

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF7EE; border: 1px solid #DEC99C; border-radius: 4px; overflow: hidden; color: #231C10;">
      <div style="background: #231C10; padding: 24px; text-align: center; border-bottom: 2px solid #DEC99C;">
        <h1 style="color: #DEC99C; margin: 0; font-family: Georgia, serif; font-size: 22px; letter-spacing: 2px;">SHREENATH ART WORK</h1>
        <p style="color: #FAF7EE; margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Traditional Nathdwara Pichwai & Sanctum Art</p>
      </div>
      <div style="padding: 28px 24px;">
        <p style="font-size: 15px; margin: 0 0 16px;">Namaste <strong>${params.customerName}</strong>,</p>
        <p style="font-size: 13px; line-height: 1.6; color: #4A3E2D; margin: 0 0 20px;">
          Thank you for patronizing our sacred art. We have confirmed your order <strong>${params.orderNumber}</strong>.
        </p>

        <div style="background: #FFFFFF; border: 1px solid #DEC99C; border-radius: 4px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #8A6D3B; border-bottom: 1px solid #F0E6D2; pb-2;">Order Items</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #231C10;">
            ${params.items.map((i) => `<li style="margin-bottom: 8px;"><strong>${i.title}</strong> (${i.size}, ${i.frame}) × ${i.quantity} — <strong>${formatPrice(i.price * i.quantity)}</strong></li>`).join('')}
          </ul>
          <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #F0E6D2; display: flex; justify-content: space-between; font-size: 14px; font-weight: bold;">
            <span>Total Amount:</span>
            <span style="color: #8A5A32;">${formatPrice(params.total)}</span>
          </div>
        </div>

        <p style="font-size: 12px; color: #7A694F; line-height: 1.5; margin: 0 0 16px;">
          <strong>Delivery Address:</strong><br/>
          ${params.shippingAddress.addressLine1}, ${params.shippingAddress.city}, ${params.shippingAddress.state} - ${params.shippingAddress.postalCode}
        </p>

        <p style="font-size: 12px; color: #7A694F; line-height: 1.5; margin: 0 0 20px;">
          Every artwork is handcrafted and packed in insured museum-grade crates. You will receive live courier tracking as soon as it leaves our Nathdwara gallery.
        </p>

        <div style="border-top: 1px solid #DEC99C; padding-top: 16px; font-size: 11px; color: #8A8175; text-align: center;">
          <p style="margin: 0;">Opposite Temple Gate, Nathdwara, Rajasthan 313301</p>
          <p style="margin: 4px 0 0;">Customer Care & WhatsApp: +91 9079901405</p>
        </div>
      </div>
    </div>
  `;

  try {
    const mailer = getTransporter();
    await mailer.sendMail({
      from: FROM_ADDRESS,
      to: params.customerEmail,
      subject,
      text: textBody,
      html: htmlBody,
    });
    console.log(`Order confirmation email sent via Gmail SMTP to ${params.customerEmail}`);
  } catch (error) {
    console.error('Failed to send order confirmation email via SMTP, logging to console:', error);
    console.log(`[ORDER EMAIL DISPATCHED] To: ${params.customerEmail} | Order: ${params.orderNumber}`);
  }
}

/**
 * Sends 6-digit OTP email for Password Reset.
 */
export async function sendPasswordResetOtpEmail(params: {
  email: string;
  otp: string;
  customerName?: string;
}) {
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

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #FAF7EE; border: 1px solid #DEC99C; border-radius: 4px; overflow: hidden; color: #231C10;">
      <div style="background: #231C10; padding: 20px; text-align: center; border-bottom: 2px solid #DEC99C;">
        <h1 style="color: #DEC99C; margin: 0; font-family: Georgia, serif; font-size: 20px; letter-spacing: 2px;">SHREENATH ART WORK</h1>
        <p style="color: #FAF7EE; margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Account Security Verification</p>
      </div>
      <div style="padding: 24px;">
        <p style="font-size: 14px; margin: 0 0 12px;">Namaste ${params.customerName || 'Collector'},</p>
        <p style="font-size: 13px; line-height: 1.5; color: #4A3E2D; margin: 0 0 20px;">
          We received a request to reset your password. Use the verification code below to complete your password update.
        </p>

        <div style="background: #FFFFFF; border: 2px dashed #DEC99C; border-radius: 6px; padding: 18px; text-align: center; margin: 20px 0;">
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #8A6D3B; font-weight: 600; display: block; margin-bottom: 6px;">Your One-Time Passcode</span>
          <span style="font-family: monospace, Courier; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #231C10;">${params.otp}</span>
          <span style="display: block; font-size: 11px; color: #8A8175; margin-top: 6px;">Valid for 10 minutes</span>
        </div>

        <p style="font-size: 12px; color: #7A694F; line-height: 1.5; margin: 0 0 16px;">
          Never share this code with anyone. Gallery staff will never ask for your verification code.
        </p>

        <div style="border-top: 1px solid #DEC99C; padding-top: 14px; font-size: 11px; color: #8A8175; text-align: center;">
          <p style="margin: 0;">SHREENATH ART WORK • Nathdwara, Rajasthan 313301</p>
          <p style="margin: 4px 0 0;">Inquiries: +91 9079901405 | ribush.tech@gmail.com</p>
        </div>
      </div>
    </div>
  `;

  try {
    const mailer = getTransporter();
    await mailer.sendMail({
      from: FROM_ADDRESS,
      to: params.email,
      subject,
      text: textBody,
      html: htmlBody,
    });
    console.log(`Password reset OTP email dispatched via Gmail SMTP to ${params.email}`);
  } catch (error) {
    console.error('Failed to dispatch password reset OTP via SMTP, falling back to console:', error);
    console.log(`[PASSWORD RESET OTP] To: ${params.email} | OTP: ${params.otp}`);
  }
}

/**
 * Sends 6-digit OTP email for Account Verification & Login Verification.
 */
export async function sendEmailVerificationOtpEmail(params: {
  email: string;
  otp: string;
  customerName?: string;
}) {
  const subject = `Your Verification Code: ${params.otp} - SHREENATH ART WORK`;

  const textBody = `
Namaste ${params.customerName || 'Collector'},

Welcome to SHREENATH ART WORK, Nathdwara.
To verify your email address and activate your collector account, please enter the one-time verification code below:

Your 6-digit Verification Code (OTP) is:
------------------------
       ${params.otp}
------------------------

This verification code is valid for 10 minutes.

With your verified account, you can track hand-painted Pichwais, save custom commission requests, and receive insured shipment notifications.

Warm regards,
SHREENATH ART WORK
Opposite Temple Gate, Nathdwara, Rajasthan 313301
Phone / WhatsApp: +91 9079901405
`.trim();

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #FAF7EE; border: 1px solid #DEC99C; border-radius: 4px; overflow: hidden; color: #231C10;">
      <div style="background: #231C10; padding: 20px; text-align: center; border-bottom: 2px solid #DEC99C;">
        <h1 style="color: #DEC99C; margin: 0; font-family: Georgia, serif; font-size: 20px; letter-spacing: 2px;">SHREENATH ART WORK</h1>
        <p style="color: #FAF7EE; margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Email Verification & Patron Authentication</p>
      </div>
      <div style="padding: 24px;">
        <p style="font-size: 14px; margin: 0 0 12px;">Namaste ${params.customerName || 'Collector'},</p>
        <p style="font-size: 13px; line-height: 1.5; color: #4A3E2D; margin: 0 0 20px;">
          Welcome to the sacred art tradition of Nathdwara. Please verify your email address to access your collector account, order history, and insured tracking.
        </p>

        <div style="background: #FFFFFF; border: 2px dashed #DEC99C; border-radius: 6px; padding: 18px; text-align: center; margin: 20px 0;">
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #8A6D3B; font-weight: 600; display: block; margin-bottom: 6px;">Email Verification OTP</span>
          <span style="font-family: monospace, Courier; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #231C10;">${params.otp}</span>
          <span style="display: block; font-size: 11px; color: #8A8175; margin-top: 6px;">Valid for 10 minutes</span>
        </div>

        <p style="font-size: 12px; color: #7A694F; line-height: 1.5; margin: 0 0 16px;">
          Enter this 6-digit code on the verification screen to activate your account and proceed to checkout.
        </p>

        <div style="border-top: 1px solid #DEC99C; padding-top: 14px; font-size: 11px; color: #8A8175; text-align: center;">
          <p style="margin: 0;">SHREENATH ART WORK • Nathdwara, Rajasthan 313301</p>
          <p style="margin: 4px 0 0;">Customer Care: +91 9079901405 | ribush.tech@gmail.com</p>
        </div>
      </div>
    </div>
  `;

  try {
    const mailer = getTransporter();
    await mailer.sendMail({
      from: FROM_ADDRESS,
      to: params.email,
      subject,
      text: textBody,
      html: htmlBody,
    });
    console.log(`Email verification OTP dispatched via Gmail SMTP to ${params.email}`);
  } catch (error) {
    console.error('Failed to dispatch email verification OTP via SMTP, falling back to console:', error);
    console.log(`[EMAIL VERIFICATION OTP] To: ${params.email} | OTP: ${params.otp}`);
  }
}
