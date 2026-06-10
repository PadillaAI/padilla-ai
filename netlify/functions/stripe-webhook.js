// netlify/functions/stripe-webhook.js
// Receives Stripe payment events → creates/updates GHL contact
// Env vars required: GHL_API_KEY, STRIPE_WEBHOOK_SECRET

const crypto = require('crypto');

const GHL_API_KEY = process.env.GHL_API_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const LOCATION_ID = 'XFmJTQgv8Gd5iIIcX5Lz';
const GHL_BASE = 'https://services.leadconnectorhq.com';

const GHL_HEADERS = {
  Authorization: `Bearer ${GHL_API_KEY}`,
  'Content-Type': 'application/json',
  Version: '2021-07-28',
};

const CORS_HEADERS = {
  'Content-Type': 'application/json',
};

// ── Stripe signature verification ────────────────────────────────────────────
function verifyStripeSignature(rawBody, sigHeader, secret) {
  if (!secret) return true; // skip if not configured
  if (!sigHeader) return false;

  const parts = {};
  sigHeader.split(',').forEach((part) => {
    const idx = part.indexOf('=');
    const k = part.substring(0, idx);
    const v = part.substring(idx + 1);
    if (!parts[k]) parts[k] = [];
    parts[k].push(v);
  });

  const timestamp = parts.t?.[0];
  const signatures = parts.v1 || [];
  if (!timestamp || !signatures.length) return false;

  // Reject webhooks older than 5 minutes
  if (Math.abs(Date.now() / 1000 - parseInt(timestamp, 10)) > 300) return false;

  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  return signatures.some((sig) => {
    try {
      return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
    } catch {
      return false;
    }
  });
}

// ── GHL helpers ──────────────────────────────────────────────────────────────
async function findContactByEmail(email) {
  const res = await fetch(
    `${GHL_BASE}/contacts/?locationId=${LOCATION_ID}&email=${encodeURIComponent(email)}`,
    { headers: GHL_HEADERS }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.contacts?.[0] || null;
}

async function upsertContact(payload) {
  const existing = payload.email ? await findContactByEmail(payload.email) : null;

  if (existing) {
    const existingTags = existing.tags || [];
    const newTags = payload.tags || [];
    const mergedTags = [...new Set([...existingTags, ...newTags])];

    const res = await fetch(`${GHL_BASE}/contacts/${existing.id}`, {
      method: 'PUT',
      headers: GHL_HEADERS,
      body: JSON.stringify({ ...payload, tags: mergedTags }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`GHL update failed: ${JSON.stringify(data)}`);
    return { action: 'updated', contactId: existing.id, data };
  }

  const res = await fetch(`${GHL_BASE}/contacts/`, {
    method: 'POST',
    headers: GHL_HEADERS,
    body: JSON.stringify({ ...payload, locationId: LOCATION_ID }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`GHL create failed: ${JSON.stringify(data)}`);
  return { action: 'created', contactId: data.contact?.id, data };
}

function formatCurrency(amountCents, currency = 'usd') {
  return `$${(amountCents / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

// ── Handler ──────────────────────────────────────────────────────────────────
exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Stripe requires raw body for signature verification — Netlify provides this
  const sigHeader = event.headers['stripe-signature'];
  if (!verifyStripeSignature(event.body, sigHeader, STRIPE_WEBHOOK_SECRET)) {
    console.error('[Stripe] Signature verification failed');
    return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid signature' }) };
  }

  let stripeEvent;
  try {
    stripeEvent = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { type, data } = stripeEvent;
  const obj = data?.object;

  try {
    switch (type) {

      // ── One-time payment / checkout ────────────────────────────────────────
      case 'checkout.session.completed': {
        const email = obj.customer_details?.email?.trim().toLowerCase();
        if (!email) break;

        const name = obj.customer_details?.name || '';
        const phone = obj.customer_details?.phone || '';
        const nameParts = name.trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        const amountDisplay = formatCurrency(obj.amount_total || 0, obj.currency);
        const stripeCustomerId = obj.customer || '';
        const productName = obj.metadata?.product_name || obj.description || 'Padilla AI Service';
        const sessionId = obj.id || '';

        const result = await upsertContact({
          firstName,
          lastName,
          email,
          ...(phone && { phone }),
          tags: ['paid-client', 'stripe-payment'],
          customFields: [
            { key: 'stripe_customer_id', field_value: stripeCustomerId },
            { key: 'payment_amount', field_value: amountDisplay },
            { key: 'payment_date', field_value: new Date().toISOString() },
            { key: 'stripe_product', field_value: productName },
            { key: 'stripe_session_id', field_value: sessionId },
          ],
          source: 'Stripe',
        });
        console.log(`[Stripe] checkout.session.completed — ${email} | ${amountDisplay} | contact ${result.action}: ${result.contactId}`);
        break;
      }

      // ── Subscription created ───────────────────────────────────────────────
      case 'customer.subscription.created': {
        const stripeCustomerId = obj.customer || '';
        const plan = obj.items?.data?.[0]?.price?.nickname ||
                     obj.items?.data?.[0]?.price?.product ||
                     'Subscription';
        const status = obj.status; // active, trialing, past_due, etc.
        const email = obj.metadata?.email || '';

        const tags = status === 'active' || status === 'trialing'
          ? ['active-subscriber', 'paid-client']
          : [`subscription-${status}`];

        const contactPayload = {
          tags,
          customFields: [
            { key: 'stripe_customer_id', field_value: stripeCustomerId },
            { key: 'subscription_plan', field_value: plan },
            { key: 'subscription_status', field_value: status },
            { key: 'subscription_start_date', field_value: new Date().toISOString() },
          ],
          source: 'Stripe',
        };

        if (email) {
          const result = await upsertContact({ email, ...contactPayload });
          console.log(`[Stripe] subscription.created — ${email || stripeCustomerId} | plan: ${plan} | status: ${status} | contact ${result.action}: ${result.contactId}`);
        } else {
          console.log(`[Stripe] subscription.created — no email in metadata, skipping GHL. Stripe customer: ${stripeCustomerId}`);
        }
        break;
      }

      // ── Subscription updated (e.g., upgrade/downgrade/cancel) ─────────────
      case 'customer.subscription.updated': {
        const stripeCustomerId = obj.customer || '';
        const status = obj.status;
        const email = obj.metadata?.email || '';

        const tags = status === 'canceled' ? ['subscription-canceled']
          : status === 'past_due' ? ['payment-past-due']
          : status === 'active' ? ['active-subscriber']
          : [`subscription-${status}`];

        if (email) {
          await upsertContact({
            email,
            tags,
            customFields: [
              { key: 'stripe_customer_id', field_value: stripeCustomerId },
              { key: 'subscription_status', field_value: status },
            ],
          });
          console.log(`[Stripe] subscription.updated — ${email} | new status: ${status}`);
        }
        break;
      }

      // ── Failed payment ─────────────────────────────────────────────────────
      case 'invoice.payment_failed': {
        const email = obj.customer_email?.trim().toLowerCase() || '';
        const stripeCustomerId = obj.customer || '';
        const amountDisplay = formatCurrency(obj.amount_due || 0, obj.currency);

        if (email) {
          const result = await upsertContact({
            email,
            tags: ['payment-failed'],
            customFields: [
              { key: 'stripe_customer_id', field_value: stripeCustomerId },
              { key: 'payment_failed_date', field_value: new Date().toISOString() },
              { key: 'payment_failed_amount', field_value: amountDisplay },
            ],
          });
          console.log(`[Stripe] invoice.payment_failed — ${email} | ${amountDisplay} | contact ${result.action}: ${result.contactId}`);
        }
        break;
      }

      // ── Payment intent succeeded (one-time, outside checkout) ─────────────
      case 'payment_intent.succeeded': {
        const email = obj.receipt_email?.trim().toLowerCase() ||
                      obj.metadata?.email?.trim().toLowerCase() || '';
        const stripeCustomerId = obj.customer || '';
        const amountDisplay = formatCurrency(obj.amount || 0, obj.currency);

        if (email) {
          await upsertContact({
            email,
            tags: ['paid-client', 'stripe-payment'],
            customFields: [
              { key: 'stripe_customer_id', field_value: stripeCustomerId },
              { key: 'payment_amount', field_value: amountDisplay },
              { key: 'payment_date', field_value: new Date().toISOString() },
            ],
            source: 'Stripe',
          });
          console.log(`[Stripe] payment_intent.succeeded — ${email} | ${amountDisplay}`);
        }
        break;
      }

      default:
        console.log(`[Stripe] Unhandled event type: ${type}`);
    }

    // Always return 200 to prevent Stripe retries on expected unhandled events
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ received: true }) };

  } catch (err) {
    console.error('[Stripe] Webhook error:', err.message);
    // Return 500 so Stripe retries on actual errors
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Internal error' }) };
  }
};
