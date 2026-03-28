import React from 'react';
import { Instagram, Twitter, Facebook } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-stone-100 pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
                    <div className="col-span-1 md:col-span-1">
                        <h2 className="logo-text text-2xl font-bold mb-6">TERRASSE</h2>
                        <p className="text-sm text-brand-muted leading-relaxed">
                            Создаем вневременные базовые вещи для современного гардероба. Качество, экологичность и непринужденный стиль.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-xs uppercase tracking-widest font-bold mb-6">Магазин</h4>
                        <ul className="space-y-4 text-sm text-brand-muted">
                            <li><a href="/collection" className="hover:text-black transition-colors">Новинки</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs uppercase tracking-widest font-bold mb-6">Поддержка</h4>
                        <ul className="space-y-4 text-sm text-brand-muted">
                            <li><a href="/about" className="hover:text-black transition-colors">О нас</a></li>
                            <li><a href="/contacts" className="hover:text-black transition-colors">Контакты</a></li>

                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs uppercase tracking-widest font-bold mb-6">Рассылка</h4>
                        <p className="text-sm text-brand-muted mb-6">Присоединяйтесь к нашему списку для получения эксклюзивных обновлений и раннего доступа.</p>
                        <div className="flex border-b border-black pb-2">
                            <input
                                type="email"
                                placeholder="Email"
                                className="bg-transparent flex-1 text-sm outline-none"
                            />
                            <button className="text-xs uppercase font-bold tracking-widest">Подписаться</button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-stone-100">
                    <p className="text-[10px] text-brand-muted uppercase tracking-widest mb-4 md:mb-0">
                        © 2026 Terrasse. Все права защищены.
                    </p>
                    <div className="flex space-x-6">
                        <Instagram size={18} className="text-brand-muted hover:text-black cursor-pointer transition-colors" />
                        <Twitter size={18} className="text-brand-muted hover:text-black cursor-pointer transition-colors" />
                        <Facebook size={18} className="text-brand-muted hover:text-black cursor-pointer transition-colors" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
