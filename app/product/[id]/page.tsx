import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { formatPrice } from "@/lib/price";
import { getProductById } from "@/services/medusa";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const product = await getProductById(id);
    return {
      title: `${product.title} | Kudu Cart`,
      description:
        product.description ??
        "Curated global products sourced from artisans around the world.",
    };
  } catch {
    return {
      title: "Product not found | Kudu Cart",
    };
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProductById(id).catch(() => null);
  if (!product) {
    notFound();
  }

  return (
    <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-12 md:grid-cols-2 md:gap-14 md:px-10">
      <div className="relative aspect-square overflow-hidden bg-zinc-100">
        {product.image ? (
          <div className="absolute inset-4 md:inset-6">
            <div className="relative h-full w-full">
              <Image
                src={product.image}
                alt={product.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain object-center"
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.16em] text-zinc-500">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
          {product.title}
        </h1>
        <p className="mt-3 text-xl text-zinc-700">
          {formatPrice(product.price, product.currencyCode)}
        </p>
        <p className="mt-8 max-w-xl text-sm leading-7 text-zinc-700">
          {product.description ??
            "A unique artifact of heritage crafted to bring beauty, utility, and global artistry into your home."}
        </p>

        <AddToCartButton variantId={product.variantId} />

        <Link
          href="/"
          className="mt-6 inline-block text-xs uppercase tracking-[0.16em] text-zinc-500"
        >
          Back to products
        </Link>
      </div>
    </section>
  );
}
