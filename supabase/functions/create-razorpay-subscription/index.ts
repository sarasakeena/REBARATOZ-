import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

const planMap = {
  starter: Deno.env.get('RAZORPAY_PLAN_STARTER') || '',
  professional: Deno.env.get('RAZORPAY_PLAN_PROFESSIONAL') || '',
};

function getPlanId(planName) {
  const normalized = (planName || '').toLowerCase();
  return planMap[normalized] || Deno.env.get('RAZORPAY_PLAN_DEFAULT') || '';
}

function createRazorpayClient() {
  if (!razorpayKeyId || !razorpayKeySecret) {
    throw new Error('Razorpay credentials are not configured.');
  }

  return {
    keyId: razorpayKeyId,
    keySecret: razorpayKeySecret,
  };
}

async function updateSubscriptionRecord({ userId, planName, status }) {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing supabaseUrl or serviceRoleKey");
  }

  // Use POST with Prefer: resolution=merge-duplicates (Supabase upsert).
  // The 'subscriptions' table only reliably has user_id, status, and plan columns.
  const response = await fetch(`${supabaseUrl}/rest/v1/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      user_id: userId,
      status: status,
      plan: planName
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error('Subscription record upsert failed:', response.status, body);
    throw new Error(`DB Error: ${body}`);
  }
}

serve(async (req) => {
  // Allow CORS pre-flight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    const body = await req.json();
    const { action, userId, userEmail = '', userName = '', planName = 'Starter', amount = 999, paymentId = '' } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'A signed-in user is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // ─── ACTIVATE SUBSCRIPTION (Called by payment-success.html) ───
    if (action === 'activate') {
      await updateSubscriptionRecord({
        userId,
        planName,
        status: 'activated',
      });
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // ─── CREATE RAZORPAY ORDER (Called by script.js) ───
    const client = createRazorpayClient();

    // Use Razorpay Orders API (one-time payment, no plan ID required).
    // Amount is in paise (INR * 100).
    const orderParams = {
      amount: Math.round(amount) * 100,
      currency: 'INR',
      receipt: `rcpt_${userId.slice(0, 20)}_${Date.now()}`,
      notes: {
        user_id: userId,
        plan: planName,
        email: userEmail,
        name: userName,
      },
    };

    const auth = btoa(`${client.keyId}:${client.keySecret}`);
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(orderParams),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.description || 'Razorpay rejected the order request.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Record pending subscription so dashboard knows checkout was initiated
    await updateSubscriptionRecord({
      userId,
      planName,
      status: 'pending',
    });

    return new Response(JSON.stringify({
      id: data.id,           // Razorpay order_id — used in frontend options.order_id
      key_id: client.keyId,
      amount: data.amount,   // in paise, for frontend verification
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message || 'Checkout initialization failed.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
