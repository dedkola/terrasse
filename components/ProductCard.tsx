"use client";

import React from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { categoryToRoute } from '@/lib/categoryToRoute';

const ProductCard = ({ product }: { product: Product; key?: React.Key }) => {
    const route = categoryToRoute(product.category);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group"
        >
            <Link href={`${route}/${product.slug}`} className="block">
                <div className="relative overflow-hidden bg-stone-100 rounded-lg">
                    <Image
                        src={product.image}
                        alt={product.name}
                        width={500}
                        height={750}
                        className="product-card-image"
                        referrerPolicy="no-referrer"
                    />
                    {product.isNew && (
                        <span className="absolute top-4 left-4 bg-white px-3 py-1 text-[10px] uppercase tracking-widest font-bold">Новинка</span>
                    )}
                </div>
                <div className="mt-4 flex justify-between items-start">
                    <div>
                        <h3 className="text-sm font-medium text-brand-ink">{product.name}</h3>
                        <p className="text-xs text-brand-muted mt-1">{product.category}</p>
                        {product.code != null && (
                            <p className="text-[10px] text-brand-muted mt-0.5">#{String(product.code).padStart(4, '0')}</p>
                        )}
                    </div>
                    <p className="text-sm font-medium">₴{product.price}</p>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProductCard;
