import { appConfig } from "@/lib/config";
import { httpClient } from "@/services/http-client";
import type { Cart } from "@/types/cart";
import type { Order } from "@/types/order";
import type { Product } from "@/types/product";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
const REGION_ID = process.env.NEXT_PUBLIC_MEDUSA_REGION_ID;

function storeUrl(path: string) {
  return `${appConfig.medusaUrl}${path}`;
}

function withRegion(path: string) {
  if (!REGION_ID) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}region_id=${REGION_ID}`;
}

function getHeaders() {
  return {
    ...(PUBLISHABLE_KEY ? { "x-publishable-api-key": PUBLISHABLE_KEY } : {}),
  };
}

type CompleteCartResponse = {
  type: "cart" | "order" | "swap";
  order?: { id: string };
};

type AddressInput = {
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  postal_code: string;
  country_code: string;
};

type ShippingOption = {
  id: string;
  name: string;
  amount?: number;
};

type MedusaMoneyAmount = {
  amount?: number;
  currency_code?: string;
};

type MedusaCalculatedPrice = {
  calculated_amount?: number;
  calculated_amount_with_tax?: number;
  original_amount?: number;
  currency_code?: string;
};

type MedusaVariant = {
  id: string;
  prices?: MedusaMoneyAmount[];
  calculated_price?: MedusaCalculatedPrice;
};

type MedusaShippingOption = {
  id: string;
  name: string;
  amount?: number;
};

type MedusaRegionCountry = {
  iso_2: string;
  display_name?: string;
};

type MedusaRegion = {
  id: string;
  countries?: MedusaRegionCountry[];
};

type MedusaLineItem = {
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

type MedusaCart = {
  id: string;
  region_id?: string;
  currency_code?: string;
  total?: number;
  subtotal?: number;
  items?: MedusaLineItem[];
};

type MedusaCartResponse = { cart: MedusaCart };

type MedusaProduct = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  thumbnail?: string;
  images?: { url?: string }[];
  variants?: MedusaVariant[];
  calculated_price?: MedusaCalculatedPrice;
};

type ProductListApiResponse = { products: MedusaProduct[] };
type ProductApiResponse = { product: MedusaProduct };
type ShippingOptionsResponse = { shipping_options: MedusaShippingOption[] };
type PaymentCollectionResponse = { payment_collection: { id: string } };
type OrderResponse = { order: MedusaOrder };
type RegionsResponse = { regions: MedusaRegion[] };

type MedusaOrderItem = {
  id: string;
  title: string;
  quantity: number;
  unit_price?: number;
  total?: number;
};

type MedusaOrder = {
  id: string;
  display_id?: number;
  status?: string;
  payment_status?: string;
  fulfillment_status?: string;
  currency_code?: string;
  email?: string;
  total?: number;
  subtotal?: number;
  shipping_total?: number;
  created_at?: string;
  items?: MedusaOrderItem[];
  shipping_address?: {
    first_name?: string;
    last_name?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    postal_code?: string;
    country_code?: string;
    province?: string;
    phone?: string;
  } | null;
  billing_address?: {
    first_name?: string;
    last_name?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    postal_code?: string;
    country_code?: string;
    province?: string;
    phone?: string;
  } | null;
};

function normalizeProduct(product: MedusaProduct): Product {
  const firstVariant = product.variants?.[0];
  const variantPrice =
    firstVariant?.calculated_price?.calculated_amount ??
    firstVariant?.calculated_price?.calculated_amount_with_tax ??
    firstVariant?.calculated_price?.original_amount;
  const directPrice =
    product.calculated_price?.calculated_amount ??
    product.calculated_price?.calculated_amount_with_tax ??
    product.calculated_price?.original_amount;
  const fallbackPrice = firstVariant?.prices?.[0]?.amount;
  const currencyFromVariant =
    firstVariant?.prices?.[0]?.currency_code ??
    firstVariant?.calculated_price?.currency_code;

  return {
    id: product.id,
    title: product.title,
    subtitle: product.subtitle,
    description: product.description,
    thumbnail: product.thumbnail,
    image: product.thumbnail ?? product.images?.[0]?.url ?? "",
    price: variantPrice ?? directPrice ?? fallbackPrice ?? null,
    currencyCode: currencyFromVariant,
    variantId: firstVariant?.id,
  };
}

function normalizeCart(cart: MedusaCart): Cart {
  return {
    id: cart.id,
    region_id: cart.region_id,
    currency_code: cart.currency_code ?? "usd",
    total: cart.total,
    subtotal: cart.subtotal,
    items:
      cart.items?.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        product_id: item.product_id,
        variant_id: item.variant_id,
        title: item.title,
        description: item.description,
        thumbnail: item.thumbnail,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      })) ?? [],
  };
}

function normalizeOrder(order: MedusaOrder): Order {
  return {
    id: order.id,
    display_id: order.display_id,
    status: order.status,
    payment_status: order.payment_status,
    fulfillment_status: order.fulfillment_status,
    currency_code: order.currency_code ?? "eur",
    email: order.email,
    total: order.total,
    subtotal: order.subtotal,
    shipping_total: order.shipping_total,
    shipping_address: order.shipping_address ?? null,
    billing_address: order.billing_address ?? null,
    created_at: order.created_at,
    items:
      order.items?.map((item) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
      })) ?? [],
  };
}

export async function getProducts() {
  const data = await httpClient<ProductListApiResponse>(
    storeUrl(withRegion("/store/products")),
    {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    },
  );

  return data.products.map(normalizeProduct);
}

export async function getProductById(productId: string) {
  const data = await httpClient<ProductApiResponse>(
    storeUrl(withRegion(`/store/products/${productId}`)),
    {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    },
  );

  return normalizeProduct(data.product);
}

export async function createCart(regionId: string) {
  const data = await httpClient<MedusaCartResponse>(storeUrl("/store/carts"), {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ region_id: regionId }),
  });

  return normalizeCart(data.cart);
}

export async function getCart(cartId: string) {
  const data = await httpClient<MedusaCartResponse>(storeUrl(`/store/carts/${cartId}`), {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  return normalizeCart(data.cart);
}

export async function addLineItem(
  cartId: string,
  variantId: string,
  quantity = 1,
) {
  const data = await httpClient<MedusaCartResponse>(
    storeUrl(`/store/carts/${cartId}/line-items`),
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ variant_id: variantId, quantity }),
    },
  );

  return normalizeCart(data.cart);
}

export async function updateLineItem(
  cartId: string,
  lineItemId: string,
  quantity: number,
) {
  const data = await httpClient<MedusaCartResponse>(
    storeUrl(`/store/carts/${cartId}/line-items/${lineItemId}`),
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ quantity }),
    },
  );

  return normalizeCart(data.cart);
}

export async function removeLineItem(cartId: string, lineItemId: string) {
  const data = await httpClient<MedusaCartResponse>(
    storeUrl(`/store/carts/${cartId}/line-items/${lineItemId}`),
    {
      method: "DELETE",
      headers: getHeaders(),
    },
  );

  return normalizeCart(data.cart);
}

export async function completeCart(cartId: string) {
  return httpClient<CompleteCartResponse>(storeUrl(`/store/carts/${cartId}/complete`), {
    method: "POST",
    headers: getHeaders(),
  });
}

export async function updateCartDetails(
  cartId: string,
  email: string,
  shippingAddress: AddressInput,
  billingAddress?: AddressInput,
) {
  const data = await httpClient<MedusaCartResponse>(storeUrl(`/store/carts/${cartId}`), {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      email,
      shipping_address: shippingAddress,
      billing_address: billingAddress ?? shippingAddress,
    }),
  });

  return normalizeCart(data.cart);
}

export async function getRegionCountryCodes(regionId: string) {
  if (!regionId) return [];

  const data = await httpClient<RegionsResponse>(
    storeUrl(`/store/regions?id[]=${regionId}`),
    {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    },
  );

  const region = data.regions[0];
  if (!region?.countries?.length) return [];
  return region.countries.map((country) => country.iso_2.toUpperCase());
}

export async function resolveRegionId(preferredCountryCode?: string) {
  if (REGION_ID) return REGION_ID;

  const data = await httpClient<RegionsResponse>(storeUrl("/store/regions"), {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!data.regions.length) return null;

  if (preferredCountryCode) {
    const preferred = preferredCountryCode.toLowerCase();
    const byCountry = data.regions.find((region) =>
      region.countries?.some((country) => country.iso_2.toLowerCase() === preferred),
    );
    if (byCountry?.id) return byCountry.id;
  }

  return data.regions[0]?.id ?? null;
}

export async function listShippingOptions(cartId: string) {
  const data = await httpClient<ShippingOptionsResponse>(
    storeUrl(`/store/shipping-options?cart_id=${cartId}`),
    {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    },
  );

  return data.shipping_options.map((option) => ({
    id: option.id,
    name: option.name,
    amount: option.amount,
  })) satisfies ShippingOption[];
}

export async function addShippingMethod(cartId: string, optionId: string) {
  const data = await httpClient<MedusaCartResponse>(
    storeUrl(`/store/carts/${cartId}/shipping-methods`),
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ option_id: optionId }),
    },
  );

  return normalizeCart(data.cart);
}

export async function attachCartToLoggedCustomer(cartId: string, token: string) {
  const data = await httpClient<MedusaCartResponse>(
    storeUrl(`/store/carts/${cartId}/customer`),
    {
      method: "POST",
      headers: {
        ...getHeaders(),
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    },
  );

  return normalizeCart(data.cart);
}

export async function createPaymentCollection(cartId: string) {
  const data = await httpClient<PaymentCollectionResponse>(
    storeUrl("/store/payment-collections"),
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ cart_id: cartId }),
    },
  );

  return data.payment_collection.id;
}

export async function createPaymentSession(
  paymentCollectionId: string,
  providerId: string,
) {
  return httpClient<PaymentCollectionResponse>(
    storeUrl(`/store/payment-collections/${paymentCollectionId}/payment-sessions`),
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ provider_id: providerId }),
    },
  );
}

export async function getOrderById(orderId: string) {
  const data = await httpClient<OrderResponse>(storeUrl(`/store/orders/${orderId}`), {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  return normalizeOrder(data.order);
}
