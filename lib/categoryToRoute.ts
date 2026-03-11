export function categoryToRoute(category: string): string {
    if (category === 'Верхняя одежда') return '/jackets';
    if (category === 'Трикотаж') return '/knitwear';
    if (category === 'Топы') return '/tops';
    return '/tops';
}
