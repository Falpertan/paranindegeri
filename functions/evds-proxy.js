/**
 * Cloudflare Pages Function — EVDS CORS proxy
 * URL: /evds-proxy?series=...
 * Ortam: EVDS_API_KEY (Cloudflare Pages → Settings → Variables)
 */

const EVDS_BASE = 'https://evds3.tcmb.gov.tr/igmevdsms-dis/';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-EVDS-Key',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'GET only' }), {
      status: 405,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    });
  }

  const apiKey = request.headers.get('X-EVDS-Key') || env.EVDS_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'EVDS_API_KEY tanımlı değil' }), {
      status: 401,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    });
  }

  const url = new URL(request.url);
  const qs = url.search.replace(/^\?/, '');
  const evdsUrl = EVDS_BASE + qs;

  try {
    const upstream = await fetch(evdsUrl, { headers: { key: apiKey } });
    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'EVDS bağlantı hatası', detail: err.message }), {
      status: 502,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    });
  }
}
