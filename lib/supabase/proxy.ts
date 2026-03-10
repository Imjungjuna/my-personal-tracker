import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/"];

function isProtectedRoute(pathname: string) {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export async function updateSession(request: NextRequest) {
  // #region agent log
  fetch("http://127.0.0.1:7563/ingest/a3863a5f-be11-4ccd-889b-f3f9eea40172", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "e38559",
    },
    body: JSON.stringify({
      sessionId: "e38559",
      location: "lib/supabase/proxy.ts:entry",
      message: "proxy request",
      data: {
        pathname: request.nextUrl.pathname,
        origin: request.nextUrl.origin,
      },
      timestamp: Date.now(),
      hypothesisId: "H1,H3,H4",
    }),
  }).catch(() => {});
  // #endregion
  let supabaseResponse = NextResponse.next({
    request,
  });

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;
  // #region agent log
  fetch("http://127.0.0.1:7563/ingest/a3863a5f-be11-4ccd-889b-f3f9eea40172", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "e38559",
    },
    body: JSON.stringify({
      sessionId: "e38559",
      location: "lib/supabase/proxy.ts:getClaims",
      message: "after getClaims",
      data: { hasUser: !!user, pathname: request.nextUrl.pathname },
      timestamp: Date.now(),
      hypothesisId: "H2",
    }),
  }).catch(() => {});
  // #endregion

  if (!user && isProtectedRoute(request.nextUrl.pathname)) {
    // no user on protected route → redirect to login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // #region agent log
    fetch("http://127.0.0.1:7563/ingest/a3863a5f-be11-4ccd-889b-f3f9eea40172", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "e38559",
      },
      body: JSON.stringify({
        sessionId: "e38559",
        location: "lib/supabase/proxy.ts:redirect",
        message: "redirect to login",
        data: {
          redirectHref: url.toString(),
          pathname: request.nextUrl.pathname,
        },
        timestamp: Date.now(),
        hypothesisId: "H1,H5",
      }),
    }).catch(() => {});
    // #endregion
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  // #region agent log
  fetch("http://127.0.0.1:7563/ingest/a3863a5f-be11-4ccd-889b-f3f9eea40172", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "e38559",
    },
    body: JSON.stringify({
      sessionId: "e38559",
      location: "lib/supabase/proxy.ts:next",
      message: "pass through",
      data: { pathname: request.nextUrl.pathname },
      timestamp: Date.now(),
      hypothesisId: "H4",
    }),
  }).catch(() => {});
  // #endregion
  return supabaseResponse;
}
