import { NextRequest, NextResponse } from 'next/server';
import { d1Query } from '@/lib/d1';
import { uploadToR2 } from '@/lib/r2';
import { slugify } from '@/lib/slugify';
import { randomUUID } from 'crypto';

async function generateUniqueSlug(name: string): Promise<string> {
    const base = slugify(name);
    const result = await d1Query<{ slug: string }>(
        'SELECT slug FROM products WHERE slug >= ? AND slug < ?',
        [base, base + '~']
    );
    const existing = result.results.map((r) => r.slug);
    if (!existing.includes(base)) return base;
    let i = 2;
    while (existing.includes(`${base}-${i}`)) i++;
    return `${base}-${i}`;
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const name = formData.get('name') as string;
        const price = formData.get('price') as string;
        const category = formData.get('category') as string;
        const description = formData.get('description') as string;
        const isNew = formData.get('isNew') === 'true' ? 1 : 0;
        const youtubeUrl = (formData.get('youtube_url') as string) || null;

        if (!name || !price || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Upload all image files (image_0 … image_5)
        const imageUrls: string[] = [];
        for (let i = 0; i < 6; i++) {
            const file = formData.get(`image_${i}`) as File | null;
            if (!file || file.size === 0) continue;
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const ext = file.name.split('.').pop() || 'jpg';
            const filename = `${randomUUID()}.${ext}`;
            const url = await uploadToR2(buffer, filename, file.type);
            imageUrls.push(url);
        }

        if (imageUrls.length === 0) {
            return NextResponse.json({ error: 'At least one image is required' }, { status: 400 });
        }

        const id = randomUUID();
        const slug = await generateUniqueSlug(name);
        const primaryImage = imageUrls[0];

        await d1Query(
            `INSERT INTO products (id, slug, name, price, category, description, image, is_new, youtube_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, slug, name, parseFloat(price), category, description || '', primaryImage, isNew, youtubeUrl]
        );

        for (let i = 0; i < imageUrls.length; i++) {
            await d1Query(
                'INSERT INTO product_images (id, product_id, url, position) VALUES (?, ?, ?, ?)',
                [randomUUID(), id, imageUrls[i], i]
            );
        }

        return NextResponse.json({ success: true, id, slug, imageUrl: primaryImage });
    } catch (err) {
        console.error('Upload error:', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

export async function GET() {
    try {
        const result = await d1Query<{
            id: string;
            slug: string;
            name: string;
            price: number;
            category: string;
            description: string;
            image: string;
            is_new: number;
            code: number | null;
        }>('SELECT * FROM products ORDER BY created_at DESC');

        const products = result.results.map((p) => ({
            id: p.id,
            slug: p.slug || p.id,
            name: p.name,
            price: p.price,
            category: p.category,
            description: p.description,
            image: p.image,
            isNew: Boolean(p.is_new),
            code: p.code ?? undefined,
        }));

        return NextResponse.json(products);
    } catch (err) {
        console.error('Fetch error:', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
