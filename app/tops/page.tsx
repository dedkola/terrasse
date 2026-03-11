import { Metadata } from 'next';
import CategoryListPage from '@/components/CategoryListPage';

export const metadata: Metadata = {
    title: 'Трикотаж — Terrasse',
    description: 'Коллекция трикотажа Terrasse.',
};

export default function TopsCategoryPage() {
    return (
        <CategoryListPage
            title="Трикотаж"
            subtitle=""
            categoryFilter="Трикотаж"
        />
    );
}
