import React from 'react';
import { Metadata } from 'next';

export const runtime = 'edge';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';

export const metadata: Metadata = {
    title: 'Джинсы и Деним — Terrasse',
    description: 'Коллекция джинсов и денимовых вещей Terrasse. Вневременные силуэты, качественные материалы.',
};

async function getJeansProducts(): Promise<Product[]> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/products`, { cache: 'no-store' });
        if (!res.ok) return [];
        const all: Product[] = await res.json();
        return all.filter((p) => p.category === 'Деним' || p.category.includes('Jeans'));
    } catch {
        return [];
    }
}

export default async function JeansCategoryPage() {
    const jeansProducts = await getJeansProducts();

    return (
        <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen">
            <div className="mb-12">
                <span className="text-xs uppercase tracking-[0.3em] text-brand-muted mb-2 block">Категория</span>
                <h1 className="text-5xl font-serif">Джинсы и Деним</h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                {jeansProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                    />
                ))}
            </div>
            {jeansProducts.length === 0 && (
                <p className="text-brand-muted mt-8">В этой категории пока нет товаров.</p>
            )}
        </main>
    );
}
