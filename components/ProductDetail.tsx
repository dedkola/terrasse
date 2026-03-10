"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Minus, Plus, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useStateContext } from './StateProvider';
import { Product } from '@/types';

function extractYouTubeId(url: string): string | null {
    const match = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
}

const ProductDetail = ({ product }: { product: Product; key?: React.Key }) => {
    const router = useRouter();
    const { addToCart } = useStateContext();
    const [selectedSize, setSelectedSize] = useState('M');
    const [quantity, setQuantity] = useState(1);
    const [selected, setSelected] = useState<number | 'video'>(0);
    const sizes = ['XS', 'S', 'M', 'L', 'XL'];

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-32 pb-24 px-6 max-w-7xl mx-auto"
        >
            <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-sm text-brand-muted hover:text-black transition-colors mb-12 group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>Назад к коллекции</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Image Gallery */}
                <div className="space-y-4">
                    {/* Main display */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="aspect-[3/4] bg-stone-100 rounded-2xl overflow-hidden"
                    >
                        {selected === 'video' && product.youtube_url ? (
                            (() => {
                                const videoId = extractYouTubeId(product.youtube_url);
                                return videoId ? (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${videoId}`}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-full"
                                        title={product.name}
                                    />
                                ) : null;
                            })()
                        ) : (
                            <Image
                                src={product.images && product.images.length > 0 ? product.images[selected as number] : product.image}
                                alt={product.name}
                                width={800}
                                height={1200}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                                priority
                            />
                        )}
                    </motion.div>

                    {/* Thumbnails — only render if there are multiple images OR a video */}
                    {((product.images && product.images.length > 1) || product.youtube_url) && (
                        <div className="grid grid-cols-4 gap-3">
                            {(product.images ?? [product.image]).map((url, i) => (
                                <button
                                    key={url}
                                    onClick={() => setSelected(i)}
                                    className={`aspect-square bg-stone-100 rounded-xl overflow-hidden transition-all ${
                                        selected === i ? 'ring-2 ring-black' : 'opacity-60 hover:opacity-100'
                                    }`}
                                >
                                    <Image
                                        src={url}
                                        alt={`${product.name} view ${i + 1}`}
                                        width={200}
                                        height={200}
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                    />
                                </button>
                            ))}
                            {product.youtube_url && (
                                <button
                                    onClick={() => setSelected('video')}
                                    className={`aspect-square bg-stone-900 rounded-xl overflow-hidden flex items-center justify-center transition-all ${
                                        selected === 'video' ? 'ring-2 ring-black' : 'opacity-60 hover:opacity-100'
                                    }`}
                                >
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                                        <polygon points="5,3 19,12 5,21" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                    <div className="mb-8">
                        <p className="text-xs uppercase tracking-[0.3em] text-brand-muted mb-2">{product.category}</p>
                        <h1 className="text-4xl md:text-5xl font-serif mb-4">{product.name}</h1>
                        <p className="text-2xl font-medium">${product.price}</p>
                    </div>

                    <div className="mb-8">
                        <p className="text-sm text-brand-muted leading-relaxed">
                            {product.description || "Созданное с тщательным вниманием к деталям, это изделие воплощает приверженность Terrasse качеству и неподвластному времени стилю. Разработано для современного человека, ценящего как форму, так и функциональность."}
                        </p>
                    </div>

                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs uppercase tracking-widest font-bold">Выберите размер</span>
                            <button className="text-[10px] uppercase tracking-widest text-brand-muted border-b border-brand-muted">Таблица размеров</button>
                        </div>
                        <div className="flex space-x-3">
                            {sizes.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`w-12 h-12 rounded-full border text-xs font-medium transition-all ${selectedSize === size
                                        ? 'bg-black border-black text-white'
                                        : 'border-stone-200 hover:border-black'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-12">
                        <span className="text-xs uppercase tracking-widest font-bold mb-4 block">Количество</span>
                        <div className="flex items-center space-x-6 border border-stone-200 w-fit px-4 py-2 rounded-full">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="hover:opacity-60 transition-opacity"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="text-sm font-medium w-4 text-center">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="hover:opacity-60 transition-opacity"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            onClick={addToCart}
                            className="flex-1 bg-black text-white py-5 rounded-full text-xs uppercase tracking-widest font-bold hover:bg-stone-800 transition-all active:scale-[0.98]"
                        >
                            В корзину
                        </button>
                        <button className="p-5 border border-stone-200 rounded-full hover:border-black transition-colors">
                            <Heart size={20} />
                        </button>
                    </div>

                    <div className="mt-12 pt-12 border-t border-stone-100 space-y-6">
                        <details className="group">
                            <summary className="flex justify-between items-center cursor-pointer list-none">
                                <span className="text-xs uppercase tracking-widest font-bold">Детали и Уход</span>
                                <Plus size={14} className="group-open:hidden" />
                                <Minus size={14} className="hidden group-open:block" />
                            </summary>
                            <div className="pt-4 text-sm text-brand-muted leading-relaxed">
                                <ul className="list-disc pl-4 space-y-2">
                                    <li>100% Органический хлопок</li>
                                    <li>Этично добытые материалы</li>
                                    <li>Машинная стирка в холодной воде, деликатный отжим</li>
                                    <li>Дизайн разработан в Париже</li>
                                </ul>
                            </div>
                        </details>
                        <details className="group">
                            <summary className="flex justify-between items-center cursor-pointer list-none">
                                <span className="text-xs uppercase tracking-widest font-bold">Доставка и Возврат</span>
                                <Plus size={14} className="group-open:hidden" />
                                <Minus size={14} className="hidden group-open:block" />
                            </summary>
                            <div className="pt-4 text-sm text-brand-muted leading-relaxed">
                                <p>Бесплатная стандартная доставка для всех заказов от $200. Возврат принимается в течение 30 дней с момента покупки.</p>
                            </div>
                        </details>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductDetail;
