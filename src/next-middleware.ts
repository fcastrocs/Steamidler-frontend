// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// middleware to check authentication
export function middleware(req: NextRequest) {
  const cookies = req.cookies;

  // check if user has auth cookies
  if (cookies && cookies.get("access-token") && cookies.get("refresh-token")) {
    if (req.url.includes("/login") || req.url.includes("/register")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  } else {
    if (req.url.includes("/dashboard")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/dashboard/:path*"],
};
