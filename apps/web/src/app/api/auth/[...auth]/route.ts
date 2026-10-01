import { type NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// ponytail: while the API app is unbuilt, an unreachable backend answers
// get-session as "no session" instead of a 500.
async function forward(req: NextRequest) {
  const target = `${API_URL}${req.nextUrl.pathname}${req.nextUrl.search}`;
  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: req.headers,
      body: req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer(),
      redirect: "manual",
    });
    const headers = new Headers(upstream.headers);
    headers.delete("content-encoding");
    headers.delete("content-length");
    headers.delete("set-cookie");
    const res = new NextResponse(upstream.body, { status: upstream.status, headers });
    for (const cookie of upstream.headers.getSetCookie()) {
      res.headers.append("set-cookie", cookie);
    }
    return res;
  } catch {
    if (req.nextUrl.pathname.endsWith("/get-session")) {
      return NextResponse.json(null);
    }
    return NextResponse.json({ error: "auth-service-unavailable" }, { status: 503 });
  }
}

export { forward as DELETE, forward as GET, forward as PATCH, forward as POST, forward as PUT };
