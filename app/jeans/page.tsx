import React from "react";
import { Metadata } from "next";

import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import { d1Query } from "@/lib/d1";

export const metadata: Metadata = {
  title: "Джинсы и Деним — Terrasse",
  description:
    "Коллекция джинсов и денимовых вещей Terrasse. Вневременные силуэты, качественные материалы.",
};

async function getJeansProducts(): Promise<Product[]> {
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
    }>(
      "SELECT * FROM products WHERE category = 'Деним' ORDER BY created_at DESC",
    );

    return result.results.map((p) => ({
      id: p.id,
      slug: p.slug || p.id,
      name: p.name,
      price: p.price,
      category: p.category,
      description: p.description,
      image: p.image,
      images: [],
      isNew: Boolean(p.is_new),
    }));
  } catch {
    return [];
  }
}

export default async function JeansCategoryPage() {
  const jeansProducts = await getJeansProducts();

  return (
    <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="mb-12">
        <span className="text-xs uppercase tracking-[0.3em] text-brand-muted mb-2 block">
          Категория
        </span>
        <h1 className="text-5xl font-serif">Джинсы и Деним</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
        {jeansProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {jeansProducts.length === 0 && (
        <p className="text-brand-muted mt-8">
          В этой категории пока нет товаров.
        </p>
      )}
    </main>
  );
}
