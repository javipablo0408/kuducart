"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  addLineItem,
  attachCartToLoggedCustomer,
  addShippingMethod,
  completeCart,
  createPaymentCollection,
  createPaymentSession,
  createCart,
  getCart,
  getRegionCountryCodes,
  listShippingOptions,
  removeLineItem,
  updateCartDetails,
  updateLineItem,
} from "@/services/medusa";
import { appConfig } from "@/lib/config";
import { getStoredCustomerToken } from "@/services/customer-auth";
import type { Cart } from "@/types/cart";

const CART_STORAGE_KEY = "kudu_cart_id";
const DEFAULT_REGION_ID =
  process.env.NEXT_PUBLIC_MEDUSA_REGION_ID ?? "reg_01";

type CartContextValue = {
  cart: Cart | null;
  isLoading: boolean;
  totalItems: number;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateItem: (lineItemId: string, quantity: number) => Promise<void>;
  removeItem: (lineItemId: string) => Promise<void>;
  checkout: (input: {
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    countryCode: string;
    billingSameAsShipping: boolean;
    billingFirstName?: string;
    billingLastName?: string;
    billingAddress?: string;
    billingCity?: string;
    billingPostalCode?: string;
    billingCountryCode?: string;
  }) => Promise<string | null>;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

async function ensureCart(existingCartId: string | null) {
  if (existingCartId) {
    try {
      return await getCart(existingCartId);
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }

  const newCart = await createCart(DEFAULT_REGION_ID);
  localStorage.setItem(CART_STORAGE_KEY, newCart.id);
  return newCart;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedCartId = localStorage.getItem(CART_STORAGE_KEY);
      const currentCart = await ensureCart(storedCartId);
      setCart(currentCart);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(
    async (variantId: string, quantity = 1) => {
      const storedCartId = localStorage.getItem(CART_STORAGE_KEY);
      const currentCart = await ensureCart(storedCartId);
      const updated = await addLineItem(currentCart.id, variantId, quantity);
      setCart(updated);
    },
    [],
  );

  const updateItem = useCallback(
    async (lineItemId: string, quantity: number) => {
      if (!cart) return;
      const updated = await updateLineItem(cart.id, lineItemId, quantity);
      setCart(updated);
    },
    [cart],
  );

  const removeItem = useCallback(
    async (lineItemId: string) => {
      if (!cart) return;
      const updated = await removeLineItem(cart.id, lineItemId);
      setCart(updated);
    },
    [cart],
  );

  const checkout = useCallback(
    async (input: {
      email: string;
      firstName: string;
      lastName: string;
      address: string;
      city: string;
      postalCode: string;
      countryCode: string;
      billingSameAsShipping: boolean;
      billingFirstName?: string;
      billingLastName?: string;
      billingAddress?: string;
      billingCity?: string;
      billingPostalCode?: string;
      billingCountryCode?: string;
    }) => {
      if (!cart) return null;
      const allowedCountries = await getRegionCountryCodes(
        cart.region_id ?? DEFAULT_REGION_ID,
      );
      const shippingCode = input.countryCode.toUpperCase();
      if (
        allowedCountries.length > 0 &&
        !allowedCountries.includes(shippingCode)
      ) {
        throw new Error(
          `Country ${shippingCode} is not available in the configured region.`,
        );
      }
      if (!input.billingSameAsShipping) {
        const billingCode = (input.billingCountryCode ?? "").toUpperCase();
        if (!billingCode) {
          throw new Error("Billing country is required.");
        }
        if (allowedCountries.length > 0 && !allowedCountries.includes(billingCode)) {
          throw new Error(
            `Billing country ${billingCode} is not available in the configured region.`,
          );
        }
      }

      let updatedCart = cart;
      const customerToken = getStoredCustomerToken();
      if (customerToken) {
        updatedCart = await attachCartToLoggedCustomer(updatedCart.id, customerToken);
      }

      const shippingAddress = {
        first_name: input.firstName,
        last_name: input.lastName,
        address_1: input.address,
        city: input.city,
        postal_code: input.postalCode,
        country_code: shippingCode.toLowerCase(),
      };

      const billingAddress = input.billingSameAsShipping
        ? undefined
        : {
            first_name: input.billingFirstName ?? input.firstName,
            last_name: input.billingLastName ?? input.lastName,
            address_1: input.billingAddress ?? input.address,
            city: input.billingCity ?? input.city,
            postal_code: input.billingPostalCode ?? input.postalCode,
            country_code: (
              input.billingCountryCode ?? input.countryCode
            ).toLowerCase(),
          };

      updatedCart = await updateCartDetails(
        updatedCart.id,
        input.email,
        shippingAddress,
        billingAddress,
      );

      const options = await listShippingOptions(updatedCart.id);
      if (options.length > 0) {
        updatedCart = await addShippingMethod(updatedCart.id, options[0].id);
      }

      setCart(updatedCart);
      const paymentCollectionId = await createPaymentCollection(updatedCart.id);
      try {
        await createPaymentSession(
          paymentCollectionId,
          appConfig.medusaPaymentProviderId,
        );
      } catch {
        if (appConfig.medusaPaymentProviderId !== "pp_system_default") {
          await createPaymentSession(paymentCollectionId, "pp_system_default");
        } else {
          throw new Error("Unable to create payment session");
        }
      }

      const completion = await completeCart(updatedCart.id);

      if (completion.type === "order" && completion.order?.id) {
        localStorage.removeItem(CART_STORAGE_KEY);
        setCart(null);
        return completion.order.id;
      }

      return null;
    },
    [cart],
  );

  const totalItems = useMemo(
    () => cart?.items.reduce((acc, item) => acc + item.quantity, 0) ?? 0,
    [cart],
  );

  const value = useMemo(
    () => ({
      cart,
      isLoading,
      totalItems,
      addItem,
      updateItem,
      removeItem,
      checkout,
      refreshCart,
    }),
    [
      cart,
      isLoading,
      totalItems,
      addItem,
      updateItem,
      removeItem,
      checkout,
      refreshCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
