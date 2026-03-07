import { NextRequest, NextResponse } from 'next/server';
import { d1Query } from '@/lib/d1';
import { uploadToR2, deleteFromR2 } from '@/lib/r2';
import { randomUUID } from 'crypto';

type ProductRow = {
    id: string;
    name: string;
    price: number;
    category: string;
    description: string;
    image: string;
    is_new: number;
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const result = await d1Query<ProductRow>('SELECT * FROM products WHERE id = ?', [id]);

        if (!result.results.length) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const p = result.results[0];
        return NextResponse.json({
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.category,
            description: p.description,
            image: p.image,
            isNew: Boolean(p.is_new),
        });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        // Fetch current product to get existing image URL
        const existing = await d1Query<ProductRow>('SELECT * FROM products WHERE id = ?', [id]);
        if (!existing.results.length) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        const currentImageUrl = existing.results[0].image;

        const formData = await request.formData();
        const name = formData.get('name') as string;
        const price = formData.get('price') as string;
        const category = formData.get('category') as string;
        const description = formData.get('description') as string;
        const isNew = formData.get('isNew') === 'true' ? 1 : 0;
        const imageFile = formData.get('image') as File | null;

        if (!name || !price || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let imageUrl = currentImageUrl;

        if (imageFile && imageFile.size > 0) {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const ext = imageFile.name.split('.').pop() || 'jpg';
            const filename = `${randomUUID()}.${ext}`;
            imageUrl = await uploadToR2(buffer, filename, imageFile.type);
            // Delete old image from R2
            await deleteFromR2(currentImageUrl);
        }

        await d1Query(
            `UPDATE products SET name=?, price=?, category=?, description=?, is_new=?, image=? WHERE id=?`,
            [name, parseFloat(price), category, description || '', isNew, imageUrl, id]
        );

        return NextResponse.json({ success: true });
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

        const imageUrl = existing.results[0].image;
        await deleteFromR2(imageUrl);
        await d1Query('DELETE FROM products WHERE id = ?', [id]);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Delete error:', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
