import { appConfig } from "@/lib/config";
import type { Customer, CustomerAddress, CustomerOrder } from "@/types/customer";

const TOKEN_STORAGE_KEY = "kudu_customer_token";
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

function getBaseHeaders() {
  return {
    "Content-Type": "application/json",
    ...(PUBLISHABLE_KEY ? { "x-publishable-api-key": PUBLISHABLE_KEY } : {}),
  };
}

function storeUrl(path: string) {
  return `${appConfig.medusaUrl}${path}`;
}

type AuthResponse = { token: string };
type CustomerResponse = { customer: Customer };
type OrdersResponse = { orders: CustomerOrder[] };
type AddressesResponse = { addresses: CustomerAddress[] };
type SingleOrderResponse = { order: CustomerOrder };

export function getStoredCustomerToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function clearStoredCustomerToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

function setStoredCustomerToken(token: string) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export async function registerCustomer(input: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}) {
  const authResponse = await fetch(storeUrl("/auth/customer/emailpass/register"), {
    method: "POST",
    headers: getBaseHeaders(),
    body: JSON.stringify({
      email: input.email,
      password: input.password,
    }),
  });

  if (!authResponse.ok) {
    throw new Error("Could not register account.");
  }

  const authData = (await authResponse.json()) as AuthResponse;
  setStoredCustomerToken(authData.token);

  const customerResponse = await fetch(storeUrl("/store/customers"), {
    method: "POST",
    headers: {
      ...getBaseHeaders(),
      Authorization: `Bearer ${authData.token}`,
    },
    body: JSON.stringify({
      email: input.email,
      first_name: input.first_name,
      last_name: input.last_name,
    }),
  });

  if (!customerResponse.ok) {
    clearStoredCustomerToken();
    throw new Error("Account created, but customer profile could not be created.");
  }

  const customerData = (await customerResponse.json()) as CustomerResponse;
  return customerData.customer;
}

export async function loginCustomer(email: string, password: string) {
  const response = await fetch(storeUrl("/auth/customer/emailpass"), {
    method: "POST",
    headers: getBaseHeaders(),
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid credentials.");
  }

  const data = (await response.json()) as AuthResponse;
  setStoredCustomerToken(data.token);
  return data.token;
}

export async function getCustomerMe(token: string) {
  const response = await fetch(storeUrl("/store/customers/me"), {
    method: "GET",
    headers: {
      ...getBaseHeaders(),
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Invalid session.");
  }

  const data = (await response.json()) as CustomerResponse;
  return data.customer;
}

export async function getCustomerOrders(token: string) {
  const response = await fetch(storeUrl("/store/orders"), {
    method: "GET",
    headers: {
      ...getBaseHeaders(),
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not load orders.");
  }

  const data = (await response.json()) as OrdersResponse;
  return data.orders;
}

export async function updateCustomerMe(
  token: string,
  payload: { first_name?: string; last_name?: string; phone?: string },
) {
  const response = await fetch(storeUrl("/store/customers/me"), {
    method: "POST",
    headers: {
      ...getBaseHeaders(),
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Could not update profile.");
  }

  const data = (await response.json()) as CustomerResponse;
  return data.customer;
}

export async function getCustomerAddresses(token: string) {
  const response = await fetch(storeUrl("/store/customers/me/addresses"), {
    method: "GET",
    headers: {
      ...getBaseHeaders(),
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not load addresses.");
  }

  const data = (await response.json()) as AddressesResponse;
  return data.addresses;
}

type AddressPayload = Omit<CustomerAddress, "id">;

export async function createCustomerAddress(token: string, payload: AddressPayload) {
  const response = await fetch(storeUrl("/store/customers/me/addresses"), {
    method: "POST",
    headers: {
      ...getBaseHeaders(),
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Could not create address.");
  }
}

export async function updateCustomerAddress(
  token: string,
  addressId: string,
  payload: Partial<AddressPayload>,
) {
  const response = await fetch(
    storeUrl(`/store/customers/me/addresses/${addressId}`),
    {
      method: "POST",
      headers: {
        ...getBaseHeaders(),
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error("Could not update address.");
  }
}

export async function deleteCustomerAddress(token: string, addressId: string) {
  const response = await fetch(
    storeUrl(`/store/customers/me/addresses/${addressId}`),
    {
      method: "DELETE",
      headers: {
        ...getBaseHeaders(),
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Could not delete address.");
  }
}

export async function getCustomerOrderById(token: string, orderId: string) {
  const response = await fetch(storeUrl(`/store/orders/${orderId}`), {
    method: "GET",
    headers: {
      ...getBaseHeaders(),
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Order not found for this customer.");
  }

  const data = (await response.json()) as SingleOrderResponse;
  return data.order;
}

export async function requestCustomerPasswordReset(identifier: string) {
  const response = await fetch(storeUrl("/auth/customer/emailpass/reset-password"), {
    method: "POST",
    headers: getBaseHeaders(),
    body: JSON.stringify({ identifier, metadata: {} }),
  });

  if (!response.ok) {
    throw new Error("Could not request password reset.");
  }
}

export async function resetCustomerPasswordWithToken(
  token: string,
  newPassword: string,
) {
  const response = await fetch(storeUrl("/auth/customer/emailpass/update"), {
    method: "POST",
    headers: {
      ...getBaseHeaders(),
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password: newPassword }),
  });

  if (!response.ok) {
    throw new Error("Reset token is invalid or expired.");
  }
}

export async function updateCustomerPasswordWithSessionToken(
  customerToken: string,
  newPassword: string,
) {
  const response = await fetch(storeUrl("/auth/customer/emailpass/update"), {
    method: "POST",
    headers: {
      ...getBaseHeaders(),
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({ password: newPassword }),
  });

  if (!response.ok) {
    throw new Error("Could not update password.");
  }
}
