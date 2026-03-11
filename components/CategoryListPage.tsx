import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import { d1Query } from '@/lib/d1';

interface CategoryListPageProps {
    title: string;
    subtitle: string;
    categoryFilter: string | string[];
}

async function getProductsByCategory(filter: string | string[]): Promise<Product[]> {
    try {
        const filters = Array.isArray(filter) ? filter : [filter];
        const placeholders = filters.map(() => '?').join(', ');
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
        }>(
            `SELECT * FROM products WHERE category IN (${placeholders}) ORDER BY created_at DESC`,
            filters
        );
        return result.results.map((p) => ({
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
    } catch {
        return [];
    }
}

export default async function CategoryListPage({ title, subtitle, categoryFilter }: CategoryListPageProps) {
    const products = await getProductsByCategory(categoryFilter);

    return (
        <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen">
            <div className="mb-12">
                <span className="text-xs uppercase tracking-[0.3em] text-brand-muted mb-2 block">Категория</span>
                <h1 className="text-5xl font-serif">{title}</h1>
                {subtitle && <p className="text-brand-muted mt-3">{subtitle}</p>}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            {products.length === 0 && (
                <p className="text-brand-muted mt-8">В этой категории пока нет товаров.</p>
            )}
        </main>
    );
}
