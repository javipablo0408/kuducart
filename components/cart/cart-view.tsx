"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/price";
import { useCart } from "@/hooks/use-cart";

export function CartView() {
  const { cart, isLoading, updateItem, removeItem } = useCart();

  if (isLoading) {
    return <p className="text-sm text-zinc-600">Loading cart...</p>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">Your Cart</h1>
        <p className="text-sm text-zinc-600">Your cart is empty.</p>
        <Link
          href="/"
          className="inline-block bg-zinc-900 px-5 py-3 text-xs uppercase tracking-[0.16em] text-white"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Your Cart</h1>
          <p className="mt-2 text-sm text-zinc-600">Curated globally, reserved for you.</p>
        </div>

        {cart.items.map((item) => (
          <article key={item.id} className="grid grid-cols-[96px_1fr] gap-4 border-b border-zinc-200 pb-6">
            <div className="relative h-24 w-24 overflow-hidden bg-zinc-200">
              {item.thumbnail ? (
                <Image
                  src={item.thumbnail}
                  alt={item.title ?? "Product image"}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-lg font-medium">{item.title}</p>
              <p className="text-sm text-zinc-700">
                {formatPrice(item.unit_price ?? null, cart.currency_code)}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void updateItem(item.id, Math.max(1, item.quantity - 1))}
                  className="h-8 w-8 border border-zinc-300 text-lg leading-none"
                >
                  -
                </button>
                <span className="w-6 text-center text-sm">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => void updateItem(item.id, item.quantity + 1)}
                  className="h-8 w-8 border border-zinc-300 text-lg leading-none"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => void removeItem(item.id)}
                  className="ml-2 text-xs uppercase tracking-[0.14em] text-zinc-500 underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <aside className="h-fit bg-zinc-100 p-6">
        <h2 className="text-3xl font-semibold tracking-tight">Order Summary</h2>
        <div className="mt-6 space-y-3 text-sm text-zinc-700">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(cart.subtotal ?? null, cart.currency_code)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-zinc-300 pt-3 text-base font-semibold text-zinc-900">
            <span>Total</span>
            <span>{formatPrice(cart.total ?? null, cart.currency_code)}</span>
          </div>
        </div>
        <Link
          href="/checkout"
          className="mt-6 flex h-12 w-full items-center justify-center bg-[#596041] text-sm font-medium uppercase tracking-[0.16em] text-white"
        >
          Proceed to Checkout
        </Link>
      </aside>
    </div>
  );
}
