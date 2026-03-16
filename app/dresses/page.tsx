import { Metadata } from 'next';
import CategoryListPage from '@/components/CategoryListPage';

export const metadata: Metadata = {
    title: 'Платья — Terrasse',
    description: 'Коллекция платьев Terrasse.',
};

export default function DressesCategoryPage() {
    return (
        <CategoryListPage
            title="Платья"
            subtitle=""
            categoryFilter="Платья"
        />
    );
}
