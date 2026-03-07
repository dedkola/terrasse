"use client";

import React from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useStateContext } from './StateProvider';
import { Product } from '@/types';

const ProductCard = ({ product }: { product: Product; key?: React.Key }) => {
    const { addToCart } = useStateContext();
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group"
        >
            <Link href={`/jeans/${product.id}`} className="block">
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
                    <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Heart size={16} />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addToCart();
                            }}
                            className="w-full bg-black text-white py-3 text-xs uppercase tracking-widest font-bold hover:bg-stone-800 transition-colors"
                        >
                            Быстрое добавление
                        </button>
                    </div>
                </div>
                <div className="mt-4 flex justify-between items-start">
                    <div>
                        <h3 className="text-sm font-medium text-brand-ink">{product.name}</h3>
                        <p className="text-xs text-brand-muted mt-1">{product.category}</p>
                    </div>
                    <p className="text-sm font-medium">${product.price}</p>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProductCard;
