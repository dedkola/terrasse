"use client";

import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
    return (
        <section className="relative h-screen w-full overflow-hidden bg-stone-100">
            <motion.div
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0"
            >
                <img
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000"
                    alt="Hero"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/10" />
            </motion.div>

            <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center items-start">
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="max-w-xl"
                >
                    <span className="text-xs uppercase tracking-[0.3em] text-white/80 mb-4 block">Новый сезон 2026</span>
                    <h1 className="text-6xl md:text-8xl font-serif text-white leading-tight mb-8">
                        Искусство <br />
                        <span className="italic">Простоты</span>
                    </h1>
                    <button className="group flex items-center space-x-4 bg-white text-black px-8 py-4 rounded-full font-medium transition-all hover:bg-black hover:text-white">
                        <span>Смотреть коллекцию</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
