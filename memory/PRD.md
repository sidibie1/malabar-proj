# Malabar Stores — PRD

## Original problem statement
User asked to import an existing GitHub repo (`sidibie1/malabar-proj`, public, no creds needed), clean up the codebase (remove duplication/unused files, trim to minimal size), and add a minimal Razorpay pay-and-verify flow on top — with the site looking/behaving identically to today, no new bugs.

## Architecture
- Frontend: React 19 (CRA + craco) single-page app, single `App.js` component, Tailwind CSS, lucide-react icons. No routing (anchor scroll nav).
- Backend: FastAPI, no MongoDB usage (stateless payment flow, nothing to persist).
- Payments: Razorpay Orders API (create-order) + client-side Checkout.js + server-side signature verification (verify). No webhooks, no DB persistence of orders/payments.

## User persona
Kerala grocery shop owner (Malabar Stores, Tilak Nagar, Kurla, Mumbai) wanting a simple storefront site with cart, WhatsApp/UPI ordering, and now an online card/UPI payment option via Razorpay.

## Core requirements (static)
- Site content/design must remain pixel-identical to the imported repo.
- Cart with add/remove/qty stepper, WhatsApp order confirmation, direct UPI deep links — pre-existing, must remain unaffected.
- New: Razorpay create-order + verify-payment endpoints, minimal, no order history/receipts/refunds/admin dashboard.

## Implemented (2026-07 / this session)
- Imported `sidibie1/malabar-proj` into `/app/frontend`.
- Cleanup: deleted unused shadcn `components/ui/*` (~46 files), `hooks/use-toast.js`, `lib/utils.js`, `constants/testIds/*`, `components.json` — none were referenced by the app. Reduced `src/` from 308K/57 files to 64K/4 files.
- Fixed image filename casing bug (payasam-mix, pickles, vatteppam were `.PNG` on disk vs `.png` in code) so all 7 product images render on this case-sensitive filesystem.
- Updated `public/index.html` title/description/font links to match the Malabar Stores branding (kept required Emergent/posthog scripts).
- Backend: added `POST /api/payments/create-order` and `POST /api/payments/verify` using the `razorpay` Python SDK. Removed unused Mongo status-check boilerplate (app has no persistence needs).
- Frontend: added a new "Pay Online" section in the cart drawer (`razorpay-pay-button`, `payment-status-message`) alongside the pre-existing UPI/WhatsApp flow — purely additive.
- `backend/.env`: added `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` as placeholder values (user's explicit choice — real keys to be swapped in later).
- Tested via testing agent: 7/7 backend pytest tests pass; full frontend E2E pass on desktop + mobile (390px). Razorpay create-order correctly fails with 502 (expected, placeholder keys); verify endpoint fully functional (local HMAC check, no real keys needed).

## Backlog / next tasks
- P0: Swap placeholder Razorpay keys for real test/live keys (Dashboard → Settings → API Keys) to make create-order actually work end-to-end.
- P1: None requested — feature set is intentionally minimal per approved plan.
- P2 (ideas, not requested): order confirmation email/SMS, simple order log for the shop owner, product photo touch-ups.
