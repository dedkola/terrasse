# Catalog Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add jackets and tops category pages, wire up home page blocks, add auto-assigned item codes, and clean up product detail UI.

**Architecture:** Option A — each category gets its own Next.js route (`/jeans`, `/jackets`, `/tops`) backed by a shared `CategoryListPage` component. Item codes are sequential integers stored in Cloudflare D1, auto-assigned on insert via `MAX(code)+1`. ProductDetail is stripped of all e-commerce UI (cart, sizes, quantity).

**Tech Stack:** Next.js 15 (App Router), Cloudflare D1 (SQLite via REST API), Cloudflare R2, TypeScript, Tailwind CSS, motion/react

---

### Task 1: Add `code` to Product type and API GET

**Files:**
- Modify: `types/index.ts`
- Modify: `app/api/products/route.ts`

**Step 1: Add `code` to the Product interface**

In `types/index.ts`, add `code?: number` field:

```ts
export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  image: string;
  images: string[];
  youtube_url?: string;
  isNew?: boolean;
  description?: string;
  code?: number;
}
```

**Step 2: Update GET handler to include `code`**

In `app/api/products/route.ts`, the GET handler selects from D1. Update the query and mapping to include `code`:

```ts
// In the GET handler, update the d1Query type and SELECT:
const result = await d1Query<{
    id: string;
    slug: string;
    name: string;
    price: number;
    category: string;
    description: string;
    image: string;
    is_new: number;
    code: number | null;
}>('SELECT * FROM products ORDER BY created_at DESC');

const products = result.results.map((p) => ({
    id: p.id,
    slug: p.slug || p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    description: p.description,
    image: p.image,
    isNew: Boolean(p.is_new),
    code: p.code ?? undefined,
}));
```

**Step 3: Commit**

```bash
git add types/index.ts app/api/products/route.ts
git commit -m "feat: add code field to Product type and GET response"
```

---

### Task 2: Add `code` DB column and auto-assign on POST

**Files:**
- Modify: `app/api/products/route.ts`

The Cloudflare D1 table may not have a `code` column yet. We handle this by running the ALTER in the POST handler lazily, or by adding it as part of the insert logic. The safest approach: run `ALTER TABLE products ADD COLUMN code INTEGER` via a one-time migration, and auto-assign in POST.

**Step 1: Add migration call to POST handler**

At the top of the POST handler (after auth checks, before insert), add the code assignment logic:

```ts
// In POST handler, after validation, before the main INSERT:

// Get next code
const codeResult = await d1Query<{ next_code: number }>(
    'SELECT COALESCE(MAX(code), 0) + 1 AS next_code FROM products'
);
const nextCode = codeResult.results[0]?.next_code ?? 1;
```

**Step 2: Include `code` in the INSERT statement**

Replace the existing INSERT:

```ts
await d1Query(
    `INSERT INTO products (id, slug, name, price, category, description, image, is_new, youtube_url, code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, slug, name, parseFloat(price), category, description || '', primaryImage, isNew, youtubeUrl, nextCode]
);
```

Also update the return to include `code`:
```ts
return NextResponse.json({ success: true, id, slug, imageUrl: primaryImage, code: nextCode });
```

**Step 3: Run DB migration via D1 REST API**

The `code` column must exist in D1. Add a one-time migration endpoint at `app/api/migrate/route.ts` that can be called once:

```ts
import { NextResponse } from 'next/server';
import { d1Query } from '@/lib/d1';

export async function POST() {
    try {
        await d1Query('ALTER TABLE products ADD COLUMN code INTEGER');
        return NextResponse.json({ success: true, message: 'Migration complete' });
    } catch (err) {
        // Column may already exist — not an error
        return NextResponse.json({ success: true, message: String(err) });
    }
}
```

**Step 4: Commit**

```bash
git add app/api/products/route.ts app/api/migrate/route.ts
git commit -m "feat: auto-assign sequential item codes on product creation"
```

---

### Task 3: Create shared CategoryListPage component

**Files:**
- Create: `components/CategoryListPage.tsx`

This replaces the per-category inline code. Accepts category config and renders the product grid.

```tsx
import React from 'react';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';

interface CategoryListPageProps {
    title: string;
    subtitle: string;
    categoryFilter: string | string[];
}

async function getProductsByCategory(filter: string | string[]): Promise<Product[]> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/products`, { cache: 'no-store' });
        if (!res.ok) return [];
        const all: Product[] = await res.json();
        const filters = Array.isArray(filter) ? filter : [filter];
        return all.filter((p) => filters.some((f) => p.category === f || p.category.includes(f)));
    } catch {
        return [];
    }
}

export default async function CategoryListPage({ title, subtitle, categoryFilter }: CategoryListPageProps) {
    const products = await getProductsByCategory(categoryFilter);

    return (
        <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen">
            <div className="mb-12">
                <span className="text-xs uppercase tracking-[0.3em] text-brand-muted mb-2 block">Категория</span>
                <h1 className="text-5xl font-serif">{title}</h1>
                {subtitle && <p className="text-brand-muted mt-3">{subtitle}</p>}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            {products.length === 0 && (
                <p className="text-brand-muted mt-8">В этой категории пока нет товаров.</p>
            )}
        </main>
    );
}
```

**Step 2: Refactor `app/jeans/page.tsx` to use shared component**

Replace the entire file with:

```tsx
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
```

**Step 3: Commit**

```bash
git add components/CategoryListPage.tsx app/jeans/page.tsx
git commit -m "feat: extract shared CategoryListPage component, refactor jeans page"
```

---

### Task 4: Add /jackets and /tops routes

**Files:**
- Create: `app/jackets/page.tsx`
- Create: `app/tops/page.tsx`

**Step 1: Create jackets listing page**

`app/jackets/page.tsx`:
```tsx
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
```

**Step 2: Create tops listing page**

`app/tops/page.tsx`:
```tsx
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
```

**Step 3: Create jackets detail route**

`app/jackets/[slug]/page.tsx` — copy exactly from `app/jeans/[slug]/page.tsx`, no changes needed (it fetches by slug from D1, category-agnostic).

**Step 4: Create tops detail route**

`app/tops/[slug]/page.tsx` — same as above, copy from `app/jeans/[slug]/page.tsx`.

**Step 5: Commit**

```bash
git add app/jackets/ app/tops/
git commit -m "feat: add jackets and tops category pages"
```

---

### Task 5: Add category→route helper and update ProductCard

**Files:**
- Modify: `components/ProductCard.tsx`

**Step 1: Add the helper function and update the link**

Replace the hardcoded `/jeans/${product.slug}` with a dynamic route. Also remove the "quick add" button overlay and Heart button.

Full updated `components/ProductCard.tsx`:

```tsx
"use client";

import React from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';

function categoryToRoute(category: string): string {
    if (category === 'Верхняя одежда') return '/jackets';
    if (category === 'Трикотаж') return '/tops';
    return '/jeans';
}

const ProductCard = ({ product }: { product: Product; key?: React.Key }) => {
    const route = categoryToRoute(product.category);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group"
        >
            <Link href={`${route}/${product.slug}`} className="block">
                <div className="relative overflow-hidden bg-stone-100 rounded-lg">
                    <Image
                        src={product.image}
                        alt={product.name}
                        width={500}
                        height={750}
                        className="product-card-image"
                        referrerPolicy="no-referrer"
                    />
                    {product.isNew && (
                        <span className="absolute top-4 left-4 bg-white px-3 py-1 text-[10px] uppercase tracking-widest font-bold">Новинка</span>
                    )}
                </div>
                <div className="mt-4 flex justify-between items-start">
                    <div>
                        <h3 className="text-sm font-medium text-brand-ink">{product.name}</h3>
                        <p className="text-xs text-brand-muted mt-1">{product.category}</p>
                        {product.code && (
                            <p className="text-[10px] text-brand-muted mt-0.5">#{String(product.code).padStart(4, '0')}</p>
                        )}
                    </div>
                    <p className="text-sm font-medium">₴{product.price}</p>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProductCard;
```

**Step 2: Commit**

```bash
git add components/ProductCard.tsx
git commit -m "feat: dynamic category routing in ProductCard, remove quick-add button"
```

---

### Task 6: Update CategorySection links

**Files:**
- Modify: `components/CategorySection.tsx`

**Step 1: Update hrefs**

Change the `categories` array in `CategorySection.tsx`:

```ts
const categories = [
    { name: 'Верхняя одежда', href: '/jackets', image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=800' },
    { name: 'Деним', href: '/jeans', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800' },
    { name: 'Трикотаж', href: '/tops', image: 'https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?auto=format&fit=crop&q=80&w=800' }
];
```

**Step 2: Commit**

```bash
git add components/CategorySection.tsx
git commit -m "fix: wire up CategorySection links to /jackets and /tops"
```

---

### Task 7: Clean up ProductDetail — remove cart UI

**Files:**
- Modify: `components/ProductDetail.tsx`

**Step 1: Remove all cart-related elements**

Remove from `ProductDetail.tsx`:
- `import { useStateContext }` and its usage
- `import { Minus, Plus }` (keep `ArrowLeft`)
- `selectedSize`, `setSelectedSize`, `quantity`, `setQuantity` state
- `sizes` array
- The entire "Выберите размер" section (size buttons + size table link)
- The entire "Количество" section (quantity counter)
- The entire bottom button row (В корзину + Heart button)
- `import { Heart }`

**Step 2: Add item code display**

In the product info section, after the category label and before the name, add:

```tsx
<p className="text-xs uppercase tracking-[0.3em] text-brand-muted mb-2">{product.category}</p>
{product.code && (
    <p className="text-[11px] text-brand-muted mb-2">#{String(product.code).padStart(4, '0')}</p>
)}
<h1 className="text-4xl md:text-5xl font-serif mb-4">{product.name}</h1>
```

**Step 3: Full cleaned-up ProductDetail**

The component after cleanup should have:
- Back button ✓
- Image gallery with thumbnails and video support ✓
- Product info: category, code, name, price, description ✓
- "Детали и Уход" accordion ✓
- "Доставка и Возврат" accordion ✓
- NO size selector, NO quantity counter, NO cart button, NO heart button

Also remove unused imports: `useStateContext`, `Heart`, `Minus`, `Plus`

**Step 4: Commit**

```bash
git add components/ProductDetail.tsx
git commit -m "feat: remove cart/size/quantity UI from ProductDetail, add item code display"
```

---

### Task 8: Show item code in admin list

**Files:**
- Modify: `app/admin/page.tsx`

**Step 1: Add `code` to the admin Product type**

In `app/admin/page.tsx`, update the local `Product` type:

```ts
type Product = {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    isNew: boolean;
    code?: number;
};
```

**Step 2: Show code in the product row**

In the product info section of the admin list, add code display:

```tsx
<p className="text-xs text-white/40">
    {product.category} · ₴{product.price}
    {product.code ? ` · #${String(product.code).padStart(4, '0')}` : ''}
</p>
```

**Step 3: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat: show item code in admin product list"
```

---

### Task 9: Delete unused pages

**Files:**
- Delete: `app/brands/page.tsx`
- Delete: `app/articles/page.tsx`

**Step 1: Delete the files**

```bash
rm app/brands/page.tsx
rm app/articles/page.tsx
```

**Step 2: Commit**

```bash
git add -A
git commit -m "chore: remove unused brands and articles pages"
```

---

### Task 10: Run DB migration

**Step 1: Deploy to Cloudflare / start dev server**

Ensure the app is running. Then call the migration endpoint once:

```bash
curl -X POST http://localhost:3000/api/migrate
```

Expected response: `{"success":true,"message":"Migration complete"}` or similar (even if column already exists).

**Step 2: Verify**

- Visit `/api/products` — confirm `code` field appears in response (may be `null` for existing products)
- Add a new product via admin → `/admin/add` — confirm it gets `code: 1`
- Add another — confirm `code: 2`

**Step 3: Optional — delete migration route after use**

```bash
rm app/api/migrate/route.ts
git add -A
git commit -m "chore: remove one-time migration route"
```

---

### Task 11: Final verification

**Step 1: Verify all 3 category pages work**
- Visit `/jeans` — products with category `Деним` appear
- Visit `/jackets` — products with category `Верхняя одежда` appear
- Visit `/tops` — products with category `Трикотаж` appear

**Step 2: Verify home page**
- Visit `/` — all 3 category blocks link correctly

**Step 3: Verify product detail**
- Click any product — detail page shows: category, item code, name, price, description, images
- No size buttons, no cart button, no quantity counter visible

**Step 4: Verify admin**
- Visit `/admin` — item codes visible in product rows

**Step 5: Verify routing from ProductCard**
- A jeans product links to `/jeans/[slug]`
- A jacket product links to `/jackets/[slug]`
- A tops product links to `/tops/[slug]`
