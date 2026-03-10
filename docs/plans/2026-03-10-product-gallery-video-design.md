# Product Gallery & YouTube Video Design

**Date:** 2026-03-10
**Status:** Approved

## Problem

Product detail pages currently show 1 image with 3 placeholder thumbnails all pointing to the same image. Admins can only upload a single image per product and there is no video support.

## Goal

- Support up to 6 images per product
- Support one YouTube Shorts video per product, embedded inline on the product page
- Admin can upload multiple images at once and manage them

## Database Schema

```sql
-- New table for gallery images
CREATE TABLE product_images (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);

-- Add YouTube URL to products
ALTER TABLE products ADD COLUMN youtube_url TEXT;
```

The existing `products.image` column is kept for backward compatibility (product card thumbnails). The `product_images` table holds the full gallery in display order.

## API Changes

### `GET /api/products/[id]`
- JOIN with `product_images` ordered by `position`
- Return `images: string[]` and `youtube_url?: string` in addition to existing fields

### `POST /api/products`
- Accept files as `image_0` … `image_5` in FormData (up to 6)
- Accept `youtube_url` text field
- First image also sets `products.image` for card thumbnail
- Upload each file to R2 under `photos/photo/{uuid}.ext`
- Insert each into `product_images` with incrementing position

### `PUT /api/products/[id]`
- Accept new files as `image_0` … `image_N`
- Accept `existing_images` as JSON string (URLs to keep)
- Delete removed image URLs from R2 and from `product_images`
- Upload new files to R2, insert into `product_images`
- Accept `youtube_url`
- Update `products.image` to first image in final ordered list

### `DELETE /api/products/[id]`
- Fetch all `product_images` rows for the product
- Delete each URL from R2
- Delete all `product_images` rows
- Delete product row

## Product Type

```ts
interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  image: string;         // primary image (card thumbnail)
  images: string[];      // full gallery, ordered
  youtube_url?: string;
  isNew?: boolean;
  description?: string;
}
```

## ProductDetail Component

- **Main display** (3:4 ratio): shows selected image, or YouTube iframe if video thumbnail is selected
- **Thumbnail strip** below main: renders image thumbnails + optional video thumbnail (play icon overlay). Clicking switches main view. Active thumbnail is highlighted.
- **YouTube embed**: extract video ID from `youtube.com/shorts/{id}` URL. Embed as `https://www.youtube.com/embed/{id}` in a 9:16 aspect iframe with `autoplay=0`.

## Admin Add Page

- Replace single image upload zone with multi-file zone (up to 6 files at once)
- Show selected images as a removable preview grid
- Add YouTube URL text input below image section

## Admin Edit Page

- Show existing images from DB as thumbnails with ✕ remove button
- Add more images via multi-file picker
- YouTube URL text input pre-filled from DB
- On save: compute removed = current DB images minus kept images; delete from R2; upload new files

## Decisions

- Separate `product_images` table chosen over JSON column for clean R2 cleanup and natural ordering
- `products.image` kept for backward compatibility with product cards (no migration of card queries needed)
- YouTube video ID extracted with a simple regex on the Shorts URL format
