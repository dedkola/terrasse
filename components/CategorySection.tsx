"use client";

import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const CategorySection = () => {
    const categories = [
        { name: 'Верхняя одежда', href: '/jackets', image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=800' },
        { name: 'Деним', href: '/jeans', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800' },
        { name: 'Трикотаж', href: '/tops', image: 'https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?auto=format&fit=crop&q=80&w=800' }
    ];

    return (
        <section className="py-24 px-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {categories.map((cat, i) => (
                    <motion.div
                        key={cat.name}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className="relative h-[500px] group overflow-hidden rounded-2xl"
                    >
                        <Link href={cat.href} className="block w-full h-full cursor-pointer">
                            <Image
                                src={cat.image}
                                alt={cat.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                            <div className="absolute inset-0 flex flex-col justify-end p-8">
                                <h3 className="text-3xl font-serif text-white mb-2">{cat.name}</h3>
                                <div className="flex items-center text-white/80 text-sm font-medium group-hover:text-white transition-colors">
                                    <span>В магазин</span>
                                    <ChevronRight size={16} className="ml-1" />
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default CategorySection;
