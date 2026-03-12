import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Контакты — Terrasse',
  description: 'Адрес и информация о магазине Terrasse в Киеве.',
};

export default function ContactsPage() {
  return (
    <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="mb-12">
        <span className="text-xs uppercase tracking-[0.3em] text-brand-muted mb-2 block">
          Поддержка
        </span>
        <h1 className="text-5xl font-serif">Контакты</h1>
      </div>

      <div className="max-w-2xl space-y-8 text-brand-muted leading-relaxed">
        <p>
          Магазин Terrasse находится в городе Киев, в АТБ Маркет Молл «Дарынок», возле кассовой
          зоны. Адрес: ул. Якова Гнездовского, 1А (ранее — ул. Беломорская, 1), Деснянский район.
        </p>

        <p>
          Terrasse — это магазин современной и стильной женской одежды на каждый день. Мы подбираем
          вещи, в которых комфортно, удобно и легко создавать красивые повседневные образы.
        </p>

        <p>
          В нашем ассортименте представлены модели стандартных размеров — до 56 размера. Мы
          предлагаем качественную одежду по доступным ценам. Основные производители — фабрики Китая,
          которые специализируются на модной повседневной одежде.
        </p>

        <p>
          В магазине Terrasse вы всегда можете найти стильные новинки и подобрать вещи, которые
          подчеркнут вашу индивидуальность.
        </p>
      </div>
    </main>
  );
}
