export function categoryToRoute(category: string): string {
    if (category === 'Верхняя одежда') return '/jackets';
    if (category === 'Трикотаж') return '/tops';
    if (category === 'Топы') return '/jeans';
    return '/jeans';
}
