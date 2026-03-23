"use client";

import Link from "next/link";
import { useCustomerAuth } from "@/hooks/use-customer-auth";
import { useCart } from "@/hooks/use-cart";

function CartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M3 4h2l2.2 10.2a1.8 1.8 0 0 0 1.8 1.4H18a1.8 1.8 0 0 0 1.8-1.3L22 7H7" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="3.3" />
      <path d="M6 20a6 6 0 0 1 12 0" />
    </svg>
  );
}

export function Navbar() {
  const { totalItems } = useCart();
  const { isAuthenticated } = useCustomerAuth();

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 md:px-10">
        <Link href="/" className="kudu-logo">
          KUDU CART
        </Link>
        <nav className="flex items-center gap-5 text-zinc-800">
          <Link href="/cart" aria-label="Carrito" className="relative">
            <CartIcon />
            {totalItems > 0 ? (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] text-white">
                {totalItems}
              </span>
            ) : null}
          </Link>
          <Link
            href={isAuthenticated ? "/account" : "/account/login"}
            aria-label="Cuenta"
          >
            <AccountIcon />
          </Link>
        </nav>
      </div>
    </header>
  );
}
