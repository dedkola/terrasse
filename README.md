# Terrasse — Luxury Fashion E-Commerce

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Cloudflare D1](https://img.shields.io/badge/Cloudflare_D1-SQLite-F38020?style=flat-square&logo=cloudflare&logoColor=white)
![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-Storage-F38020?style=flat-square&logo=cloudflare&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?style=flat-square&logo=pnpm&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-tested-6E9F18?style=flat-square&logo=vitest&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

> Modern luxury fashion storefront built with Next.js 16 App Router, React 19, and Tailwind CSS 4. Backend powered entirely by Cloudflare (D1 SQLite database + R2 object storage).

---

## ✨ Features

- **Product catalogue** across 8 categories: tops, knitwear, jackets, dresses, pants, suits, jeans, accessories
- **Product detail pages** with multi-image gallery, thumbnail navigation, and embedded YouTube Shorts
- **Admin panel** — add, edit, and delete products; upload up to 6 images per product
- **Shopping cart** — global state via React Context; cart badge on navbar
- **Animated UI** — page transitions and scroll animations with the `motion` library
- **SEO** — dynamic `sitemap.xml` generated from the database, `robots.ts`, and per-page metadata
- **Image hosting** on Cloudflare R2 (S3-compatible), served via a custom CDN domain
- **Database migrations** via a protected API route

---

## 🏗 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 (utility-only) |
| Animations | `motion` (Motion One / Framer Motion v12) |
| Icons | Lucide React |
| Database | Cloudflare D1 (SQLite via REST API) |
| File storage | Cloudflare R2 (AWS S3-compatible) |
| S3 client | `@aws-sdk/client-s3` |
| Testing | Vitest + Testing Library |
| Package manager | pnpm |

---

## 📁 Project Structure

```
terrasse/
├── app/
│   ├── layout.tsx              # Root layout (Navbar, Footer, StateProvider)
│   ├── page.tsx                # Homepage (Hero, CategorySection, featured products)
│   ├── globals.css             # Tailwind + @theme tokens (brand colours, fonts)
│   ├── sitemap.ts              # Dynamic sitemap from D1
│   ├── robots.ts               # robots.txt
│   ├── api/
│   │   ├── products/           # GET list / POST create
│   │   │   └── [id]/           # GET detail / DELETE
│   │   └── migrate/            # POST — run DB migrations
│   ├── admin/                  # Product management UI
│   │   ├── page.tsx            # Product list & delete
│   │   ├── add/page.tsx        # Add product form
│   │   └── edit/[id]/page.tsx  # Edit product form
│   ├── collection/             # Full catalogue listing
│   ├── jackets/ tops/ knitwear/
│   ├── dresses/ pants/ suits/
│   ├── jeans/ accessories/     # Category listing + [slug] detail
│   ├── about/                  # Brand story
│   ├── contacts/               # Contact page
│   └── trends/[slug]/          # Editorial trend pages
├── components/
│   ├── Navbar.tsx              # Responsive navbar with cart badge
│   ├── Footer.tsx              # Site footer
│   ├── Hero.tsx                # Homepage hero section
│   ├── CategorySection.tsx     # Category grid on homepage
│   ├── ProductCard.tsx         # Reusable product card
│   ├── ProductDetail.tsx       # Full product detail with gallery
│   ├── CategoryListPage.tsx    # Generic category listing page
│   └── StateProvider.tsx       # React Context for cart state
├── lib/
│   ├── d1.ts                   # Cloudflare D1 REST client (d1Query<T>)
│   ├── r2.ts                   # R2 upload/delete helpers
│   ├── slugify.ts              # URL slug generation
│   └── categoryToRoute.ts      # Category → route mapping
├── types/
│   └── index.ts                # Product interface
└── tests/
    └── setup.ts                # Vitest test setup
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm (`npm i -g pnpm`)
- A Cloudflare account with **D1** and **R2** set up

### 1. Clone & install

```bash
git clone https://github.com/your-username/terrasse.git
cd terrasse
pnpm install
```

### 2. Environment variables

Create `.env.local` in the project root:

```env
# Cloudflare D1 (database)
CF_ACCOUNT_ID=your_cloudflare_account_id
CF_API_TOKEN=your_cloudflare_api_token
CF_D1_DATABASE_ID=your_d1_database_id

# Cloudflare R2 (image storage)
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_DOMAIN=https://your-custom-cdn-domain.com

# Site URL (for sitemap)
NEXT_PUBLIC_BASE_URL=https://your-site.com
```

### 3. Database setup

Create the D1 tables by running the migration endpoint after starting the dev server:

```bash
curl -X POST http://localhost:3000/api/migrate
```

### 4. Start development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📦 Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run Vitest test suite |
| `pnpm test:watch` | Run Vitest in watch mode |

---

## 🗄 Database Schema

The application uses two main tables in Cloudflare D1:

```sql
CREATE TABLE products (
  id                   TEXT PRIMARY KEY,
  slug                 TEXT UNIQUE NOT NULL,
  name                 TEXT NOT NULL,
  price                REAL NOT NULL,
  category             TEXT NOT NULL,
  description          TEXT,
  description_material TEXT,
  description_style    TEXT,
  image                TEXT NOT NULL,
  is_new               INTEGER DEFAULT 0,
  youtube_url          TEXT,
  code                 INTEGER,
  created_at           DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_images (
  id         TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  url        TEXT NOT NULL,
  position   INTEGER NOT NULL
);
```

---

## 🎨 Design System

Custom Tailwind CSS 4 theme tokens defined in `app/globals.css`:

| Token | Value | Usage |
|---|---|---|
| `--color-brand-bg` | `#fcfcfc` | Page background |
| `--color-brand-ink` | `#1a1a1a` | Primary text |
| `--color-brand-muted` | `#717171` | Secondary text |
| `--font-sans` | Inter | Body text |
| `--font-serif` | Playfair Display | Headings & logo |

---


## 📸 Image Storage

Product images are uploaded to Cloudflare R2 under the `photos/photo/` prefix and served through a custom domain (e.g. `dev.img.terrasse.tkweb.site`). Up to 6 images per product are supported. The primary image is stored in `products.image`; additional images are stored in `product_images`.

To add a new image CDN domain, add it to `next.config.ts` under `images.remotePatterns`.

---

## 🔐 Admin Panel

The admin panel is available at `/admin`. It allows you to:

- View all products with images, names, prices, and categories
- Add a new product with up to 6 photos, YouTube Shorts link, and rich descriptions
- Edit existing products
- Delete products (also removes images from R2)

> ⚠️ The admin panel has no authentication layer — protect it at the infrastructure level (e.g. Cloudflare Access) before deploying to production.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

