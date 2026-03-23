export type OrderItem = {
  id: string;
  title: string;
  quantity: number;
  unit_price?: number;
  total?: number;
};

export type OrderAddress = {
  first_name?: string | null;
  last_name?: string | null;
  address_1?: string | null;
  address_2?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
  province?: string | null;
  phone?: string | null;
};

export type Order = {
  id: string;
  display_id?: number;
  status?: string;
  payment_status?: string;
  fulfillment_status?: string;
  currency_code: string;
  email?: string;
  total?: number;
  subtotal?: number;
  shipping_total?: number;
  shipping_address?: OrderAddress | null;
  billing_address?: OrderAddress | null;
  items: OrderItem[];
  created_at?: string;
};
