"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import Link from "next/link";
import { useStateContext } from "./StateProvider";

const Navbar = () => {
  const { cartCount } = useStateContext();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-md py-4 shadow-sm" : "bg-transparent py-6"}`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="hidden md:flex items-center space-x-8">
          <a href="/jackets" className="nav-link">
            Верхняя одежда
          </a>
          <a href="/collection" className="nav-link">
            Коллекции
          </a>
          <a href="/tops" className="nav-link">
            Топы
          </a>
          <a href="/knitwear" className="nav-link">
            Трикотаж
          </a>
        </div>

        <div className="flex-1 flex justify-center md:justify-center">
          <Link
            href="/"
            className="logo-text text-2xl md:text-3xl font-bold tracking-[0.2em] outline-none"
          >
            TERRASSE
          </Link>
        </div>

        <div className="flex items-center space-x-6">
          <button className="p-2 hover:opacity-60 transition-opacity hidden md:block">
            <Search size={20} />
          </button>
          <button className="p-2 hover:opacity-60 transition-opacity relative">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-[60] p-6 flex flex-col"
          >
            <div className="flex justify-end">
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="mt-12 space-y-8 text-center">
              <a href="#" className="block text-3xl font-serif italic">
                Новинки
              </a>
              <a href="#" className="block text-3xl font-serif italic">
                Все товары
              </a>
              <a href="#" className="block text-3xl font-serif italic">
                Коллекции
              </a>
              <a href="#" className="block text-3xl font-serif italic">
                Журнал
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
