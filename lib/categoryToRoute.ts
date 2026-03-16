export function categoryToRoute(category: string): string {
    if (category === 'Верхняя одежда') return '/jackets';
    if (category === 'Трикотаж') return '/knitwear';
    if (category === 'Топы') return '/tops';
    if (category === 'Костюмы') return '/suits';
    if (category === 'Платья') return '/dresses';
    if (category === 'Аксессуары') return '/accessories';
    if (category === 'Брюки') return '/pants';
    if (category === 'Джинсы') return '/jeans';
    return '/tops';
}
