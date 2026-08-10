export interface Product {
  id: string;
  name: string;
  slug: string; // ← nuevo
  category: string;
  salePrice: number | null;
  rentalPrice: number | null;
  type: 'venta' | 'alquiler' | 'venta-alquiler';
  description: string;
  imageUrl: string;
  stock: number;
}
