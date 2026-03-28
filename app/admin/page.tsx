'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Product = {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    isNew: boolean;
    code?: number;
};

export default function AdminPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/products');
            if (!res.ok) throw new Error('Не удалось загрузить товары');
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            setError(String(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (product: Product) => {
        if (!window.confirm(`Удалить "${product.name}"? Это действие нельзя отменить.`)) return;

        setDeletingId(product.id);
        try {
            const res = await fetch(`/api/products/${product.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Ошибка удаления');
            setProducts((prev) => prev.filter((p) => p.id !== product.id));
        } catch (err) {
            alert(String(err));
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#0c0c0c] text-white flex flex-col">
            {/* Header */}
            <header className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
                <Link href="/" className="text-xs uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors">
                    ← Terrasse
                </Link>
                <span className="text-xs uppercase tracking-[0.3em] text-white/30">Admin Panel</span>
            </header>

            <main className="flex-1 px-8 py-12 max-w-5xl mx-auto w-full">
                {/* Title row */}
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2">Управление</p>
                        <h1 className="text-4xl font-serif">Товары</h1>
                    </div>
                    <Link
                        href="/admin/add"
                        className="px-6 py-3 bg-white text-black text-xs uppercase tracking-[0.2em] font-medium rounded-xl hover:bg-white/90 transition-colors"
                    >
                        + Добавить товар
                    </Link>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-24 text-white/30 text-sm">
                        Загрузка...
                    </div>
                )}

                {error && (
                    <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-5 py-4 mb-6">
                        {error}
                    </div>
                )}

                {!loading && !error && products.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-white/30">
                        <p className="text-sm mb-4">Товаров пока нет</p>
                        <Link href="/admin/add" className="text-xs underline underline-offset-4 hover:text-white/60 transition-colors">
                            Добавить первый товар
                        </Link>
                    </div>
                )}

                {!loading && products.length > 0 && (
                    <div className="space-y-3">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="flex items-center gap-5 bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 hover:border-white/20 transition-colors"
                            >
                                {/* Thumbnail */}
                                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        sizes="64px"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-medium truncate">{product.name}</p>
                                        {product.isNew && (
                                            <span className="text-[10px] uppercase tracking-wider text-white/60 bg-white/10 px-2 py-0.5 rounded-full flex-shrink-0">
                                                New
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-white/40">
                                        {product.category} · ₴{product.price}
                                        {product.code != null ? ` · #${String(product.code).padStart(4, '0')}` : ''}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Link
                                        href={`/admin/edit/${product.id}`}
                                        className="px-4 py-2 text-xs uppercase tracking-[0.15em] border border-white/20 rounded-lg hover:border-white/50 hover:bg-white/5 transition-colors"
                                    >
                                        Редактировать
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(product)}
                                        disabled={deletingId === product.id}
                                        className="px-4 py-2 text-xs uppercase tracking-[0.15em] border border-red-500/30 text-red-400 rounded-lg hover:border-red-500/60 hover:bg-red-500/5 transition-colors disabled:opacity-40 disabled:cursor-wait"
                                    >
                                        {deletingId === product.id ? '...' : 'Удалить'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
