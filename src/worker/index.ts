import { json, apiError } from "./http";
import { cities, companions, entryPaths, experiences, safetyContent } from "./staged-data";
import { routeAuth } from "./auth";
import { createPaymentSession, paymentProviders } from "./payment-provider";

async function routeApi(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const { pathname, searchParams } = url;

  const authResponse = await routeAuth(request, pathname);
  if (authResponse) return authResponse;

  if (request.method === "GET" && pathname === "/api/public/home") {
    return json({
      brand: {
        name: "Tirak Plus",
        promise: "Private Thailand companion concierge for reviewed adult travellers.",
      },
      cities,
      highlights: ["Verified visibility", "Private inquiries", "Provider approval before payments"],
      entryPaths,
    });
  }

  if (request.method === "GET" && pathname === "/api/public/experiences") {
    const city = searchParams.get("city");
    const category = searchParams.get("category");
    return json(
      experiences.filter((item) => {
        const cityMatches = city ? item.city === city : true;
        const categoryMatches = category ? item.slug === category : true;
        return cityMatches && categoryMatches;
      }),
    );
  }

  if (request.method === "GET" && pathname === "/api/traveller/discovery") {
    const city = searchParams.get("city");
    const data = city ? companions.filter((item) => item.city === city) : companions;
    return json({
      filters: { city, verifiedOnly: true },
      results: data,
    });
  }

  const companionMatch = pathname.match(/^\/api\/traveller\/companions\/([^/]+)$/);
  if (request.method === "GET" && companionMatch) {
    const profile = companions.find((item) => item.id === companionMatch[1]);
    if (!profile) return apiError(404, "PROFILE_NOT_FOUND", "This profile is unavailable.");
    return json(profile);
  }

  if (request.method === "POST" && pathname === "/api/traveller/inquiries") {
    return json(
      {
        id: crypto.randomUUID(),
        status: "under_review",
        nextStep: "A private review state is created before routing or payment.",
      },
      { status: 201 },
    );
  }

  if (request.method === "GET" && pathname === "/api/payments/providers") {
    return json(paymentProviders);
  }

  const paymentMatch = pathname.match(/^\/api\/traveller\/inquiries\/([^/]+)\/payment-session$/);
  if (request.method === "POST" && paymentMatch) {
    return json(createPaymentSession("stripe"), { status: 409 });
  }

  if (request.method === "GET" && pathname === "/api/safety/content") {
    return json(safetyContent);
  }

  return apiError(404, "API_ROUTE_NOT_FOUND", "No API route exists for this request.");
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return routeApi(request);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
