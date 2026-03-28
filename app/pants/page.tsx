import { Metadata } from 'next';
import CategoryListPage from '@/components/CategoryListPage';

export const metadata: Metadata = {
    title: 'Брюки — Terrasse',
    description: 'Коллекция брюк Terrasse.',
};

export default function PantsCategoryPage() {
    return (
        <CategoryListPage
            title="Брюки"
            subtitle=""
            categoryFilter="Брюки"
        />
    );
}
