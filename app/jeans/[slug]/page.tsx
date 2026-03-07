import React from 'react';
import { notFound } from 'next/navigation';
import { PRODUCTS } from '@/types';
import ProductDetail from '@/components/ProductDetail';

export function generateStaticParams() {
    return PRODUCTS.map((product) => ({
        slug: product.id,
    }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const product = PRODUCTS.find((p) => p.id === resolvedParams.slug);

    if (!product) {
        notFound();
    }

    return (
        <main className="min-h-screen">
            {/* Product detail component handles cart and navigation internally */}
            <ProductDetail
                product={product}
            />
        </main>
    );
}
