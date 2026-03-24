import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/price";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-zinc-100">
          {product.image ? (
            <div className="absolute inset-3">
              <div className="relative h-full w-full">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-contain object-center transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.15em] text-zinc-500">
              No image
            </div>
          )}
        </div>
      </Link>

      <div className="mt-3 space-y-1">
        <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
          Curated Collection
        </p>
        <Link href={`/product/${product.id}`} className="block text-lg font-medium">
          {product.title}
        </Link>
        <p className="text-sm text-zinc-700">
          {formatPrice(product.price, product.currencyCode)}
        </p>
      </div>
    </article>
  );
}
