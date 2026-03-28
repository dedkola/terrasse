import { Metadata } from 'next';
import CategoryListPage from '@/components/CategoryListPage';

export const metadata: Metadata = {
    title: 'Костюмы — Terrasse',
    description: 'Коллекция костюмов Terrasse.',
};

export default function SuitsCategoryPage() {
    return (
        <CategoryListPage
            title="Костюмы"
            subtitle=""
            categoryFilter="Костюмы"
        />
    );
}
