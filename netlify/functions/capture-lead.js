// netlify/functions/capture-lead.js
exports.handler = async function (event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "https://padilla-ai.netlify.app",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  try {
    const data = JSON.parse(event.body);
    const { firstName, email, phone, monthlyLoss, annualLoss, threeYearLoss, clientValue, weeklyLeads, closeRate, missedRate } = data;
    if (!firstName || !email) return { statusCode: 400, headers, body: JSON.stringify({ error: "Name and email required" }) };
    const GHL_API_KEY = process.env.GHL_API_KEY;
    const LOCATION_ID = "XFmJTQgv8Gd5iIIcX5Lz";
    const contactPayload = {
      firstName: firstName.trim(),
      email: email.trim().toLowerCase(),
      locationId: LOCATION_ID,
      tags: ["calculator-lead"],
      customFields: [
        { key: "monthly_revenue_loss", field_value: String(monthlyLoss || 0) },
        { key: "annual_revenue_loss", field_value: String(annualLoss || 0) },
        { key: "three_year_revenue_loss", field_value: String(threeYearLoss || 0) },
        { key: "avg_client_value", field_value: String(clientValue || 0) },
        { key: "weekly_leads", field_value: String(weeklyLeads || 0) },
        { key: "close_rate", field_value: String(closeRate || 0) },
        { key: "missed_rate", field_value: String(missedRate || 0) },
      ],
      source: "Calculator - padilla-ai.netlify.app",
    };
    if (phone) contactPayload.phone = phone.trim();
    const ghlRes = await fetch("https://services.leadconnectorhq.com/contacts/", {
      method: "POST",
      headers: { Authorization: `Bearer ${GHL_API_KEY}`, "Content-Type": "application/json", Version: "2021-07-28" },
      body: JSON.stringify(contactPayload),
    });
    const ghlData = await ghlRes.json();
    if (!ghlRes.ok) console.error("GHL error:", ghlData);
    else console.log("GHL contact created:", ghlData?.contact?.id);
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error("Function error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Internal error" }) };
  }
};
