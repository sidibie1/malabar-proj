# Malabar Stores — Razorpay Netlify Functions

Standalone Netlify serverless functions that handle the Razorpay payment aggregator
for the Malabar Stores site. Deployed independently of the main frontend.

## Functions
- `netlify/functions/create-order.js` — `POST /.netlify/functions/create-order` — creates a Razorpay order for `{ amount }` (in rupees).
- `netlify/functions/verify-payment.js` — `POST /.netlify/functions/verify-payment` — verifies `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }` via HMAC SHA256, returns `{ verified: true|false }`.

## Deploy to Netlify
1. Push this folder to its own GitHub repo (or a subfolder Netlify can point at).
2. In Netlify: **Add new site → Import an existing project**, point the base directory at this folder.
3. Set environment variables in Netlify (Site settings → Environment variables):
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
4. Deploy. Your functions will be live at `https://<your-site>.netlify.app/.netlify/functions/create-order` and `/verify-payment`.

## Connect to the frontend
In the Malabar Stores frontend `.env`, set:
```
REACT_APP_PAYMENTS_API_URL=https://<your-site>.netlify.app
```
Restart the frontend after setting this.
