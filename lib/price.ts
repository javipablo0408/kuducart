export function formatPrice(amount: number | null, currencyCode = "USD") {
  if (amount == null) return "Price unavailable";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount);
}
