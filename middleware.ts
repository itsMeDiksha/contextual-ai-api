import { NextResponse } from "next/server";

export function middleware(req: Request) {
  // Preflight
  if (req.method === "OPTIONS") {
    const res = new NextResponse(null, { status: 204 });
    res.headers.set("Access-Control-Allow-Origin", "http://localhost:3000");
    res.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type");
    res.headers.set("Vary", "Origin");
    return res;
  }

  const res = NextResponse.next();
  res.headers.set("Access-Control-Allow-Origin", "http://localhost:3000");
  res.headers.set("Vary", "Origin");
  return res;
}

export const config = {
  matcher: ["/api/:path*"],
};
