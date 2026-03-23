"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCustomerAuth } from "@/hooks/use-customer-auth";
import { formatPrice } from "@/lib/price";
import {
  getStoredCustomerToken,
  updateCustomerPasswordWithSessionToken,
} from "@/services/customer-auth";

export function CustomerPortal() {
  const getStatusClassName = (status: string | undefined) => {
    const value = (status ?? "pending").toLowerCase();
    const positive =
      value.includes("paid") || value.includes("captured") || value.includes("fulfilled");
    return positive ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800";
  };

  const router = useRouter();
  const {
    customer,
    orders,
    addresses,
    isLoading,
    isAuthenticated,
    logout,
    updateProfile,
    addAddress,
    editAddress,
    removeAddress,
  } = useCustomerAuth();
  const [profileForm, setProfileForm] = useState({
    first_name: customer?.first_name ?? "",
    last_name: customer?.last_name ?? "",
    phone: customer?.phone ?? "",
  });
  const [addressForm, setAddressForm] = useState({
    first_name: customer?.first_name ?? "",
    last_name: customer?.last_name ?? "",
    address_1: "",
    address_2: "",
    city: "",
    postal_code: "",
    country_code: "DK",
    province: "",
    phone: "",
    is_default_shipping: false,
    is_default_billing: false,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/account/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <p className="px-6 py-12 text-sm text-zinc-600">Loading account...</p>;
  }

  if (!isAuthenticated || !customer) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-12 md:px-10">
      <div className="mb-8 flex items-start justify-between gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
            Customer Portal
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-900">
            Welcome back, {customer.first_name ?? "Collector"}
          </h1>
          <p className="mt-2 text-sm text-zinc-700">{customer.email}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="h-10 border border-zinc-300 px-4 text-xs uppercase tracking-[0.16em]"
        >
          Logout
        </button>
      </div>

      {message ? <p className="mb-6 text-sm text-zinc-700">{message}</p> : null}

      <div className="mb-10 bg-white p-6 ring-1 ring-zinc-200">
        <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            value={profileForm.first_name}
            onChange={(event) =>
              setProfileForm((prev) => ({ ...prev, first_name: event.target.value }))
            }
            placeholder="First name"
            className="h-11 bg-zinc-50 px-3 ring-1 ring-zinc-200 outline-none focus:ring-zinc-400"
          />
          <input
            value={profileForm.last_name}
            onChange={(event) =>
              setProfileForm((prev) => ({ ...prev, last_name: event.target.value }))
            }
            placeholder="Last name"
            className="h-11 bg-zinc-50 px-3 ring-1 ring-zinc-200 outline-none focus:ring-zinc-400"
          />
          <input
            value={profileForm.phone}
            onChange={(event) =>
              setProfileForm((prev) => ({ ...prev, phone: event.target.value }))
            }
            placeholder="Phone"
            className="h-11 bg-zinc-50 px-3 ring-1 ring-zinc-200 outline-none focus:ring-zinc-400 md:col-span-2"
          />
        </div>
        <button
          type="button"
          onClick={async () => {
            try {
              await updateProfile(profileForm);
              setMessage("Profile updated successfully.");
            } catch (err) {
              setMessage(
                err instanceof Error ? err.message : "Could not update profile.",
              );
            }
          }}
          className="mt-4 h-10 bg-zinc-900 px-4 text-xs uppercase tracking-[0.16em] text-white"
        >
          Save profile
        </button>
      </div>

      <div className="mb-10 bg-white p-6 ring-1 ring-zinc-200">
        <h2 className="text-2xl font-semibold tracking-tight">Security</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Change your account password.
        </p>
        <div className="mt-4 max-w-md">
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="New password"
            className="h-11 w-full bg-zinc-50 px-3 ring-1 ring-zinc-200 outline-none focus:ring-zinc-400"
          />
        </div>
        <button
          type="button"
          onClick={async () => {
            try {
              const token = getStoredCustomerToken();
              if (!token) throw new Error("No active session.");
              await updateCustomerPasswordWithSessionToken(token, newPassword);
              setNewPassword("");
              setMessage("Password updated successfully.");
            } catch (err) {
              setMessage(
                err instanceof Error
                  ? err.message
                  : "Could not update password.",
              );
            }
          }}
          className="mt-4 h-10 bg-zinc-900 px-4 text-xs uppercase tracking-[0.16em] text-white"
        >
          Update password
        </button>
      </div>

      <div className="mb-10 bg-white p-6 ring-1 ring-zinc-200">
        <h2 className="text-2xl font-semibold tracking-tight">Addresses</h2>
        <div className="mt-4 space-y-3">
          {addresses.length === 0 ? (
            <p className="text-sm text-zinc-600">No saved addresses yet.</p>
          ) : (
            addresses.map((address) => (
              <div
                key={address.id}
                className="flex items-start justify-between border border-zinc-200 p-3"
              >
                <div className="text-sm">
                  <p className="font-medium">
                    {address.first_name} {address.last_name}
                  </p>
                  <p>{address.address_1}</p>
                  <p>
                    {address.postal_code} {address.city} - {address.country_code}
                  </p>
                  <div className="mt-1 flex gap-1">
                    {address.is_default_shipping ? (
                      <span className="rounded bg-zinc-200 px-2 py-1 text-[10px] uppercase tracking-[0.12em]">
                        Default shipping
                      </span>
                    ) : null}
                    {address.is_default_billing ? (
                      <span className="rounded bg-zinc-200 px-2 py-1 text-[10px] uppercase tracking-[0.12em]">
                        Default billing
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAddressId(address.id);
                      setAddressForm({
                        first_name: address.first_name ?? "",
                        last_name: address.last_name ?? "",
                        address_1: address.address_1 ?? "",
                        address_2: address.address_2 ?? "",
                        city: address.city ?? "",
                        postal_code: address.postal_code ?? "",
                        country_code: (address.country_code ?? "DK").toUpperCase(),
                        province: address.province ?? "",
                        phone: address.phone ?? "",
                        is_default_shipping: address.is_default_shipping ?? false,
                        is_default_billing: address.is_default_billing ?? false,
                      });
                      setMessage("Editing selected address.");
                    }}
                    className="text-xs uppercase tracking-[0.14em] text-zinc-600 underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await removeAddress(address.id);
                        setMessage("Address deleted.");
                      } catch (err) {
                        setMessage(
                          err instanceof Error ? err.message : "Could not delete address.",
                        );
                      }
                    }}
                    className="text-xs uppercase tracking-[0.14em] text-zinc-600 underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <h3 className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-600">
          {editingAddressId ? "Edit address" : "Add address"}
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            value={addressForm.first_name}
            onChange={(event) =>
              setAddressForm((prev) => ({ ...prev, first_name: event.target.value }))
            }
            placeholder="First name"
            className="h-11 bg-zinc-50 px-3 ring-1 ring-zinc-200 outline-none focus:ring-zinc-400"
          />
          <input
            value={addressForm.last_name}
            onChange={(event) =>
              setAddressForm((prev) => ({ ...prev, last_name: event.target.value }))
            }
            placeholder="Last name"
            className="h-11 bg-zinc-50 px-3 ring-1 ring-zinc-200 outline-none focus:ring-zinc-400"
          />
          <input
            value={addressForm.address_1}
            onChange={(event) =>
              setAddressForm((prev) => ({ ...prev, address_1: event.target.value }))
            }
            placeholder="Address line 1"
            className="h-11 bg-zinc-50 px-3 ring-1 ring-zinc-200 outline-none focus:ring-zinc-400 md:col-span-2"
          />
          <input
            value={addressForm.city}
            onChange={(event) =>
              setAddressForm((prev) => ({ ...prev, city: event.target.value }))
            }
            placeholder="City"
            className="h-11 bg-zinc-50 px-3 ring-1 ring-zinc-200 outline-none focus:ring-zinc-400"
          />
          <input
            value={addressForm.postal_code}
            onChange={(event) =>
              setAddressForm((prev) => ({ ...prev, postal_code: event.target.value }))
            }
            placeholder="Postal code"
            className="h-11 bg-zinc-50 px-3 ring-1 ring-zinc-200 outline-none focus:ring-zinc-400"
          />
          <input
            value={addressForm.country_code}
            onChange={(event) =>
              setAddressForm((prev) => ({
                ...prev,
                country_code: event.target.value.toUpperCase(),
              }))
            }
            placeholder="Country code (e.g. ES, DK)"
            className="h-11 bg-zinc-50 px-3 ring-1 ring-zinc-200 outline-none focus:ring-zinc-400"
          />
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={Boolean(addressForm.is_default_shipping)}
              onChange={(event) =>
                setAddressForm((prev) => ({
                  ...prev,
                  is_default_shipping: event.target.checked,
                }))
              }
            />
            Default shipping
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={Boolean(addressForm.is_default_billing)}
              onChange={(event) =>
                setAddressForm((prev) => ({
                  ...prev,
                  is_default_billing: event.target.checked,
                }))
              }
            />
            Default billing
          </label>
        </div>
        <button
          type="button"
          onClick={async () => {
            try {
              if (editingAddressId) {
                await editAddress(editingAddressId, addressForm);
              } else {
                await addAddress(addressForm);
              }
              setAddressForm((prev) => ({
                ...prev,
                address_1: "",
                address_2: "",
                city: "",
                postal_code: "",
              }));
              setEditingAddressId(null);
              setMessage(
                editingAddressId
                  ? "Address updated successfully."
                  : "Address added successfully.",
              );
            } catch (err) {
              setMessage(err instanceof Error ? err.message : "Could not save address.");
            }
          }}
          className="mt-4 h-10 bg-zinc-900 px-4 text-xs uppercase tracking-[0.16em] text-white"
        >
          {editingAddressId ? "Update address" : "Save address"}
        </button>
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight">Your Orders</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-zinc-600">You do not have any orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between border border-zinc-200 bg-white px-4 py-3"
              >
                <div>
                  <p className="font-medium">
                    Order #{order.display_id ?? order.id.slice(-8)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString()
                      : "No date"}
                  </p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <span
                              className={`rounded px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${getStatusClassName(order.status)}`}
                            >
                              {order.status ?? "pending"}
                            </span>
                            <span
                              className={`rounded px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${getStatusClassName(order.payment_status)}`}
                            >
                              {order.payment_status ?? "unpaid"}
                            </span>
                            <span
                              className={`rounded px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${getStatusClassName(order.fulfillment_status)}`}
                            >
                              {order.fulfillment_status ?? "not fulfilled"}
                            </span>
                          </div>
                </div>
                <p className="text-sm">
                  {formatPrice(order.total ?? null, order.currency_code ?? "EUR")}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
