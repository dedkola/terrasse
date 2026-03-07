import { MetadataRoute } from 'next';
import { d1Query } from '@/lib/d1';
import { Product } from '@/types';

export const revalidate = 3600; // regenerate sitemap hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://terrasse.vercel.app';

    let products: Product[] = [];
    try {
        const result = await d1Query<Product>('SELECT id, name FROM products');
        products = result.results;
    } catch {
        // If DB is unreachable, still return static routes
    }

    const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
        url: `${baseUrl}/jeans/${p.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/jeans`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        ...productUrls,
    ];
}
