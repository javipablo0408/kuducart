"use client";

import { useState } from "react";
import { useCart } from "@/hooks/use-cart";

type AddToCartButtonProps = {
  variantId?: string;
};

export function AddToCartButton({ variantId }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  return (
    <button
      type="button"
      disabled={!variantId || isAdding}
      onClick={async () => {
        if (!variantId) return;
        setIsAdding(true);
        try {
          await addItem(variantId, 1);
        } finally {
          setIsAdding(false);
        }
      }}
      className="mt-10 h-12 w-full max-w-sm bg-zinc-900 text-sm font-medium uppercase tracking-[0.16em] text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
    >
      {isAdding ? "Adding..." : "Add to Cart"}
    </button>
  );
}
