import { NextRequest, NextResponse } from 'next/server';
import { d1Query } from '@/lib/d1';
import { uploadToR2, deleteFromR2 } from '@/lib/r2';
import { slugify } from '@/lib/slugify';
import { randomUUID } from 'crypto';

type ProductRow = {
    id: string;
    slug: string;
    name: string;
    price: number;
    category: string;
    description: string;
    description_material: string;
    description_style: string;
    image: string;
    is_new: number;
    youtube_url: string | null;
};

async function generateUniqueSlug(name: string, excludeId: string): Promise<string> {
    const base = slugify(name);
    const result = await d1Query<{ slug: string }>(
        'SELECT slug FROM products WHERE slug >= ? AND slug < ? AND id != ?',
        [base, base + '~', excludeId]
    );
    const existing = result.results.map((r) => r.slug);
    if (!existing.includes(base)) return base;
    let i = 2;
    while (existing.includes(`${base}-${i}`)) i++;
    return `${base}-${i}`;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const result = await d1Query<ProductRow>('SELECT * FROM products WHERE id = ?', [id]);

        if (!result.results.length) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const p = result.results[0];

        const imagesResult = await d1Query<{ url: string }>(
            'SELECT url FROM product_images WHERE product_id = ? ORDER BY position ASC',
            [id]
        );
        const images = imagesResult.results.map((r) => r.url);

        return NextResponse.json({
            id: p.id,
            slug: p.slug || p.id,
            name: p.name,
            price: p.price,
            category: p.category,
            description: p.description,
            description_material: p.description_material,
            description_style: p.description_style,
            image: p.image,
            images,
            youtube_url: p.youtube_url ?? undefined,
            isNew: Boolean(p.is_new),
        });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const existing = await d1Query<ProductRow>('SELECT * FROM products WHERE id = ?', [id]);
        if (!existing.results.length) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        const current = existing.results[0];

        const formData = await request.formData();
        const name = formData.get('name') as string;
        const price = formData.get('price') as string;
        const category = formData.get('category') as string;
        const description = formData.get('description') as string;
        const descriptionMaterial = formData.get('description_material') as string;
        const descriptionStyle = formData.get('description_style') as string;
        const isNew = formData.get('isNew') === 'true' ? 1 : 0;
        const youtubeUrl = (formData.get('youtube_url') as string) || null;

        // Images to keep (existing URLs the admin chose to keep)
        const existingImagesJson = formData.get('existing_images') as string | null;
        const keptUrls: string[] = existingImagesJson ? JSON.parse(existingImagesJson) : [];

        // Fetch current images from product_images table
        const currentImagesResult = await d1Query<{ url: string }>(
            'SELECT url FROM product_images WHERE product_id = ?',
            [id]
        );
        const currentImageUrls = currentImagesResult.results.map((r) => r.url);

        // Delete removed images from R2
        const removedUrls = currentImageUrls.filter((url) => !keptUrls.includes(url));
        for (const url of removedUrls) {
            await deleteFromR2(url);
        }
        // Always clear all product_images rows before re-inserting with correct positions
        await d1Query('DELETE FROM product_images WHERE product_id = ?', [id]);

        // Upload new image files
        const newImageUrls: string[] = [];
        for (let i = 0; i < 6; i++) {
            const file = formData.get(`image_${i}`) as File | null;
            if (!file || file.size === 0) continue;
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const ext = file.name.split('.').pop() || 'jpg';
            const filename = `${randomUUID()}.${ext}`;
            const url = await uploadToR2(buffer, filename, file.type);
            newImageUrls.push(url);
        }

        // Final ordered image list: kept first, then new ones
        const allImages = [...keptUrls, ...newImageUrls];

        // Re-insert all images with correct positions
        for (let i = 0; i < allImages.length; i++) {
            await d1Query(
                'INSERT INTO product_images (id, product_id, url, position) VALUES (?, ?, ?, ?)',
                [randomUUID(), id, allImages[i], i]
            );
        }

        // Primary image for card thumbnail = first image, or keep current if no images
        const primaryImage = allImages.length > 0 ? allImages[0] : current.image;

        if (!name || !price || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const slug = name !== current.name
            ? await generateUniqueSlug(name, id)
            : (current.slug || slugify(name));

        await d1Query(
            `UPDATE products SET name=?, slug=?, price=?, category=?, description=?, description_material=?, description_style=?, is_new=?, image=?, youtube_url=? WHERE id=?`,
            [name, slug, parseFloat(price), category, description || '', descriptionMaterial || '', descriptionStyle || '', isNew, primaryImage, youtubeUrl, id]
        );

        return NextResponse.json({ success: true, slug });
    } catch (err) {
        console.error('Update error:', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const existing = await d1Query<ProductRow>('SELECT * FROM products WHERE id = ?', [id]);
        if (!existing.results.length) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        // Delete all gallery images from R2
        const imagesResult = await d1Query<{ url: string }>(
            'SELECT url FROM product_images WHERE product_id = ?',
            [id]
        );
        for (const { url } of imagesResult.results) {
            await deleteFromR2(url);
        }
        await d1Query('DELETE FROM product_images WHERE product_id = ?', [id]);

        // Delete primary image from R2
        const primaryImage = existing.results[0].image;
        if (primaryImage) await deleteFromR2(primaryImage);

        await d1Query('DELETE FROM products WHERE id = ?', [id]);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Delete error:', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
