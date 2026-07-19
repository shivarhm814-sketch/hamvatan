import type { MetadataRoute } from 'next';
import { listProperties } from '@/lib/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3002';

const STATIC_ROUTES = [
  '',
  '/properties',
  '/services/request',
  '/construction',
  '/services/track',
  '/contact',
  '/about',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }));

  try {
    const { items } = await listProperties({ limit: 100, page: 1 });
    const propertyEntries: MetadataRoute.Sitemap = items.map((property) => ({
      url: `${SITE_URL}/properties/${property.id}`,
      lastModified: property.updatedAt,
    }));
    return [...staticEntries, ...propertyEntries];
  } catch {
    return staticEntries;
  }
}
