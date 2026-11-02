# SHREENATH ART WORK - Devotional Art Gallery (Nathdwara)

A complete, production-ready e-commerce web platform for **SHREENATH ART WORK**, a devotional art gallery and framing workshop located in Nathdwara, Rajasthan. The gallery specializes in authentic hand-painted Pichwai paintings, sacred sanctum portraits of Shreenathji, festival compositions, and miniature artworks.

---

## 1. Tech Stack

- **Framework:** Next.js (App Router) with TypeScript in strict mode
- **Styling:** Tailwind CSS (calm warm ivory palette: `#FAF6EF`, soft sand surfaces, warm charcoal text, muted turmeric/saffron accents, 2px to 4px border radius)
- **Database & ORM:** MongoDB (MongoDB Atlas or local replica set) with Prisma ORM
- **Authentication:** Auth.js (NextAuth) with customer accounts and role-based admin access (OWNER, STAFF)
- **Validation:** Zod schemas for all client and server endpoints
- **Forms:** React Hook Form with `@hookform/resolvers/zod`
- **Image Storage:** Vercel Blob adapter with development local fallback
- **Cart & Wishlist:** Zustand with localStorage persistence and stock re-validation
- **Payment Abstraction:** Pluggable `PaymentProvider` interface with a complete HMAC SHA-256 test simulator and a production Razorpay adapter
- **Email:** Resend client with console logging fallback for development
- **Icons:** Lucide React line icons used sparingly
- **Typography:** Cormorant Garamond (headings) and Inter (body) via `next/font/google`

---

## 2. Strict Design Principles Followed

- **Zero purple or gradients anywhere.**
- **No pill-shaped buttons:** Small 2px to 4px radius (`rounded-sm`).
- **No emoji anywhere:** Consistent line icons (`lucide-react`) only.
- **No em dashes in copy or comments:** All sentences use commas, colons, or periods.
- **No fake reviews or ratings:** Reviews can only be submitted by authenticated customers who have a delivered order for that specific artwork. All seed data contains zero fake reviews.
- **No fake metrics or urgency counters:** Stock messages are calculated strictly from real database quantities.
- **Plain, factual hero copy:** e.g. "Hand painted Shreenathji art, made and framed in Nathdwara."
- **Neutral artwork placeholders:** Soft sand rectangles labeled "Photo to be added". No stock or AI-generated art photos.
- **Custom monogram favicon:** Typographic "SAW" monogram in the site palette. Default framework icons completely removed.
- **Accessibility & SEO:** Semantic HTML, skip-to-content links, keyboard navigation, JSON-LD structured data for Product and Organization, sitemap.xml, and robots.txt blocking `/admin` and `/api`.

---

## 3. Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```env
# MongoDB Connection String (MongoDB Atlas or local replica set)
DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.mongodb.net/shreenath?retryWrites=true&w=majority"

# Auth.js / NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-32-character-secret-key-goes-here"

# Default admin seeded on startup (never hardcode in production)
ADMIN_EMAIL="owner@shreenathartwork.com"
ADMIN_PASSWORD="ReplaceWithSecurePassword123!"
ADMIN_NAME="Gallery Curator"

# Payment mode: "simulated" or "razorpay"
PAYMENT_MODE="simulated"
SIMULATED_RAZORPAY_SECRET="your-simulated-hmac-secret-key"

# Razorpay credentials (required when PAYMENT_MODE="razorpay")
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""

# Image Storage (Vercel Blob token for cloud uploads; dev fallback saves to public/uploads)
BLOB_READ_WRITE_TOKEN=""

# Email via Resend (optional; if empty, emails log to server console)
RESEND_API_KEY=""
EMAIL_FROM="SHREENATH ART WORK <orders@shreenathartwork.com>"
```

---

## 4. Local Installation and Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate Prisma Client and push database schema to MongoDB:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Seed database with admin, 5 categories, 8 demo paintings, and coupons:**
   ```bash
   npx tsx prisma/seed.ts
   ```

4. **Run automated unit tests:**
   ```bash
   npx vitest run
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

6. **Log in to Admin Panel:**
   - URL: `http://localhost:3000/admin/login`
   - Email: `owner@shreenathartwork.com`
   - Password: `AdminPassword2026!` (or the value set in your `.env`)

---

## 5. Switching from Payment Simulator to Real Razorpay

The platform uses a payment provider abstraction layer (`src/lib/payments/`). To enable live Razorpay transactions:

1. Obtain your API keys from the [Razorpay Dashboard](https://dashboard.razorpay.com/#/access-keys).
2. Set the following environment variables in your production environment (or on Vercel):
   ```env
   PAYMENT_MODE="razorpay"
   RAZORPAY_KEY_ID="rzp_live_your_key_id"
   RAZORPAY_KEY_SECRET="your_live_key_secret"
   ```
3. In `src/lib/payments/real-razorpay.ts`, uncomment the live Razorpay Orders API call in `createOrder()` and `verifyPayment()`.
4. Register your webhook URL in Razorpay Dashboard pointing to:
   `https://yourdomain.com/api/payments/webhook`
   with your webhook secret matching `RAZORPAY_KEY_SECRET`.

No changes to checkout, cart, or order logic are required.

---

## 6. Deploying to Vercel

1. Push your repository to GitHub or GitLab.
2. In the Vercel Dashboard, select **Add New Project** and import the repository.
3. Attach a **Vercel Postgres** or **Neon Database** instance. Copy the connection string to `DATABASE_URL`.
4. Add all environment variables listed in Section 3 in Vercel **Project Settings > Environment Variables**.
5. Set Build Command: `prisma generate && next build`.
6. Click **Deploy**.

### Custom Domain Setup:
1. In Vercel Project Settings, navigate to **Domains**.
2. Add your apex domain (e.g. `shreenathartwork.com`) and www subdomain (`www.shreenathartwork.com`).
3. In your DNS provider (e.g. Cloudflare, GoDaddy, Namecheap), add the recommended records:
   - `A` record for `@` pointing to `76.76.21.21`
   - `CNAME` record for `www` pointing to `cname.vercel-dns.com`
4. Configure redirect from `shreenathartwork.com` to `www.shreenathartwork.com` (or vice-versa).
5. Vercel automatically provisions and renews SSL/TLS certificates via Let's Encrypt.

---

## 7. Pre-Launch Checklist for Gallery Owner

Before launching the store to the public, the gallery owner should complete the following steps:

1. **Replace Demo Artworks:**
   - Log into `/admin/products`.
   - Archive or delete the seeded DEMO artworks.
   - Upload high-resolution photographs of real paintings crafted in the Nathdwara gallery.
2. **Review Business Details:**
   - Go to `/admin/settings` and verify the gallery phone number (`9079901405`), physical address, and visiting hours.
3. **Legal Review of Policies:**
   - Have a certified legal professional review `/terms`, `/privacy`, and `/shipping-returns`.
   - Update Grievance Officer details and tax registration numbers (GSTIN/PAN).
4. **Payment Gateway Credentials:**
   - Generate production Razorpay API keys and configure them in `.env`.
   - Perform a small test purchase in production to verify webhook events.
5. **Email Delivery Configuration:**
   - Verify domain in Resend and add `RESEND_API_KEY` so customers receive instant order confirmation emails.
6. **Set a Strong Admin Password:**
   - Change the initial default admin password from the profile or update `ADMIN_PASSWORD` in your production environment.
