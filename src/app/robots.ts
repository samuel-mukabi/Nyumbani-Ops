import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/reservations/',
        '/portal/',
        '/api/',
        '/_next/',
        '/settings/',
        '/compliance/',
        '/statements/',
      ],
    },
    sitemap: 'https://nyumbani-ops.com/sitemap.xml',
  };
}
