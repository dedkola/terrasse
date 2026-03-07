"use client";

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PRODUCTS } from '@/types';
import { useStateContext } from '@/components/StateProvider';
import Hero from '@/components/Hero';
import CategorySection from '@/components/CategorySection';
import ProductCard from '@/components/ProductCard';
import ProductDetail from '@/components/ProductDetail';

export default function Home() {
    const { selectedProduct, setSelectedProduct, addToCart } = useStateContext();

    return (
        <AnimatePresence mode="wait">
            {!selectedProduct ? (
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
                                <span className="text-xs uppercase tracking-[0.3em] text-brand-muted mb-2 block">Curated Selection</span>
                                <h2 className="text-4xl font-serif">Featured Arrivals</h2>
                            </div>
                            <a href="#" className="text-sm font-medium border-b border-black pb-1 hover:opacity-60 transition-opacity">
                                View All
                            </a>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                            {PRODUCTS.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={addToCart}
                                    onClick={() => setSelectedProduct(product)}
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
                                    Designed for <br />
                                    <span className="italic">Everyday</span> Elegance
                                </h2>
                                <p className="text-stone-400 max-w-md mb-12 leading-relaxed">
                                    Our philosophy is simple: create pieces that last. We focus on premium materials and timeless silhouettes that transition seamlessly from day to night.
                                </p>
                                <button className="px-10 py-4 border border-white rounded-full text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                                    Our Story
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
            ) : (
                <ProductDetail
                    key="detail"
                    product={selectedProduct}
                    onBack={() => setSelectedProduct(null)}
                    onAddToCart={addToCart}
                />
            )}
        </AnimatePresence>
    );
}
