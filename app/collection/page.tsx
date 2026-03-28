import { Metadata } from 'next';
import { d1Query } from '@/lib/d1';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';

export const metadata: Metadata = {
    title: 'Коллекция — Terrasse',
    description: 'Вся коллекция Terrasse.',
};

export const dynamic = 'force-dynamic';

type ProductRow = {
    id: string;
    slug: string;
    name: string;
    price: number;
    category: string;
    image: string;
    is_new: number;
    code: number | null;
};

async function getAllProducts(): Promise<Product[]> {
    try {
        const result = await d1Query<ProductRow>('SELECT * FROM products ORDER BY rowid DESC');
        return result.results.map((p) => ({
            id: p.id,
            slug: p.slug || p.id,
            name: p.name,
            price: p.price,
            category: p.category,
            image: p.image,
            isNew: Boolean(p.is_new),
            code: p.code ?? undefined,
        }));
    } catch {
        return [];
    }
}

export default async function CollectionPage() {
    const products = await getAllProducts();

    return (
        <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen">
            <div className="mb-12">
                <span className="text-xs uppercase tracking-[0.3em] text-brand-muted mb-2 block">Все категории</span>
                <h1 className="text-5xl font-serif">Коллекция</h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            {products.length === 0 && (
                <p className="text-brand-muted mt-8">Товары не найдены.</p>
            )}
        </main>
    );
}
