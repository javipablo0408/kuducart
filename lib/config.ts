export const appConfig = {
  medusaUrl:
    process.env.NEXT_PUBLIC_MEDUSA_URL ??
    process.env.MEDUSA_BACKEND_URL ??
    "http://localhost:9000",
  medusaPaymentProviderId:
    process.env.NEXT_PUBLIC_MEDUSA_PAYMENT_PROVIDER_ID ?? "pp_system_default",
  defaultRegionCode: process.env.NEXT_PUBLIC_DEFAULT_REGION ?? "us",
};
