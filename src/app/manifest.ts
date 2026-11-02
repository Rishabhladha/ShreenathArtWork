import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SHREENATH ART WORK',
    short_name: 'Shreenath Art',
    description: 'Original and print devotional paintings of Shreenathji from Nathdwara, Rajasthan.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF6EF',
    theme_color: '#262320',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}

