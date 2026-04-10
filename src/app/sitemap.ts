import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://nyumbani-ops.com';

  // These are the public routes that should be indexed
  const routes = [
    '',
    '/features',
    '/howitworks',
    '/integrations',
    '/sign-in',
    '/sign-up',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new URLSearchParams().get('t') ? new Date() : new Date(), // Using current date
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
