# Stripe payments (Google Pay + card)

The app's Pro subscription and course purchases are processed through **Stripe**.
The native checkout is Stripe's `PaymentSheet`, which offers **card** everywhere
and **Google Pay** on Android development/production builds.

The old payment integrations (`paymob-reactnative`, `expo-iap` / Google Play
Billing) have been removed.

## How the money flows

1. The user taps **Buy Now** on a course (or **Subscribe** for Pro).
2. The app asks the backend to create a **PaymentIntent**
   (`POST /api/Stripe/CreatePaymentIntent`).
3. The **backend** prices it — for a course it reads `CourseTb.SaleRate` from the
   course object; for Pro-only it uses the configured Pro price. The client never
   sends the amount.
4. The backend returns the intent's `client_secret`; the app opens the native
   `PaymentSheet` (card + Google Pay).
5. After payment the app calls `POST /api/Stripe/Confirm`. The **server**
   retrieves the PaymentIntent from Stripe and only unlocks access when it is
   genuinely `succeeded` and the paid amount matches the expected price. Stripe
   also posts a signed webhook to `POST /api/Stripe/Webhook` as a backstop.

## Keys

| Key | Where it goes | Notes |
| --- | --- | --- |
| **Publishable** (`pk_test_…` / `pk_live_…`) | `crashAppExpo/.env` → `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and/or the backend `Stripe:PublishableKey` | Public; safe to ship. The backend value (returned by `GET /api/Stripe/Plan`) takes precedence. |
| **Secret** (`sk_test_…` / `sk_live_…`) | **Backend only** — `MdLabScience.WebAPI/appsettings.json` → `Stripe:SecretKey` | Never ship this in the app. |
| **Webhook signing secret** (`whsec_…`) | `MdLabScience.WebAPI/appsettings.json` → `Stripe:WebhookSecret` | Used to verify the webhook signature. |

### Backend configuration (`appsettings.json`)

```json
"Stripe": {
  "SecretKey": "sk_test_REPLACE_ME",
  "PublishableKey": "pk_test_REPLACE_ME",
  "WebhookSecret": "whsec_REPLACE_ME",
  "Currency": "PKR",
  "ProAmountCents": 0,
  "ProMonths": 1,
  "AIAssistantUsd": 10,
  "AIAssistantRate": 1
}
```

- `Currency` is `PKR`. Stripe treats PKR as a **two-decimal** currency, so the
  backend converts the course's `SaleRate` (major units) to minor units
  (`×100`) with `StripeService.ToMinorUnits`.
- `ProAmountCents` is only used for the Pro-only paywall; course purchases are
  priced from the course object.
- `AIAssistantUsd` / `AIAssistantRate` price the optional **AI Assistant
  add-on**. The add-on is a static US$ base (`AIAssistantUsd`, default 10)
  converted to the gateway currency by the fixed `AIAssistantRate` (default 1 =
  no conversion). e.g. with `Currency: "USD"` keep the rate at 1 so the add-on
  is exactly $10; with `Currency: "PKR"` set the rate to your USD→PKR rate
  (e.g. `280` → about PKR 2,800). When a payment includes the add-on the buyer's
  `AppUserTb.IsAIAllowed` is set to true and the amount is charged on top of the
  course/Pro price.

### App configuration (`crashAppExpo/.env`)

```
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_REPLACE_ME
```

## Required native rebuild

Stripe's native SDK and the Google Pay flag are native modules, so **Expo Go
will not work** for payments. Rebuild after installing:

```sh
npx expo run:android   # or: npx expo run:ios
```

Google Pay additionally requires:

- The Stripe config plugin's `enableGooglePay: true` (already set in `app.json`).
- A **production** Google Pay environment once approved; the app currently uses
  Stripe's test environment in dev (`googlePay.testEnv: __DEV__`).
- Google Pay set up for your account in the Stripe Dashboard.

## Setting up the Stripe webhook

1. In the Stripe Dashboard → **Developers → Webhooks**, add an endpoint pointing
   at `https://<your-api-host>/api/Stripe/Webhook`.
2. Subscribe to the `payment_intent.succeeded` event.
3. Copy the endpoint's **signing secret** (`whsec_…`) into `Stripe:WebhookSecret`.
