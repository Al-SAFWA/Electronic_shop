import { NextResponse, type NextRequest } from "next/server";

const YEAR = 60 * 60 * 24 * 365;

/**
 * Resolves the language once per request and forwards it as `x-lang`.
 *
 * A request header is used (not only a cookie) because the store may be embedded
 * in a cross-origin iframe, where browsers can refuse to store cookies — the
 * header always reaches the server, so the language switch keeps working.
 */
export function middleware(req: NextRequest) {
  const param = req.nextUrl.searchParams.get("lang");
  const cookie = req.cookies.get("lang")?.value;
  const raw = param ?? cookie;
  const lang = raw === "fr" ? "fr" : "ar";

  const headers = new Headers(req.headers);
  headers.set("x-lang", lang);
  const res = NextResponse.next({ request: { headers } });

  // SameSite=None + Secure so the choice also persists inside an iframe
  res.cookies.set("lang", lang, { path: "/", maxAge: YEAR, sameSite: "none", secure: true });
  return res;
}

export const config = {
  /*
   * Run on every page — including /products/[slug] — but skip Next internals,
   * API routes and static files (the product packshots live in /public/products).
   * Matching by extension, not by folder, so the product pages stay covered.
   */
  matcher: ["/((?!_next/|api/|favicon\\.ico|.*\\.(?:webp|png|jpe?g|svg|gif|ico|css|js|woff2?|map)$).*)"],
};
