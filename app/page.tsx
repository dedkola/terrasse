"use client";

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Product } from '@/types';
import { useStateContext } from '@/components/StateProvider';
import Hero from '@/components/Hero';
import CategorySection from '@/components/CategorySection';
import ProductCard from '@/components/ProductCard';
import ProductDetail from '@/components/ProductDetail';

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        fetch('/api/products')
            .then((r) => r.json())
            .then((data) => Array.isArray(data) ? setProducts(data) : null)
            .catch(() => { });
    }, []);

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <Hero />

                <CategorySection />

                <section className="py-24 px-6 max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <span className="text-xs uppercase tracking-[0.3em] text-brand-muted mb-2 block">Специальная подборка</span>
                            <h2 className="text-4xl font-serif">Избранные новинки</h2>
                        </div>
                        <a href="#" className="text-sm font-medium border-b border-black pb-1 hover:opacity-60 transition-opacity">
                            Смотреть все
                        </a>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                            />
                        ))}
                    </div>
                </section>

                <section className="py-24 bg-stone-900 text-white overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-5xl md:text-7xl font-serif leading-tight mb-8">
                                Создано для <br />
                                <span className="italic">Повседневной</span> Элегантности
                            </h2>
                            <p className="text-stone-400 max-w-md mb-12 leading-relaxed">
                                Наша философия проста: создавать долговечные вещи. Мы уделяем внимание премиальным материалам и вневременным силуэтам, которые идеально подходят как для дня, так и для вечера.
                            </p>
                            <button className="px-10 py-4 border border-white rounded-full text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                                Наша история
                            </button>
                        </motion.div>
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            className="relative aspect-[4/5]"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000"
                                alt="Brand Story"
                                className="w-full h-full object-cover rounded-2xl"
                                referrerPolicy="no-referrer"
                            />
                        </motion.div>
                    </div>
                </section>
            </motion.div>
        </AnimatePresence>
    );
}
