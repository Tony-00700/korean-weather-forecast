const KMA_API_ROOT =
  "https://apihub.kma.go.kr/api/typ02/openApi/VilageFcstInfoService_2.0";
const KMA_MAP_ROOT = "https://apihub.kma.go.kr/api/typ03/cgi/dfs";

const ROUTES = {
  ncst: `${KMA_API_ROOT}/getUltraSrtNcst`,
  ultra: `${KMA_API_ROOT}/getUltraSrtFcst`,
  short: `${KMA_API_ROOT}/getVilageFcst`,
  version: `${KMA_API_ROOT}/getFcstVersion`,
  mapVillage: `${KMA_MAP_ROOT}/nph-dfs_shrt_ana_5d`,
  mapUltra: `${KMA_MAP_ROOT}/nph-dfs_vsrt_ana2`,
};

const ALLOWED_ORIGINS = new Set([
  "https://tony-00700.github.io",
]);

function corsHeaders(origin) {
  const headers = new Headers({
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  });
  if (ALLOWED_ORIGINS.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }
  return headers;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const headers = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }
    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405, headers });
    }
    if (!ALLOWED_ORIGINS.has(origin)) {
      return new Response("Origin not allowed", { status: 403, headers });
    }
    if (!env.KMA_AUTH_KEY) {
      return new Response("KMA_AUTH_KEY secret is not configured", {
        status: 503,
        headers,
      });
    }

    const route = url.pathname.split("/").filter(Boolean).at(-1);
    const upstreamUrl = ROUTES[route];
    if (!upstreamUrl) {
      return new Response("Unknown KMA API route", { status: 404, headers });
    }

    const target = new URL(upstreamUrl);
    for (const [name, value] of url.searchParams) {
      if (name !== "authKey" && name !== "serviceKey") {
        target.searchParams.set(name, value);
      }
    }
    target.searchParams.set("authKey", env.KMA_AUTH_KEY);
    if (!route.startsWith("map")) target.searchParams.set("dataType", "JSON");

    try {
      const upstream = await fetch(target, {
        headers: { Accept: route.startsWith("map") ? "image/*,*/*" : "application/json" },
      });
      const responseHeaders = new Headers(headers);
      responseHeaders.set(
        "Content-Type",
        upstream.headers.get("Content-Type") ||
          (route.startsWith("map") ? "image/png" : "application/json; charset=utf-8"),
      );
      responseHeaders.set("Cache-Control", "no-store");
      return new Response(upstream.body, {
        status: upstream.status,
        headers: responseHeaders,
      });
    } catch {
      return new Response("KMA upstream request failed", {
        status: 502,
        headers,
      });
    }
  },
};

