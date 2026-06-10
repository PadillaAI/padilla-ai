// netlify/functions/calendly-webhook.js
// Receives Calendly booking events → creates/updates GHL contact
// Env vars required: GHL_API_KEY, CALENDLY_WEBHOOK_SECRET

const crypto = require('crypto');

const GHL_API_KEY = process.env.GHL_API_KEY;
const CALENDLY_SIGNING_KEY = process.env.CALENDLY_WEBHOOK_SECRET;
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

// ── Signature verification ──────────────────────────────────────────────────
function verifyCalendlySignature(rawBody, signatureHeader) {
  if (!CALENDLY_SIGNING_KEY) return true; // skip if secret not configured yet
  if (!signatureHeader) return false;

  const parts = {};
  signatureHeader.split(',').forEach((part) => {
    const idx = part.indexOf('=');
    const k = part.substring(0, idx);
    const v = part.substring(idx + 1);
    parts[k] = v;
  });

  const timestamp = parts.t;
  const receivedSig = parts.v1;
  if (!timestamp || !receivedSig) return false;

  // Reject if timestamp is older than 5 minutes
  if (Math.abs(Date.now() / 1000 - parseInt(timestamp, 10)) > 300) return false;

  const expected = crypto
    .createHmac('sha256', CALENDLY_SIGNING_KEY)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(receivedSig, 'hex'),
      Buffer.from(expected, 'hex')
    );
  } catch {
    return false;
  }
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
    // Merge tags — GHL PUT replaces, so we merge with existing tags
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

// ── Handler ──────────────────────────────────────────────────────────────────
exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Signature check
  const sigHeader = event.headers['calendly-webhook-signature'];
  if (!verifyCalendlySignature(event.body, sigHeader)) {
    console.error('Calendly webhook: invalid signature');
    return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid signature' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const eventType = payload.event; // 'invitee.created' | 'invitee.canceled'
  const invitee = payload.payload?.invitee;
  const scheduledEvent = payload.payload?.scheduled_event;

  // Acknowledge but skip unknown events
  if (!invitee || !['invitee.created', 'invitee.canceled'].includes(eventType)) {
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ received: true, skipped: true }) };
  }

  const email = invitee.email?.trim().toLowerCase();
  if (!email) {
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ received: true, skipped: true }) };
  }

  const nameParts = (invitee.name || '').trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  const phone = invitee.text_reminder_number || '';
  const eventName = scheduledEvent?.name || 'Strategy Call';
  const startTime = scheduledEvent?.start_time || '';
  const meetingUrl = scheduledEvent?.location?.join_url || scheduledEvent?.location?.location || '';
  const cancelReason = invitee.cancel_reason || '';

  try {
    if (eventType === 'invitee.created') {
      const result = await upsertContact({
        firstName,
        lastName,
        email,
        ...(phone && { phone }),
        tags: ['calendly-booked', 'call-scheduled'],
        customFields: [
          { key: 'calendly_event_name', field_value: eventName },
          { key: 'calendly_start_time', field_value: startTime },
          { key: 'calendly_meeting_url', field_value: meetingUrl },
          { key: 'last_booking_date', field_value: new Date().toISOString() },
        ],
        source: 'Calendly',
      });
      console.log(`[Calendly] Booking created — ${email} | contact ${result.action}: ${result.contactId}`);
    }

    if (eventType === 'invitee.canceled') {
      const result = await upsertContact({
        firstName,
        lastName,
        email,
        tags: ['booking-canceled'],
        customFields: [
          { key: 'calendly_cancel_reason', field_value: cancelReason },
          { key: 'calendly_cancellation_date', field_value: new Date().toISOString() },
        ],
      });
      console.log(`[Calendly] Booking canceled — ${email} | contact ${result.action}: ${result.contactId}`);
    }

    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('[Calendly] Webhook error:', err.message);
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Internal error' }) };
  }
};
