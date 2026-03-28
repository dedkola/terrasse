export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
  youtube_url?: string;
  isNew?: boolean;
  description?: string;
  description_material?: string;
  description_style?: string;
  code?: number;
}
