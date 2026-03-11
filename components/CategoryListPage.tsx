import React from 'react';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';

interface CategoryListPageProps {
    title: string;
    subtitle: string;
    categoryFilter: string | string[];
}

async function getProductsByCategory(filter: string | string[]): Promise<Product[]> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/products`, { cache: 'no-store' });
        if (!res.ok) return [];
        const all: Product[] = await res.json();
        const filters = Array.isArray(filter) ? filter : [filter];
        return all.filter((p) => filters.some((f) => p.category === f || p.category.includes(f)));
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
