import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    // Update this with your actual production domain when you deploy
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://terrasse.vercel.app';

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        // Example of adding more static routes if you create them in the future:
        // {
        //   url: `${baseUrl}/about`,
        //   lastModified: new Date(),
        //   changeFrequency: 'monthly',
        //   priority: 0.8,
        // },
    ];
}
