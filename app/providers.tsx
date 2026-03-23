"use client";

import type { ReactNode } from "react";
import { CustomerAuthProvider } from "@/hooks/use-customer-auth";
import { CartProvider } from "@/hooks/use-cart";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CustomerAuthProvider>
      <CartProvider>{children}</CartProvider>
    </CustomerAuthProvider>
  );
}
