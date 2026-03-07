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
    name: 'Classic Black Longsleeve',
    price: 89,
    category: 'Tops',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800',
    isNew: true,
    description: 'A versatile black longsleeve crafted from premium organic cotton. Features a tailored fit and reinforced seams for lasting durability.'
  },
  {
    id: '2',
    name: 'Wide Leg Denim',
    price: 145,
    category: 'Bottoms',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800',
    description: 'Relaxed wide-leg jeans in a vintage wash. Made from 100% recycled denim with a high-waisted silhouette.'
  },
  {
    id: '3',
    name: 'Embroidered Graphic Tee',
    price: 65,
    category: 'Tops',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
    description: 'Soft cotton tee featuring a hand-embroidered graphic. A perfect statement piece for casual everyday wear.'
  },
  {
    id: '4',
    name: 'Grey Melange Knit',
    price: 120,
    category: 'Knitwear',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=800',
    description: 'Lightweight melange knit sweater. Breathable yet warm, ideal for layering during transitional seasons.'
  },
  {
    id: '5',
    name: 'Quilted Winter Parka',
    price: 295,
    category: 'Outerwear',
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&q=80&w=800',
    description: 'Water-resistant quilted parka with recycled down insulation. Designed to withstand the harshest winter conditions.'
  },
  {
    id: '6',
    name: 'Structured Blazer',
    price: 210,
    category: 'Outerwear',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800',
    description: 'Modern structured blazer with a sharp silhouette. Features internal pockets and a smooth silk lining.'
  }
];
