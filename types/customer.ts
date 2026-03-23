export type Customer = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
};

export type CustomerAddress = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  address_1: string;
  address_2?: string | null;
  city: string;
  postal_code: string;
  country_code: string;
  province?: string | null;
  phone?: string | null;
  is_default_shipping?: boolean;
  is_default_billing?: boolean;
};

export type CustomerOrder = {
  id: string;
  display_id?: number;
  status?: string;
  payment_status?: string;
  fulfillment_status?: string;
  total?: number;
  subtotal?: number;
  shipping_total?: number;
  currency_code?: string;
  created_at?: string;
};
