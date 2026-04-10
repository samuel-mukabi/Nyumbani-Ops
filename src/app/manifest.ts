import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nyumbani-Ops | Precision Property Management',
    short_name: 'Nyumbani-Ops',
    description: 'Advanced automation for Kenyan short-term rental operators.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/og-image.png',
        sizes: '1200x630',
        type: 'image/png',
      }
    ],
  };
}
