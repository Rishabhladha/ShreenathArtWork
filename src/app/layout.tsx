import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import { SessionProviderWrapper } from '@/components/layout/SessionProviderWrapper';

const cormorant = Cormorant_Garamond({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://shreenathartwork.com'),
  title: {
    default: 'SHREENATH ART WORK | Pichwai and Devotional Paintings from Nathdwara',
    template: '%s | SHREENATH ART WORK',
  },
  description:
    'Hand painted and archival print devotional artworks of Shreenathji. Authentic Pichwai, sanctum portraits, and festival compositions handcrafted and framed in Nathdwara, Rajasthan.',
  keywords: [
    'Shreenathji paintings',
    'Pichwai art',
    'Nathdwara art gallery',
    'Devotional Hindu art',
    'Kamal Talai Pichwai',
    'Traditional Indian paintings',
  ],
  authors: [{ name: 'SHREENATH ART WORK' }],
  creator: 'SHREENATH ART WORK',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://shreenathartwork.com',
    siteName: 'SHREENATH ART WORK',
    title: 'SHREENATH ART WORK | Nathdwara Pichwai Gallery',
    description: 'Devotional paintings and framed artworks of Shreenathji directly from Nathdwara.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SHREENATH ART WORK | Nathdwara Pichwai Gallery',
    description: 'Devotional paintings and framed artworks of Shreenathji directly from Nathdwara.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#FAF6EF] text-[#262320]">
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
