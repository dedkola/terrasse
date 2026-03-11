import React from "react";

export default async function TrendArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;

  return (
    <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen">
      <article className="prose lg:prose-xl mx-auto">
        <span className="text-xs uppercase tracking-[0.3em] text-brand-muted mb-4 block">
          Trend Analysis
        </span>
        <h1 className="text-4xl md:text-5xl font-serif mb-8 capitalize">
          {resolvedParams.slug.replace("-", " ")}
        </h1>
        <p className="text-brand-muted leading-relaxed">
          This is a placeholder for the trend article: {resolvedParams.slug}.
          Content will be loaded dynamically based on the slug.
        </p>
      </article>
    </main>
  );
}
