import { Metadata } from 'next';
import CategoryListPage from '@/components/CategoryListPage';

export const metadata: Metadata = {
    title: 'Топы — Terrasse',
    description: 'Коллекция топов Terrasse.',
};

export default function TopsCategoryPage() {
    return (
        <CategoryListPage
            title="Топы"
            subtitle=""
            categoryFilter="Топы"
        />
    );
}
