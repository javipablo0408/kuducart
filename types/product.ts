export type Product = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  thumbnail?: string;
  image: string;
  price: number | null;
  currencyCode?: string;
  variantId?: string;
};
