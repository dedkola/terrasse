# Catalog Refactor Design — 2026-03-11

## Summary

Extend the store from jeans-only to 3 categories (Деним, Верхняя одежда, Трикотаж), wire up the home page category blocks, remove unused pages, clean up the product detail UI, and add auto-assigned item codes.

## Approach: Option A — Duplicate routes with shared components

Each category gets its own Next.js route (`/jeans`, `/jackets`, `/tops`) backed by shared reusable components to avoid duplication.

---

## Changes

### 1. Shared category components
- Extract `components/CategoryListPage.tsx` — accepts `{ title, subtitle, categoryFilter }`, fetches and renders filtered products
- Extract `components/CategoryDetailPage.tsx` — thin wrapper around `ProductDetail` used by each `[slug]` page (already exists as `ProductDetail`, so `[slug]` pages just call it directly)

### 2. New routes
- `app/jackets/page.tsx` — Верхняя одежда listing, filters `category === 'Верхняя одежда'`
- `app/jackets/[slug]/page.tsx` — copies `app/jeans/[slug]/page.tsx`
- `app/tops/page.tsx` — Трикотаж listing, filters `category === 'Трикотаж'`
- `app/tops/[slug]/page.tsx` — copies `app/jeans/[slug]/page.tsx`

### 3. CategorySection update
- Верхняя одежда: `href` `#` → `/jackets`
- Трикотаж: `href` `#` → `/tops`

### 4. ProductCard update
- Add `categoryToRoute(category: string): string` helper
  - `'Деним'` → `/jeans`
  - `'Верхняя одежда'` → `/jackets`
  - `'Трикотаж'` → `/tops`
  - default → `/jeans`
- Remove "quick add" button overlay and Heart button

### 5. ProductDetail cleanup
- Remove: size selector section, size table link, quantity counter section, add-to-cart button, Heart button

### 6. Delete unused pages
- `app/brands/page.tsx` — delete
- `app/articles/page.tsx` — delete

### 7. Item codes
- **DB migration**: `ALTER TABLE products ADD COLUMN code INTEGER;`
  - Run via D1 API call in a one-off migration script or admin route
- **API POST** (`/api/products`): before insert, run `SELECT COALESCE(MAX(code), 0) + 1 AS next_code FROM products`, assign result as `code`
- **API GET**: include `code` in SELECT and response
- **Type**: add `code?: number` to `Product` interface
- **Display format**: `#${String(code).padStart(4, '0')}` → `#0001`
- **Show on**: product detail page (below category label), admin list row

---

## Category → Route Mapping

| Category (DB value) | Route     | Page title        |
|---------------------|-----------|-------------------|
| Деним               | /jeans    | Джинсы и Деним    |
| Верхняя одежда      | /jackets  | Верхняя одежда    |
| Трикотаж            | /tops     | Трикотаж          |

---

## Files Changed / Created

| Action | File |
|--------|------|
| Modify | `components/CategorySection.tsx` |
| Modify | `components/ProductCard.tsx` |
| Modify | `components/ProductDetail.tsx` |
| Modify | `app/api/products/route.ts` |
| Modify | `app/jeans/page.tsx` (extract to shared component) |
| Modify | `types/index.ts` |
| Create | `components/CategoryListPage.tsx` |
| Create | `app/jackets/page.tsx` |
| Create | `app/jackets/[slug]/page.tsx` |
| Create | `app/tops/page.tsx` |
| Create | `app/tops/[slug]/page.tsx` |
| Delete | `app/brands/page.tsx` |
| Delete | `app/articles/page.tsx` |
