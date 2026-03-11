import { Metadata } from 'next';
import CategoryListPage from '@/components/CategoryListPage';

export const metadata: Metadata = {
    title: 'Джинсы и Деним — Terrasse',
    description: 'Коллекция джинсов и денимовых вещей Terrasse.',
};

export default function JeansCategoryPage() {
    return (
        <CategoryListPage
            title="Джинсы и Деним"
            subtitle=""
            categoryFilter={['Деним', 'Jeans']}
        />
    );
}
