import React from 'react';
import { notFound } from 'next/navigation';
import { Product } from '@/types';
import ProductDetail from '@/components/ProductDetail';

async function getProducts(): Promise<Product[]> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/products`, { cache: 'no-store' });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

// Don't pre-generate static params since products are dynamic
export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const products = await getProducts();
    const product = products.find((p) => p.id === resolvedParams.slug);

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
