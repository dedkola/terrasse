import { Metadata } from 'next';
import CategoryListPage from '@/components/CategoryListPage';

export const metadata: Metadata = {
    title: 'Верхняя одежда — Terrasse',
    description: 'Коллекция верхней одежды Terrasse.',
};

export default function JacketsCategoryPage() {
    return (
        <CategoryListPage
            title="Верхняя одежда"
            subtitle=""
            categoryFilter="Верхняя одежда"
        />
    );
}
