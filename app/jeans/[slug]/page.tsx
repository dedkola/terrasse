import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Product } from "@/types";
import { d1Query } from "@/lib/d1";
import ProductDetail from "@/components/ProductDetail";

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

async function getProductBySlug(slug: string): Promise<Product | null> {
  const result = await d1Query<ProductRow>(
    "SELECT * FROM products WHERE slug = ? OR id = ? LIMIT 1",
    [slug, slug],
  );
  if (!result.results.length) return null;
  const p = result.results[0];

  const imagesResult = await d1Query<{ url: string }>(
    "SELECT url FROM product_images WHERE product_id = ? ORDER BY position ASC",
    [p.id],
  );
  const images = imagesResult.results.map((r) => r.url);

  return {
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
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return {};

  return {
    title: `${product.name} — Terrasse`,
    description: product.description
      ? product.description.slice(0, 160)
      : `${product.name} із колекції Terrasse. Ціна: ${product.price} ₴.`,
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      images: product.image ? [{ url: product.image }] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <ProductDetail product={product} />
    </main>
  );
}
