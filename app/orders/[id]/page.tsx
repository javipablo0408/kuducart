"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCustomerAuth } from "@/hooks/use-customer-auth";
import { formatPrice } from "@/lib/price";
import { getCustomerOrderById, getStoredCustomerToken } from "@/services/customer-auth";
import type { CustomerOrder } from "@/types/customer";

type ExtendedOrder = CustomerOrder & {
  items?: { id: string; title: string; quantity: number; unit_price?: number; total?: number }[];
  shipping_address?: {
    first_name?: string;
    last_name?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    postal_code?: string;
    country_code?: string;
    phone?: string;
  } | null;
  billing_address?: {
    first_name?: string;
    last_name?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    postal_code?: string;
    country_code?: string;
    phone?: string;
  } | null;
  email?: string;
};

function statusBadge(label: string | undefined) {
  const value = (label ?? "pending").toLowerCase();
  const isPositive =
    value.includes("paid") || value.includes("captured") || value.includes("fulfilled");
  const classes = isPositive
    ? "bg-emerald-100 text-emerald-800"
    : "bg-amber-100 text-amber-800";
  return (
    <span className={`rounded px-2 py-1 text-[11px] uppercase tracking-[0.12em] ${classes}`}>
      {label ?? "pending"}
    </span>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useCustomerAuth();
  const [order, setOrder] = useState<ExtendedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/account/login");
      return;
    }
    const token = getStoredCustomerToken();
    if (!token || !id) {
      router.replace("/account/login");
      return;
    }
    void (async () => {
      try {
        const data = (await getCustomerOrderById(token, id)) as ExtendedOrder;
        setOrder(data);
      } catch {
        setError("Order not found for your account.");
      }
    })();
  }, [id, isAuthenticated, isLoading, router]);

  if (isLoading || (!order && !error)) {
    return <p className="px-6 py-12 text-sm text-zinc-600">Loading order...</p>;
  }

  if (error || !order) {
    return (
      <section className="mx-auto w-full max-w-3xl px-6 py-12 md:px-10">
        <h1 className="text-3xl font-semibold tracking-tight">Order</h1>
        <p className="mt-3 text-sm text-zinc-700">{error ?? "Order not found."}</p>
        <Link
          href="/account"
          className="mt-5 inline-flex h-10 items-center justify-center bg-zinc-900 px-4 text-xs uppercase tracking-[0.16em] text-white"
        >
          Back to account
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-12 md:px-10">
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">Order details</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-900">
          Order #{order.display_id ?? order.id}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {statusBadge(order.status)}
          {statusBadge(order.payment_status)}
          {statusBadge(order.fulfillment_status)}
        </div>
        <p className="mt-2 text-sm text-zinc-600">
          Date: {order.created_at ? new Date(order.created_at).toLocaleString() : "Not available"}
        </p>
        <p className="mt-1 text-sm text-zinc-600">Customer email: {order.email ?? "Not available"}</p>
      </div>

      <div className="space-y-4">
        {(order.items ?? []).map((item) => (
          <article key={item.id} className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-zinc-600">Quantity: {item.quantity}</p>
              <p className="text-sm text-zinc-600">
                Unit: {formatPrice(item.unit_price ?? null, order.currency_code ?? "EUR")}
              </p>
            </div>
            <p className="text-sm">
              {formatPrice(item.total ?? item.unit_price ?? null, order.currency_code ?? "EUR")}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-8 max-w-sm space-y-2 border-t border-zinc-200 pt-5 text-sm">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span>{formatPrice(order.subtotal ?? null, order.currency_code ?? "EUR")}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Shipping</span>
          <span>{formatPrice(order.shipping_total ?? null, order.currency_code ?? "EUR")}</span>
        </div>
        <div className="flex items-center justify-between text-base font-semibold">
          <span>Total</span>
          <span>{formatPrice(order.total ?? null, order.currency_code ?? "EUR")}</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="border border-zinc-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Shipping address</p>
          {order.shipping_address ? (
            <div className="mt-2 space-y-1 text-sm text-zinc-700">
              <p>
                {order.shipping_address.first_name} {order.shipping_address.last_name}
              </p>
              <p>{order.shipping_address.address_1}</p>
              {order.shipping_address.address_2 ? <p>{order.shipping_address.address_2}</p> : null}
              <p>
                {order.shipping_address.postal_code} {order.shipping_address.city}
              </p>
              <p>{order.shipping_address.country_code?.toUpperCase()}</p>
              {order.shipping_address.phone ? <p>{order.shipping_address.phone}</p> : null}
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-600">Not available</p>
          )}
        </div>

        <div className="border border-zinc-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Billing address</p>
          {order.billing_address ? (
            <div className="mt-2 space-y-1 text-sm text-zinc-700">
              <p>
                {order.billing_address.first_name} {order.billing_address.last_name}
              </p>
              <p>{order.billing_address.address_1}</p>
              {order.billing_address.address_2 ? <p>{order.billing_address.address_2}</p> : null}
              <p>
                {order.billing_address.postal_code} {order.billing_address.city}
              </p>
              <p>{order.billing_address.country_code?.toUpperCase()}</p>
              {order.billing_address.phone ? <p>{order.billing_address.phone}</p> : null}
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-600">Not available</p>
          )}
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Link
          href="/account"
          className="inline-flex h-11 items-center justify-center bg-zinc-900 px-5 text-xs uppercase tracking-[0.16em] text-white"
        >
          Back to account
        </Link>
      </div>
    </section>
  );
}
