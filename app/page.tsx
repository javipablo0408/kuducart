import { Hero } from "@/components/home/hero";
import { ProductGrid } from "@/components/product/product-grid";
import { getProducts } from "@/services/medusa";

export default async function Home() {
  const products = await getProducts();

  return (
    <div>
      <Hero />
      <div
        aria-hidden="true"
        className="h-28 bg-gradient-to-b from-[var(--kudu-hero)] via-[#e9decd]/45 to-[var(--background)]"
      />
      <section className="mx-auto w-full max-w-4xl px-6 py-12 text-center md:px-10">
        <p className="text-base leading-7 text-zinc-700">
          We bring you products sourced from across the world-delivered right to
          your door.
        </p>
        <p className="mt-4 text-base leading-7 text-zinc-700">
          We partner with makers and suppliers worldwide to ensure authenticity,
          quality, and fair value.
        </p>
        <p className="mt-4 text-base font-medium leading-7 text-zinc-900">
          Shop global. Experience local convenience.
        </p>
      </section>
      <section className="mx-auto w-full max-w-7xl px-6 py-14 md:px-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              The monthly curation
            </p>
            <h2 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-900">
              New Arrivals
            </h2>
          </div>
        </div>
        <div className="mt-8">
          <ProductGrid products={products} />
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-6 tracking-wide text-zinc-700">
          Help us bring the worldwide products you want to South Africa.
        </p>
        <form className="mx-auto mt-6 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="Leave your email"
            className="h-11 flex-1 bg-white px-4 text-sm outline-none ring-1 ring-zinc-300 focus:ring-zinc-500"
            required
          />
          <button
            type="submit"
            className="h-11 bg-zinc-900 px-5 text-xs font-medium uppercase tracking-[0.16em] text-white"
          >
            Notify me
          </button>
        </form>
      </section>
    </div>
  );
}
