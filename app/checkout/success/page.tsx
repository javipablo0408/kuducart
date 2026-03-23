import Link from "next/link";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{
    order_id?: string;
  }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const { order_id } = await searchParams;

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16 md:px-10">
      <div className="bg-white p-8 ring-1 ring-zinc-200">
        <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
          Order Confirmed
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-900">
          Thanks for your purchase.
        </h1>
        <p className="mt-4 text-sm leading-7 text-zinc-700">
          Your order was created successfully in Medusa and is now registered for
          processing.
        </p>
        {order_id ? (
          <p className="mt-4 text-sm text-zinc-700">
            Order ID: <span className="font-medium">{order_id}</span>
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          {order_id ? (
            <Link
              href={`/orders/${order_id}`}
              className="inline-flex h-11 items-center justify-center bg-[#596041] px-5 text-xs uppercase tracking-[0.16em] text-white"
            >
              View order
            </Link>
          ) : null}
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center bg-zinc-900 px-5 text-xs uppercase tracking-[0.16em] text-white"
          >
            Continue shopping
          </Link>
          <Link
            href="/cart"
            className="inline-flex h-11 items-center justify-center border border-zinc-300 px-5 text-xs uppercase tracking-[0.16em] text-zinc-800"
          >
            View cart
          </Link>
        </div>
      </div>
    </section>
  );
}
