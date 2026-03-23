export const appConfig = {
  medusaUrl:
    process.env.NEXT_PUBLIC_MEDUSA_URL ?? "http://localhost:9000",
  medusaPaymentProviderId:
    process.env.NEXT_PUBLIC_MEDUSA_PAYMENT_PROVIDER_ID ?? "pp_system_default",
};
