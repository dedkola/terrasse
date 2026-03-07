"use client";

import React, { createContext, useContext, useState } from 'react';
import { Product } from '@/types';

type StateContextType = {
    cartCount: number;
    addToCart: () => void;
    selectedProduct: Product | null;
    setSelectedProduct: (product: Product | null) => void;
};

const StateContext = createContext<StateContextType | undefined>(undefined);

export const StateProvider = ({ children }: { children: React.ReactNode }) => {
    const [cartCount, setCartCount] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const addToCart = () => setCartCount((prev) => prev + 1);

    return (
        <StateContext.Provider value={{ cartCount, addToCart, selectedProduct, setSelectedProduct }}>
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => {
    const context = useContext(StateContext);
    if (context === undefined) {
        throw new Error('useStateContext must be used within a StateProvider');
    }
    return context;
};
