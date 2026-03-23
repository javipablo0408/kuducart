"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/hooks/use-customer-auth";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/price";

export function CheckoutView() {
  const { cart, checkout } = useCart();
  const { customer, addresses } = useCustomerAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [form, setForm] = useState({
    email: customer?.email ?? "hello@kudu.com",
    firstName: "Julian",
    lastName: "Voss",
    address: "1242 Architectural Way",
    city: "Copenhagen",
    postalCode: "1200",
    countryCode: "DK",
    billingFirstName: "Julian",
    billingLastName: "Voss",
    billingAddress: "1242 Architectural Way",
    billingCity: "Copenhagen",
    billingPostalCode: "1200",
    billingCountryCode: "DK",
  });

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-4 text-sm text-zinc-600">
          There are no products in your cart to complete checkout.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block bg-zinc-900 px-5 py-3 text-xs uppercase tracking-[0.16em] text-white"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-12 lg:grid-cols-[1fr_380px] md:px-10">
      <div className="space-y-8">
        <div>
          <h1 className="text-5xl font-semibold tracking-tight">Checkout</h1>
          <p className="mt-2 text-zinc-600">
            Review your selection and provide shipping details.
          </p>
        </div>

        <div className="space-y-5">
          <h2 className="text-xl font-semibold">Shipping Address</h2>
          {addresses.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                Saved addresses
              </p>
              <select
                value={selectedAddressId}
                onChange={(event) => {
                  const nextId = event.target.value;
                  setSelectedAddressId(nextId);
                  const selected = addresses.find((address) => address.id === nextId);
                  if (!selected) return;
                  setForm((prev) => ({
                    ...prev,
                    email: customer?.email ?? prev.email,
                    firstName: selected.first_name ?? prev.firstName,
                    lastName: selected.last_name ?? prev.lastName,
                    address: selected.address_1 ?? prev.address,
                    city: selected.city ?? prev.city,
                    postalCode: selected.postal_code ?? prev.postalCode,
                    countryCode: (selected.country_code ?? prev.countryCode).toUpperCase(),
                    billingFirstName: selected.first_name ?? prev.billingFirstName,
                    billingLastName: selected.last_name ?? prev.billingLastName,
                    billingAddress: selected.address_1 ?? prev.billingAddress,
                    billingCity: selected.city ?? prev.billingCity,
                    billingPostalCode:
                      selected.postal_code ?? prev.billingPostalCode,
                    billingCountryCode: (
                      selected.country_code ?? prev.billingCountryCode
                    ).toUpperCase(),
                  }));
                }}
                className="h-11 w-full bg-white px-3 outline-none ring-1 ring-zinc-200 focus:ring-zinc-400"
              >
                <option value="">Select a saved address</option>
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.first_name} {address.last_name} - {address.address_1},{" "}
                    {address.city}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              className="h-12 bg-white px-4 outline-none ring-1 ring-zinc-200 focus:ring-zinc-400"
              placeholder="First name"
              value={form.firstName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, firstName: event.target.value }))
              }
            />
            <input
              className="h-12 bg-white px-4 outline-none ring-1 ring-zinc-200 focus:ring-zinc-400"
              placeholder="Last name"
              value={form.lastName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, lastName: event.target.value }))
              }
            />
            <input
              className="h-12 bg-white px-4 outline-none ring-1 ring-zinc-200 focus:ring-zinc-400 md:col-span-2"
              placeholder="Email"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
            />
            <input
              className="h-12 bg-white px-4 outline-none ring-1 ring-zinc-200 focus:ring-zinc-400 md:col-span-2"
              placeholder="Address"
              value={form.address}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, address: event.target.value }))
              }
            />
            <input
              className="h-12 bg-white px-4 outline-none ring-1 ring-zinc-200 focus:ring-zinc-400"
              placeholder="City"
              value={form.city}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, city: event.target.value }))
              }
            />
            <input
              className="h-12 bg-white px-4 outline-none ring-1 ring-zinc-200 focus:ring-zinc-400"
              placeholder="Postal code"
              value={form.postalCode}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, postalCode: event.target.value }))
              }
            />
            <input
              className="h-12 bg-white px-4 outline-none ring-1 ring-zinc-200 focus:ring-zinc-400 md:col-span-2"
              placeholder="Country code (e.g. ES, DK)"
              value={form.countryCode}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  countryCode: event.target.value.toUpperCase(),
                }))
              }
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={billingSameAsShipping}
              onChange={(event) => setBillingSameAsShipping(event.target.checked)}
            />
            Use shipping address as billing address
          </label>
        </div>

        {!billingSameAsShipping ? (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold">Billing Address</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                className="h-12 bg-white px-4 outline-none ring-1 ring-zinc-200 focus:ring-zinc-400"
                placeholder="First name"
                value={form.billingFirstName}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    billingFirstName: event.target.value,
                  }))
                }
              />
              <input
                className="h-12 bg-white px-4 outline-none ring-1 ring-zinc-200 focus:ring-zinc-400"
                placeholder="Last name"
                value={form.billingLastName}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    billingLastName: event.target.value,
                  }))
                }
              />
              <input
                className="h-12 bg-white px-4 outline-none ring-1 ring-zinc-200 focus:ring-zinc-400 md:col-span-2"
                placeholder="Address"
                value={form.billingAddress}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    billingAddress: event.target.value,
                  }))
                }
              />
              <input
                className="h-12 bg-white px-4 outline-none ring-1 ring-zinc-200 focus:ring-zinc-400"
                placeholder="City"
                value={form.billingCity}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    billingCity: event.target.value,
                  }))
                }
              />
              <input
                className="h-12 bg-white px-4 outline-none ring-1 ring-zinc-200 focus:ring-zinc-400"
                placeholder="Postal code"
                value={form.billingPostalCode}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    billingPostalCode: event.target.value,
                  }))
                }
              />
              <input
                className="h-12 bg-white px-4 outline-none ring-1 ring-zinc-200 focus:ring-zinc-400 md:col-span-2"
                placeholder="Country code (e.g. ES, DK)"
                value={form.billingCountryCode}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    billingCountryCode: event.target.value.toUpperCase(),
                  }))
                }
              />
            </div>
          </div>
        ) : null}

        <button
          type="button"
          disabled={isSubmitting}
          onClick={async () => {
            setIsSubmitting(true);
            setMessage(null);
            try {
              const orderId = await checkout({
                ...form,
                billingSameAsShipping,
              });
              if (orderId) {
                router.push(`/checkout/success?order_id=${orderId}`);
              } else {
                setMessage(
                  "Could not complete the order. Check shipping and payment methods in Medusa.",
                );
              }
            } catch {
              setMessage(
                "Checkout failed. Verify region, country, and provider configuration.",
              );
            } finally {
              setIsSubmitting(false);
            }
          }}
          className="h-12 w-full max-w-sm bg-[#596041] text-sm font-medium uppercase tracking-[0.16em] text-white disabled:opacity-70"
        >
          {isSubmitting ? "Processing..." : "Complete Purchase"}
        </button>

        {message ? <p className="text-sm text-zinc-700">{message}</p> : null}
      </div>

      <aside className="h-fit bg-zinc-100 p-6">
        <h2 className="text-3xl font-semibold tracking-tight">Order Summary</h2>
        <div className="mt-5 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-zinc-500">Quantity: {item.quantity}</p>
              </div>
              <p>{formatPrice(item.subtotal ?? item.unit_price ?? null, cart.currency_code)}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 border-t border-zinc-300 pt-4">
          <div className="flex items-center justify-between text-sm text-zinc-700">
            <span>Subtotal</span>
            <span>{formatPrice(cart.subtotal ?? null, cart.currency_code)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(cart.total ?? null, cart.currency_code)}</span>
          </div>
        </div>
      </aside>
    </section>
  );
}
