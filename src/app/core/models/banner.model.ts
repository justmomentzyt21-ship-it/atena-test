export interface Banner {
  order: number;
  name: string;
  imageUrl: string;
  imageMobileUrl: string;
  screen: 'Ventas' | 'Alquiler' | 'Ambos';
}
