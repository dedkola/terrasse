import { Metadata } from 'next';
import CategoryListPage from '@/components/CategoryListPage';

export const metadata: Metadata = {
    title: 'Аксессуары — Terrasse',
    description: 'Коллекция аксессуаров Terrasse.',
};

export default function AccessoriesCategoryPage() {
    return (
        <CategoryListPage
            title="Аксессуары"
            subtitle=""
            categoryFilter="Аксессуары"
        />
    );
}
