import { Platform } from "react-native";

/**
 * Stripe payment configuration for the Pro paywall and course store.
 *
 * The mobile app never holds the Stripe secret key: the backend creates a
 * PaymentIntent (pricing it from the course object) and returns its client
 * secret, which the native `@stripe/stripe-react-native` SDK uses to open the
 * PaymentSheet (card + Google Pay). The publishable key is fetched from the
 * backend as well (`GET /Stripe/Plan`), with the env value as a fallback.
 */

/**
 * Publishable key (pk_...) used to initialize the native Stripe SDK. This is a
 * public key and is safe to ship in the app; set it in `.env` as
 * `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`. When the backend returns a key from
 * `/Stripe/Plan` that one takes precedence.
 */
export const STRIPE_PUBLISHABLE_KEY ="pk_live_51USZYi7kdKcBFKmJO0MCtXBrrT5l9HMpYEKglEhm2cCSC3nkKlKcGUOnmNQL3jrSP80OXbwK3MZlRaem1BIVniVK001GbINtSl"

/** Languages Stripe's PaymentSheet should support, most preferred first. */
export const STRIPE_MERCHANT_COUNTRY = "PK";

/**
 * Google Pay is an Android-only payment method and does not run in Expo Go:
 * it needs a development/production build with the Stripe config plugin's
 * `enableGooglePay` flag (see app.json).
 */
export const GOOGLE_PAY_ENABLED = Platform.OS === "android";

/**
 * Currency symbols for the currencies Stripe commonly settles in. Used only to
 * render the price nicely before the gateway's own UI appears; the amount
 * itself always comes from the server (the course object's sale rate).
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  PKR: "PKR ",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
  SAR: "﷼",
  EGP: "E£",
  QAR: "﷼",
  KWD: "د.ك",
  OMR: "﷼",
  BHD: "د.ب",
  JOD: "د.ا",
};

/**
 * Formats a Stripe amount (in the currency's smallest unit) for display.
 * e.g. (1250000, "PKR") → "PKR 12,500".
 */
export function formatStripeAmount(amountCents: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] ?? `${currency.toUpperCase()} `;
  const major = amountCents / 100;
  const hasDecimals = Math.round(major * 100) % 100 !== 0;
  const [whole, decimal] = major.toFixed(hasDecimals ? 2 : 0).split(".");
  const withSeparators = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${symbol}${withSeparators}${decimal ? `.${decimal}` : ""}`;
}
