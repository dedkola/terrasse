import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'О нас — Terrasse',
    description: 'Наш магазин — это пространство современной и стильной одежды для женщин, которые ценят комфорт, качество и актуальные модные тенденции.',
};

export default function AboutPage() {
    return (
        <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto min-h-screen">
            <div className="mb-16">
                <span className="text-xs uppercase tracking-[0.3em] text-brand-muted mb-4 block">
                    О магазине
                </span>
                <h1 className="text-5xl md:text-6xl font-serif">О нас</h1>
            </div>

            <div className="space-y-8 text-lg leading-relaxed text-brand-ink">
                <p className="text-2xl md:text-3xl font-serif leading-snug text-brand-ink">
                    Наш магазин — это пространство современной и стильной одежды для женщин, которые ценят комфорт, качество и актуальные модные тенденции.
                </p>

                <div className="w-12 h-px bg-brand-muted" />

                <p className="text-brand-muted">
                    Мы тщательно подбираем ассортимент, чтобы каждая вещь была не только красивой, но и удобной для повседневной жизни. В нашей коллекции представлены модели на каждый день, которые легко сочетаются между собой и помогают создавать стильные образы без лишних усилий.
                </p>

                <p className="text-brand-muted">
                    В магазине вы найдете одежду разных размеров, чтобы каждая женщина могла подобрать для себя идеальный вариант.
                </p>

                <p className="text-brand-muted">
                    Мы предлагаем качественные модели по доступной цене от производителей из Италии, Турции и Китая, выбирая только те вещи, которые соответствуют современным стандартам качества и стиля.
                </p>

                <p className="text-brand-muted">
                    Наша команда всегда готова помочь вам подобрать образ, который подчеркнет индивидуальность и будет соответствовать актуальным модным тенденциям.
                </p>

                <p className="text-brand-muted">
                    Мы хотим, чтобы каждая покупка в нашем магазине приносила удовольствие, а одежда радовала вас каждый день.
                </p>
            </div>
        </main>
    );
}
