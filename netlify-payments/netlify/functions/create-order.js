const Razorpay = require("razorpay");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let amount;
  try {
    amount = JSON.parse(event.body || "{}").amount;
  } catch (e) {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  if (!amount || amount <= 0) {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Amount must be greater than zero" }) };
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      payment_capture: 1,
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
      }),
    };
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    return { statusCode: 502, headers: corsHeaders, body: JSON.stringify({ error: "Unable to create payment order" }) };
  }
};
