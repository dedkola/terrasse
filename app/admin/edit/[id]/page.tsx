'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

const CATEGORIES = ['Деним', 'Топы', 'Трикотаж', 'Верхняя одежда'];

type Product = {
    id: string;
    name: string;
    price: number;
    category: string;
    description: string;
    image: string;
    isNew: boolean;
};

export default function EditProductPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');

    // Form fields
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Деним');
    const [description, setDescription] = useState('');
    const [isNew, setIsNew] = useState(false);

    // Image: current URL from DB + optional new file
    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);

    const fileRef = useRef<HTMLInputElement>(null);

    const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [saveError, setSaveError] = useState('');
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${id}`);
                if (!res.ok) throw new Error('Товар не найден');
                const data: Product = await res.json();
                setName(data.name);
                setPrice(String(data.price));
                setCategory(data.category);
                setDescription(data.description || '');
                setIsNew(data.isNew);
                setCurrentImageUrl(data.image);
            } catch (err) {
                setFetchError(String(err));
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleFile = (file: File) => {
        setNewImageFile(file);
        setNewImagePreview(URL.createObjectURL(file));
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) handleFile(file);
    }, []);

    const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
    const onDragLeave = () => setDragging(false);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaveStatus('loading');
        setSaveError('');

        try {
            const fd = new FormData();
            fd.append('name', name);
            fd.append('price', price);
            fd.append('category', category);
            fd.append('description', description);
            fd.append('isNew', String(isNew));
            if (newImageFile) fd.append('image', newImageFile);

            const res = await fetch(`/api/products/${id}`, { method: 'PUT', body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Ошибка сохранения');

            setSaveStatus('success');
            setTimeout(() => router.push('/admin'), 1200);
        } catch (err) {
            setSaveStatus('error');
            setSaveError(String(err));
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Удалить "${name}"? Это действие нельзя отменить.`)) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Ошибка удаления');
            router.push('/admin');
        } catch (err) {
            alert(String(err));
            setDeleting(false);
        }
    };

    const displayImage = newImagePreview || currentImageUrl;

    return (
        <div className="min-h-screen bg-[#0c0c0c] text-white flex flex-col">
            {/* Header */}
            <header className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
                <button
                    onClick={() => router.push('/admin')}
                    className="text-xs uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors"
                >
                    ← Товары
                </button>
                <span className="text-xs uppercase tracking-[0.3em] text-white/30">Admin Panel</span>
            </header>

            <main className="flex-1 flex items-start justify-center px-6 py-16">
                <div className="w-full max-w-2xl">

                    {loading && (
                        <div className="flex items-center justify-center py-24 text-white/30 text-sm">
                            Загрузка...
                        </div>
                    )}

                    {fetchError && (
                        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-5 py-4">
                            {fetchError}
                        </div>
                    )}

                    {!loading && !fetchError && (
                        <>
                            {/* Title */}
                            <div className="mb-12">
                                <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-3">Редактирование</p>
                                <h1 className="text-5xl font-serif leading-tight">{name || 'Товар'}</h1>
                            </div>

                            <form onSubmit={handleSave} className="space-y-7">
                                {/* Image */}
                                <div>
                                    <label className="block text-xs uppercase tracking-[0.2em] text-white/50 mb-3">
                                        Фотография *
                                    </label>
                                    <div
                                        onClick={() => fileRef.current?.click()}
                                        onDrop={onDrop}
                                        onDragOver={onDragOver}
                                        onDragLeave={onDragLeave}
                                        className={`
                                            relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden h-72
                                            ${dragging ? 'border-white/70 bg-white/5' : 'border-white/20 hover:border-white/40'}
                                        `}
                                    >
                                        {displayImage ? (
                                            <>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={displayImage} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity gap-2">
                                                    <p className="text-sm">Нажмите для замены</p>
                                                    {newImagePreview && (
                                                        <span className="text-xs text-white/50 bg-white/10 px-3 py-1 rounded-full">Новое фото</span>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full gap-3 text-white/40">
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                                    <polyline points="17 8 12 3 7 8" />
                                                    <line x1="12" y1="3" x2="12" y2="15" />
                                                </svg>
                                                <p className="text-sm">Перетащите или нажмите для выбора</p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                                    />
                                    {newImagePreview && (
                                        <p className="text-xs text-white/40 mt-2">
                                            Новое фото будет загружено при сохранении. Старое будет удалено.
                                        </p>
                                    )}
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-xs uppercase tracking-[0.2em] text-white/50 mb-3">
                                        Название *
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-5 py-4 text-white placeholder-white/25 focus:outline-none focus:border-white/50 transition-colors text-sm"
                                    />
                                </div>

                                {/* Price + Category */}
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs uppercase tracking-[0.2em] text-white/50 mb-3">
                                            Цена (€) *
                                        </label>
                                        <input
                                            type="number"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            required
                                            min="0"
                                            step="0.01"
                                            className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-5 py-4 text-white placeholder-white/25 focus:outline-none focus:border-white/50 transition-colors text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-[0.2em] text-white/50 mb-3">
                                            Категория *
                                        </label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-white/50 transition-colors text-sm appearance-none cursor-pointer"
                                        >
                                            {CATEGORIES.map((c) => (
                                                <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-xs uppercase tracking-[0.2em] text-white/50 mb-3">
                                        Описание
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                        className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-5 py-4 text-white placeholder-white/25 focus:outline-none focus:border-white/50 transition-colors text-sm resize-none"
                                    />
                                </div>

                                {/* isNew toggle */}
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsNew((v) => !v)}
                                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${isNew ? 'bg-white' : 'bg-white/20'}`}
                                    >
                                        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform duration-300 ${isNew ? 'translate-x-6 bg-black' : 'translate-x-0 bg-white'}`} />
                                    </button>
                                    <span className="text-sm text-white/60">Отметить как Новинку</span>
                                </div>

                                {/* Save error */}
                                {saveError && (
                                    <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-5 py-4">
                                        {saveError}
                                    </div>
                                )}

                                {/* Save button */}
                                <button
                                    type="submit"
                                    disabled={saveStatus === 'loading' || saveStatus === 'success'}
                                    className={`
                                        w-full py-5 rounded-2xl text-sm uppercase tracking-[0.2em] font-medium transition-all duration-300
                                        ${saveStatus === 'success'
                                            ? 'bg-green-500/20 border border-green-500/40 text-green-400 cursor-default'
                                            : saveStatus === 'loading'
                                                ? 'bg-white/10 text-white/40 cursor-wait border border-white/10'
                                                : 'bg-white text-black hover:bg-white/90 active:scale-[0.99] border border-white'
                                        }
                                    `}
                                >
                                    {saveStatus === 'loading' && (
                                        <span className="flex items-center justify-center gap-3">
                                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            Сохранение...
                                        </span>
                                    )}
                                    {saveStatus === 'success' && '✓ Сохранено — возврат...'}
                                    {saveStatus === 'idle' && 'Сохранить изменения'}
                                    {saveStatus === 'error' && 'Попробовать снова'}
                                </button>

                                {/* Delete product */}
                                <div className="pt-6 border-t border-white/10">
                                    <p className="text-xs text-white/30 uppercase tracking-[0.2em] mb-4">Опасная зона</p>
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="w-full py-4 rounded-2xl text-sm uppercase tracking-[0.2em] font-medium border border-red-500/30 text-red-400 hover:border-red-500/60 hover:bg-red-500/5 transition-all disabled:opacity-40 disabled:cursor-wait"
                                    >
                                        {deleting ? 'Удаление...' : 'Удалить товар'}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
