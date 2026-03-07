import { NextRequest, NextResponse } from 'next/server';
import { d1Query } from '@/lib/d1';
import { uploadToR2 } from '@/lib/r2';
import { slugify } from '@/lib/slugify';
import { randomUUID } from 'crypto';

async function generateUniqueSlug(name: string): Promise<string> {
    const base = slugify(name);
    const result = await d1Query<{ slug: string }>(
        'SELECT slug FROM products WHERE slug LIKE ?',
        [`${base}%`]
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
        const imageFile = formData.get('image') as File;

        if (!name || !price || !category || !imageFile) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Upload image to R2
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = imageFile.name.split('.').pop() || 'jpg';
        const filename = `${randomUUID()}.${ext}`;
        const imageUrl = await uploadToR2(buffer, filename, imageFile.type);

        // Insert into D1
        const id = randomUUID();
        const slug = await generateUniqueSlug(name);
        await d1Query(
            `INSERT INTO products (id, slug, name, price, category, description, image, is_new)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, slug, name, parseFloat(price), category, description || '', imageUrl, isNew]
        );

        return NextResponse.json({ success: true, id, slug, imageUrl });
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
        }));

        return NextResponse.json(products);
    } catch (err) {
        console.error('Fetch error:', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
