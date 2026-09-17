# Plan: Clean Up malabar-proj + Add Razorpay Payments

## What this covers
1. Import the existing GitHub repo (`sidibie1/malabar-proj` — a React cart/shopping app, public, no credentials needed).
2. Clean up the codebase: remove repetitive code, delete unused/dead files and code, and trim the project down to a minimal size appropriate for a grocery-store app.
3. Add a minimal Razorpay payment flow on top of the cleaned-up app.

Across all of this, the website must look and behave exactly as it does today — no visual or functional changes, no new bugs.

## Cleanup scope
- Remove duplicated code (repeated components, styles, logic) by consolidating to a single source.
- Remove files/components/assets that aren't referenced or used anywhere in the app.
- Reduce overall project size/file count where it doesn't affect what the site shows or does.
- No renaming of routes, no UI/UX changes, no feature removal — purely deleting what's unused or duplicated.

## Payment flow to be added (unchanged from before)
1. User reaches checkout in the existing cart flow.
2. A request creates a Razorpay order for the cart total.
3. Razorpay's checkout screen opens for payment (cards/UPI/etc., as enabled on the account).
4. Payment is verified server-side before the order is marked "paid".

No order history, receipts, refunds, or admin dashboard — just pay-and-verify, kept minimal.

## "Serverless functions" note
This workspace runs a standing backend service rather than deployable cloud serverless functions. The Razorpay logic will be written as two small, self-contained endpoints (create order, verify payment) touching nothing else — functionally equivalent to serverless functions, hosted on the existing backend service. Flag now if a literal deploy to an external serverless provider (e.g. Vercel) is a hard requirement instead.

## Going online
This workspace's built-in deploy/publish flow will be used unless there's a specific reason to deploy elsewhere.

## What's needed from you before building starts
- Razorpay API keys (Key ID and Key Secret) — from Razorpay Dashboard → Settings → API Keys. Test-mode keys are fine to start.

## Assumptions (flag if wrong)
- "Minimal but looks the same, no bugs" means: safe to delete anything unused/duplicated, but nothing visible or functional changes.
- Test-mode Razorpay first; going live later is just a key swap.
- No persistence of order/payment records beyond what's needed to verify a payment.
