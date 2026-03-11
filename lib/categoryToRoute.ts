export function categoryToRoute(category: string): string {
    if (category === 'Верхняя одежда') return '/jackets';
    if (category === 'Трикотаж') return '/tops';
    return '/jeans';
}
