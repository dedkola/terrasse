# Product Gallery & YouTube Video Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Support up to 6 images and one YouTube Shorts video per product, with a clickable thumbnail gallery on the product detail page and multi-image upload in the admin panel.

**Architecture:** Add a `product_images` table in Cloudflare D1 (separate from `products`) to store ordered gallery URLs. Add `youtube_url` column to `products`. The API, admin forms, and ProductDetail component are all updated to support the new fields.

**Tech Stack:** Next.js 15, TypeScript, Cloudflare D1 (via REST API in `lib/d1.ts`), Cloudflare R2 (via `lib/r2.ts`), Tailwind CSS, Framer Motion

**Design doc:** `docs/plans/2026-03-10-product-gallery-video-design.md`

---

### Task 1: Database Migration

Run these two SQL statements in the Cloudflare Dashboard (D1 → your database → Console tab), or via `wrangler d1 execute`.

**Files:**
- No code files to create — this is a manual DB step

**Step 1: Create `product_images` table**

Run in D1 console:
```sql
CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);
```

**Step 2: Add `youtube_url` column to `products`**

Run in D1 console:
```sql
ALTER TABLE products ADD COLUMN youtube_url TEXT;
```

**Step 3: Verify**

Run in D1 console and confirm both exist:
```sql
SELECT name FROM sqlite_master WHERE type='table';
PRAGMA table_info(products);
```

---

### Task 2: Update TypeScript Types

**Files:**
- Modify: `types/index.ts`

**Step 1: Update Product interface**

Replace the entire file content with:
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
}
```

**Step 2: Commit**
```bash
git add types/index.ts
git commit -m "feat: add images array and youtube_url to Product type"
```

---

### Task 3: Update GET /api/products/[id] — Return Gallery

**Files:**
- Modify: `app/api/products/[id]/route.ts`

**Step 1: Update the GET handler**

In `app/api/products/[id]/route.ts`, replace the GET handler. The `ProductRow` type at the top also needs `youtube_url`:

```ts
type ProductRow = {
    id: string;
    slug: string;
    name: string;
    price: number;
    category: string;
    description: string;
    image: string;
    is_new: number;
    youtube_url: string | null;
};
```

Replace the GET handler body with:
```ts
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const result = await d1Query<ProductRow>('SELECT * FROM products WHERE id = ?', [id]);

        if (!result.results.length) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const p = result.results[0];

        const imagesResult = await d1Query<{ url: string }>(
            'SELECT url FROM product_images WHERE product_id = ? ORDER BY position ASC',
            [id]
        );
        const images = imagesResult.results.map((r) => r.url);

        return NextResponse.json({
            id: p.id,
            slug: p.slug || p.id,
            name: p.name,
            price: p.price,
            category: p.category,
            description: p.description,
            image: p.image,
            images,
            youtube_url: p.youtube_url ?? undefined,
            isNew: Boolean(p.is_new),
        });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
```

**Step 2: Verify manually**

Start the dev server (`pnpm dev`) and hit `http://localhost:3000/api/products/{some-id}`. Response should now include `"images": []` and no `youtube_url` (or `null`) for existing products.

**Step 3: Commit**
```bash
git add app/api/products/[id]/route.ts
git commit -m "feat: GET /api/products/[id] returns images array and youtube_url"
```

---

### Task 4: Update PUT /api/products/[id] — Handle Gallery on Edit

**Files:**
- Modify: `app/api/products/[id]/route.ts`

**Step 1: Update the PUT handler**

Replace the full PUT handler:
```ts
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const existing = await d1Query<ProductRow>('SELECT * FROM products WHERE id = ?', [id]);
        if (!existing.results.length) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        const current = existing.results[0];

        const formData = await request.formData();
        const name = formData.get('name') as string;
        const price = formData.get('price') as string;
        const category = formData.get('category') as string;
        const description = formData.get('description') as string;
        const isNew = formData.get('isNew') === 'true' ? 1 : 0;
        const youtubeUrl = (formData.get('youtube_url') as string) || null;

        // Images to keep (existing URLs the admin chose to keep)
        const existingImagesJson = formData.get('existing_images') as string | null;
        const keptUrls: string[] = existingImagesJson ? JSON.parse(existingImagesJson) : [];

        // Fetch current images from product_images table
        const currentImagesResult = await d1Query<{ url: string }>(
            'SELECT url FROM product_images WHERE product_id = ?',
            [id]
        );
        const currentImageUrls = currentImagesResult.results.map((r) => r.url);

        // Delete removed images from R2 and DB
        const removedUrls = currentImageUrls.filter((url) => !keptUrls.includes(url));
        for (const url of removedUrls) {
            await deleteFromR2(url);
        }
        if (removedUrls.length > 0) {
            await d1Query(
                'DELETE FROM product_images WHERE product_id = ?',
                [id]
            );
        }

        // Upload new image files
        const newImageUrls: string[] = [];
        for (let i = 0; i < 6; i++) {
            const file = formData.get(`image_${i}`) as File | null;
            if (!file || file.size === 0) continue;
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const ext = file.name.split('.').pop() || 'jpg';
            const filename = `${randomUUID()}.${ext}`;
            const url = await uploadToR2(buffer, filename, file.type);
            newImageUrls.push(url);
        }

        // Final ordered image list: kept first, then new ones
        const allImages = [...keptUrls, ...newImageUrls];

        // Re-insert all images with correct positions
        for (let i = 0; i < allImages.length; i++) {
            await d1Query(
                'INSERT INTO product_images (id, product_id, url, position) VALUES (?, ?, ?, ?)',
                [randomUUID(), id, allImages[i], i]
            );
        }

        // Primary image for card thumbnail = first image, or keep current if no images
        const primaryImage = allImages.length > 0 ? allImages[0] : current.image;

        if (!name || !price || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const slug = name !== current.name
            ? await generateUniqueSlug(name, id)
            : (current.slug || slugify(name));

        await d1Query(
            `UPDATE products SET name=?, slug=?, price=?, category=?, description=?, is_new=?, image=?, youtube_url=? WHERE id=?`,
            [name, slug, parseFloat(price), category, description || '', isNew, primaryImage, youtubeUrl, id]
        );

        return NextResponse.json({ success: true, slug });
    } catch (err) {
        console.error('Update error:', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
```

Note: Remove the old `imageFile` / single-image handling logic. The `imageFile` variable and related R2 upload are no longer needed.

**Step 2: Commit**
```bash
git add app/api/products/[id]/route.ts
git commit -m "feat: PUT /api/products/[id] handles multi-image gallery and youtube_url"
```

---

### Task 5: Update DELETE /api/products/[id] — Cleanup All Gallery Images

**Files:**
- Modify: `app/api/products/[id]/route.ts`

**Step 1: Replace the DELETE handler**

```ts
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const existing = await d1Query<ProductRow>('SELECT * FROM products WHERE id = ?', [id]);
        if (!existing.results.length) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        // Delete all gallery images from R2
        const imagesResult = await d1Query<{ url: string }>(
            'SELECT url FROM product_images WHERE product_id = ?',
            [id]
        );
        for (const { url } of imagesResult.results) {
            await deleteFromR2(url);
        }
        await d1Query('DELETE FROM product_images WHERE product_id = ?', [id]);

        // Delete primary image from R2
        const primaryImage = existing.results[0].image;
        if (primaryImage) await deleteFromR2(primaryImage);

        await d1Query('DELETE FROM products WHERE id = ?', [id]);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Delete error:', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
```

**Step 2: Commit**
```bash
git add app/api/products/[id]/route.ts
git commit -m "feat: DELETE /api/products/[id] cleans up all gallery images from R2"
```

---

### Task 6: Update POST /api/products — Multi-Image Upload on Create

**Files:**
- Modify: `app/api/products/route.ts`

**Step 1: Replace the POST handler**

```ts
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const name = formData.get('name') as string;
        const price = formData.get('price') as string;
        const category = formData.get('category') as string;
        const description = formData.get('description') as string;
        const isNew = formData.get('isNew') === 'true' ? 1 : 0;
        const youtubeUrl = (formData.get('youtube_url') as string) || null;

        if (!name || !price || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Upload all image files (image_0 … image_5)
        const imageUrls: string[] = [];
        for (let i = 0; i < 6; i++) {
            const file = formData.get(`image_${i}`) as File | null;
            if (!file || file.size === 0) continue;
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const ext = file.name.split('.').pop() || 'jpg';
            const filename = `${randomUUID()}.${ext}`;
            const url = await uploadToR2(buffer, filename, file.type);
            imageUrls.push(url);
        }

        if (imageUrls.length === 0) {
            return NextResponse.json({ error: 'At least one image is required' }, { status: 400 });
        }

        const id = randomUUID();
        const slug = await generateUniqueSlug(name);
        const primaryImage = imageUrls[0];

        await d1Query(
            `INSERT INTO products (id, slug, name, price, category, description, image, is_new, youtube_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, slug, name, parseFloat(price), category, description || '', primaryImage, isNew, youtubeUrl]
        );

        for (let i = 0; i < imageUrls.length; i++) {
            await d1Query(
                'INSERT INTO product_images (id, product_id, url, position) VALUES (?, ?, ?, ?)',
                [randomUUID(), id, imageUrls[i], i]
            );
        }

        return NextResponse.json({ success: true, id, slug, imageUrl: primaryImage });
    } catch (err) {
        console.error('Upload error:', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
```

**Step 2: Commit**
```bash
git add app/api/products/route.ts
git commit -m "feat: POST /api/products supports multi-image upload and youtube_url"
```

---

### Task 7: Update Admin Add Page — Multi-Image Upload + YouTube URL

**Files:**
- Modify: `app/admin/add/page.tsx`

**Step 1: Replace state and handlers**

The file needs these state changes (replace existing `image`/`preview`/`dragging` state):
```ts
const [images, setImages] = useState<File[]>([]);
const [previews, setPreviews] = useState<string[]>([]);
const [youtubeUrl, setYoutubeUrl] = useState('');
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
const [errorMsg, setErrorMsg] = useState('');
const fileRef = useRef<HTMLInputElement>(null);
```

Replace `handleFile` and drag handlers with:
```ts
const handleFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/')).slice(0, 6 - images.length);
    setImages((prev) => [...prev, ...arr].slice(0, 6));
    setPreviews((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))].slice(0, 6));
};

const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
};

const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
}, [images]);

const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
const onDragLeave = () => setDragging(false);
```

Replace `handleSubmit` with:
```ts
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) { setErrorMsg('Добавьте хотя бы одно изображение'); return; }

    setStatus('loading');
    setErrorMsg('');

    try {
        const fd = new FormData();
        fd.append('name', name);
        fd.append('price', price);
        fd.append('category', category);
        fd.append('description', description);
        fd.append('isNew', String(isNew));
        fd.append('youtube_url', youtubeUrl);
        images.forEach((img, i) => fd.append(`image_${i}`, img));

        const res = await fetch('/api/products', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Ошибка загрузки');

        setStatus('success');
        setTimeout(() => router.push('/jeans'), 1800);
    } catch (err) {
        setStatus('error');
        setErrorMsg(String(err));
    }
};
```

**Step 2: Replace the image upload JSX section**

Replace the existing single-image upload block with:
```tsx
<div>
    <label className="block text-xs uppercase tracking-[0.2em] text-white/50 mb-3">
        Фотографии * (до 6)
    </label>
    {/* Image previews grid */}
    {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-3">
            {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-white/5">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black"
                    >
                        ✕
                    </button>
                    {i === 0 && (
                        <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                            Главная
                        </span>
                    )}
                </div>
            ))}
        </div>
    )}
    {/* Drop zone (only show if less than 6 images) */}
    {previews.length < 6 && (
        <div
            onClick={() => fileRef.current?.click()}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`
                relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 h-32
                ${dragging ? 'border-white/70 bg-white/5' : 'border-white/20 hover:border-white/40 bg-white/[0.02]'}
            `}
        >
            <div className="flex flex-col items-center justify-center h-full gap-2 text-white/40">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className="text-sm">Добавить фото ({previews.length}/6)</p>
                <p className="text-xs text-white/25">JPG, PNG, WEBP</p>
            </div>
        </div>
    )}
    <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
    />
</div>
```

**Step 3: Add YouTube URL field** (after description field, before isNew toggle):
```tsx
<div>
    <label className="block text-xs uppercase tracking-[0.2em] text-white/50 mb-3">
        YouTube Shorts (ссылка)
    </label>
    <input
        type="url"
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
        placeholder="https://www.youtube.com/shorts/..."
        className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-5 py-4 text-white placeholder-white/25 focus:outline-none focus:border-white/50 transition-colors text-sm"
    />
</div>
```

**Step 4: Commit**
```bash
git add app/admin/add/page.tsx
git commit -m "feat: admin add page supports multi-image upload and YouTube URL"
```

---

### Task 8: Update Admin Edit Page — Manage Gallery + YouTube URL

**Files:**
- Modify: `app/admin/edit/[id]/page.tsx`

**Step 1: Update state**

Replace image-related state with:
```ts
// Existing images fetched from DB
const [existingImages, setExistingImages] = useState<string[]>([]);
// New files to upload
const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
const [youtubeUrl, setYoutubeUrl] = useState('');
const [dragging, setDragging] = useState(false);
const fileRef = useRef<HTMLInputElement>(null);
```

**Step 2: Update `fetchProduct`**

Add to the data loading inside `useEffect`:
```ts
setExistingImages(data.images ?? []);
setYoutubeUrl(data.youtube_url ?? '');
```

Also update the local `Product` type at the top of the file:
```ts
type Product = {
    id: string;
    name: string;
    price: number;
    category: string;
    description: string;
    image: string;
    images: string[];
    youtube_url?: string;
    isNew: boolean;
};
```

**Step 3: Add file handlers**
```ts
const handleNewFiles = (files: FileList | File[]) => {
    const total = existingImages.length + newImageFiles.length;
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/')).slice(0, 6 - total);
    setNewImageFiles((prev) => [...prev, ...arr]);
    setNewImagePreviews((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))]);
};

const removeExisting = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
};

const removeNew = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
};

const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleNewFiles(e.dataTransfer.files);
}, [existingImages, newImageFiles]);

const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
const onDragLeave = () => setDragging(false);
```

**Step 4: Update `handleSave`**
```ts
const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveStatus('loading');
    setSaveError('');

    try {
        const fd = new FormData();
        fd.append('name', name);
        fd.append('price', price);
        fd.append('category', category);
        fd.append('description', description);
        fd.append('isNew', String(isNew));
        fd.append('youtube_url', youtubeUrl);
        fd.append('existing_images', JSON.stringify(existingImages));
        newImageFiles.forEach((img, i) => fd.append(`image_${i}`, img));

        const res = await fetch(`/api/products/${id}`, { method: 'PUT', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Ошибка сохранения');

        setSaveStatus('success');
        setTimeout(() => router.push('/admin'), 1200);
    } catch (err) {
        setSaveStatus('error');
        setSaveError(String(err));
    }
};
```

**Step 5: Replace the image JSX section**

Replace the existing single-image drag zone with:
```tsx
<div>
    <label className="block text-xs uppercase tracking-[0.2em] text-white/50 mb-3">
        Фотографии (до 6)
    </label>

    {/* Existing images */}
    {existingImages.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-3">
            {existingImages.map((url, i) => (
                <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                        type="button"
                        onClick={() => removeExisting(i)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black"
                    >
                        ✕
                    </button>
                    {i === 0 && (
                        <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                            Главная
                        </span>
                    )}
                </div>
            ))}
        </div>
    )}

    {/* New image previews */}
    {newImagePreviews.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-3">
            {newImagePreviews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-white/5 ring-1 ring-white/30">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                        type="button"
                        onClick={() => removeNew(i)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black"
                    >
                        ✕
                    </button>
                    <span className="absolute bottom-1 left-1 text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded">Новое</span>
                </div>
            ))}
        </div>
    )}

    {/* Drop zone */}
    {(existingImages.length + newImageFiles.length) < 6 && (
        <div
            onClick={() => fileRef.current?.click()}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`
                relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 h-32
                ${dragging ? 'border-white/70 bg-white/5' : 'border-white/20 hover:border-white/40'}
            `}
        >
            <div className="flex flex-col items-center justify-center h-full gap-2 text-white/40">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className="text-sm">Добавить фото ({existingImages.length + newImageFiles.length}/6)</p>
            </div>
        </div>
    )}
    <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleNewFiles(e.target.files)}
    />
</div>
```

**Step 6: Add YouTube URL field** (after description, before isNew toggle):
```tsx
<div>
    <label className="block text-xs uppercase tracking-[0.2em] text-white/50 mb-3">
        YouTube Shorts (ссылка)
    </label>
    <input
        type="url"
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
        placeholder="https://www.youtube.com/shorts/..."
        className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-5 py-4 text-white placeholder-white/25 focus:outline-none focus:border-white/50 transition-colors text-sm"
    />
</div>
```

**Step 7: Commit**
```bash
git add app/admin/edit/[id]/page.tsx
git commit -m "feat: admin edit page supports gallery management and YouTube URL"
```

---

### Task 9: Update ProductDetail Component — Gallery + YouTube Embed

**Files:**
- Modify: `components/ProductDetail.tsx`

**Step 1: Add `selectedIndex` state and YouTube helper**

After the existing state declarations, add:
```ts
const [selectedIndex, setSelectedIndex] = useState<number | 'video'>('video' in {} ? 0 : 0);
```

Actually use this clean version — replace all state declarations at the top of the component:
```ts
const [selectedSize, setSelectedSize] = useState('M');
const [quantity, setQuantity] = useState(1);
const [selected, setSelected] = useState<number | 'video'>(0);
```

Add a helper function to extract YouTube video ID (place it above the component or inside):
```ts
function extractYouTubeId(url: string): string | null {
    const match = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
}
```

**Step 2: Replace the image gallery JSX**

Replace the entire `{/* Image Gallery */}` section with:
```tsx
{/* Image Gallery */}
<div className="space-y-4">
    {/* Main display */}
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="aspect-[3/4] bg-stone-100 rounded-2xl overflow-hidden"
    >
        {selected === 'video' && product.youtube_url ? (
            (() => {
                const videoId = extractYouTubeId(product.youtube_url);
                return videoId ? (
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                        title={product.name}
                    />
                ) : null;
            })()
        ) : (
            <Image
                src={(product.images && product.images.length > 0 ? product.images[selected as number] : product.image)}
                alt={product.name}
                width={800}
                height={1200}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                priority
            />
        )}
    </motion.div>

    {/* Thumbnails */}
    {((product.images && product.images.length > 1) || product.youtube_url) && (
        <div className="grid grid-cols-4 gap-3">
            {(product.images ?? [product.image]).map((url, i) => (
                <button
                    key={url}
                    onClick={() => setSelected(i)}
                    className={`aspect-square bg-stone-100 rounded-xl overflow-hidden transition-all ${
                        selected === i ? 'ring-2 ring-black' : 'opacity-60 hover:opacity-100'
                    }`}
                >
                    <Image
                        src={url}
                        alt={`${product.name} view ${i + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                    />
                </button>
            ))}
            {product.youtube_url && (
                <button
                    onClick={() => setSelected('video')}
                    className={`aspect-square bg-stone-900 rounded-xl overflow-hidden flex items-center justify-center transition-all ${
                        selected === 'video' ? 'ring-2 ring-black' : 'opacity-60 hover:opacity-100'
                    }`}
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                        <polygon points="5,3 19,12 5,21" />
                    </svg>
                </button>
            )}
        </div>
    )}
</div>
```

**Step 3: Commit**
```bash
git add components/ProductDetail.tsx
git commit -m "feat: ProductDetail shows image gallery and YouTube Shorts embed"
```

---

### Task 10: Update Product Detail Page — Pass images and youtube_url

**Files:**
- Modify: `app/jeans/[slug]/page.tsx`

**Step 1: Read the file and confirm it fetches the product by slug**

Open `app/jeans/[slug]/page.tsx`. Confirm it calls `GET /api/products/[id]` or fetches by slug. The response now includes `images` and `youtube_url` — no change needed if it just passes the full product object to `ProductDetail`. If it uses a typed `Product` from `@/types`, the updated type is already correct.

**Step 2: Verify the page passes `product` to `<ProductDetail product={product} />`**

If yes, no changes needed here — the component receives the full product including `images` and `youtube_url`.

**Step 3: Manual verification**

- Open `http://localhost:3000/jeans/[some-slug]`
- Confirm the main image still loads
- The thumbnail strip should only appear if there are multiple images or a video

---

### Task 11: Final Manual QA

**Step 1: Add a new product with multiple images**
- Go to `/admin/add`
- Upload 3 images, paste a YouTube Shorts URL, fill other fields
- Submit
- Visit `/jeans` — confirm product card shows the first image

**Step 2: Check product detail page**
- Click the product → `/jeans/[slug]`
- Confirm 3 image thumbnails + 1 video thumbnail appear
- Click each thumbnail — confirm main view switches
- Click video thumbnail — confirm YouTube embed appears in the main display area

**Step 3: Edit the product**
- Go to `/admin` → edit
- Confirm existing images appear as thumbnails with ✕ buttons
- Remove one image → save → confirm it's gone on the detail page
- Add new image → save → confirm it appears

**Step 4: Delete the product**
- Go to `/admin` → delete
- Confirm product removed from list

---

### Task 12: Commit & Push

```bash
git push origin claude/beautiful-wilbur
```

Then open a PR to `main`.
