export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  isNew?: boolean;
  description?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Классический черный лонгслив',
    price: 89,
    category: 'Топы',
    image: 'https://dev.img.terrasse.tkweb.site/photos/photo/WhatsApp%20Image%202026-03-06%20at%2019.20.36.jpeg',
    isNew: true,
    description: 'Универсальный черный лонгслив, изготовленный из премиального органического хлопка. Отличается приталенным кроем и усиленными швами для долговечности.'
  },
  {
    id: '2',
    name: 'Широкие джинсы',
    price: 145,
    category: 'Деним',
    image: 'https://dev.img.terrasse.tkweb.site/photos/photo/WhatsApp%20Image%202026-03-06%20at%2019.21.06.jpeg',
    description: 'Свободные широкие джинсы в винтажной стирке. Изготовлены из 100% переработанного денима с высокой талией.'
  },
  {
    id: '3',
    name: 'Футболка с графичной вышивкой',
    price: 65,
    category: 'Топы',
    image: 'https://dev.img.terrasse.tkweb.site/photos/photo/WhatsApp%20Image%202026-03-06%20at%2019.31.21.jpeg',
    description: 'Мягкая хлопковая футболка с ручной графичной вышивкой. Идеальная акцентная вещь для повседневной носки.'
  },
  {
    id: '4',
    name: 'Серый меланжевый свитер',
    price: 120,
    category: 'Трикотаж',
    image: 'https://dev.img.terrasse.tkweb.site/photos/photo/WhatsApp%20Image%202026-03-06%20at%2019.57.26.jpeg',
    description: 'Легкий меланжевый вязаный свитер. Дышащий, но теплый, идеально подходит для многослойных образов в межсезонье.'
  },
  {
    id: '5',
    name: 'Стеганая зимняя парка',
    price: 295,
    category: 'Верхняя одежда',
    image: 'https://dev.img.terrasse.tkweb.site/photos/photo/WhatsApp%20Image%202026-03-06%20at%2019.57.40.jpeg',
    description: 'Водоотталкивающая стеганая парка с утеплителем из переработанного пуха. Создана, чтобы выдерживать самые суровые зимние условия.'
  },
  {
    id: '6',
    name: 'Структурированный блейзер',
    price: 210,
    category: 'Верхняя одежда',
    image: 'https://dev.img.terrasse.tkweb.site/photos/photo/WhatsApp%20Image%202026-03-06%20at%2019.58.05%20(1).jpeg',
    description: 'Современный структурированный блейзер с четким силуэтом. Имеет внутренние карманы и гладкую шелковую подкладку.'
  },
  {
    id: '7',
    name: 'Классические прямые джинсы',
    price: 130,
    category: 'Деним',
    image: 'https://dev.img.terrasse.tkweb.site/photos/photo/WhatsApp%20Image%202026-03-06%20at%2019.21.06.jpeg',
    description: 'Базовые прямые джинсы из плотного денима. Идеальная посадка и классический синий цвет.'
  },
  {
    id: '8',
    name: 'Светлые джинсы mom-fit',
    price: 125,
    category: 'Деним',
    image: 'https://dev.img.terrasse.tkweb.site/photos/photo/WhatsApp%20Image%202026-03-06%20at%2019.21.06.jpeg',
    description: 'Комфортные джинсы силуэта mom в светлом оттенке с легкими потертостями.'
  },
  {
    id: '9',
    name: 'Черные зауженные джинсы',
    price: 110,
    category: 'Деним',
    image: 'https://dev.img.terrasse.tkweb.site/photos/photo/WhatsApp%20Image%202026-03-06%20at%2019.21.06.jpeg',
    description: 'Эластичные зауженные джинсы черного цвета. Универсальная модель на каждый день.'
  }
];
