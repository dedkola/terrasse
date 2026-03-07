import React from 'react';
import { PRODUCTS } from '@/types';
import ProductCard from '@/components/ProductCard';

export default function JeansCategoryPage() {
    const jeansProducts = PRODUCTS.filter(p => p.category === 'Деним' || p.category.includes('Jeans'));

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
