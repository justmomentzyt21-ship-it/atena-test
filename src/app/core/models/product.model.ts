export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  type: 'venta' | 'alquiler' | 'venta-alquiler';
  description: string;
  imageUrl: string;
  stock: number;
  discount: number;
}
