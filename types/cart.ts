export type CartItem = {
  id: string;
  quantity: number;
  product_id?: string;
  variant_id?: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  unit_price?: number;
  subtotal?: number;
};

export type Cart = {
  id: string;
  region_id?: string;
  currency_code: string;
  total?: number;
  subtotal?: number;
  items: CartItem[];
};
