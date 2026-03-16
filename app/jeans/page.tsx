import { Metadata } from 'next';
import CategoryListPage from '@/components/CategoryListPage';

export const metadata: Metadata = {
    title: 'Джинсы — Terrasse',
    description: 'Коллекция джинсов Terrasse.',
};

export default function JeansCategoryPage() {
    return (
        <CategoryListPage
            title="Джинсы"
            subtitle=""
            categoryFilter="Джинсы"
        />
    );
}
