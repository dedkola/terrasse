import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function unauthorized(message: string) {
  return new NextResponse(message, {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Protected Admin"',
    },
  });
}

function decodeBase64(value: string): string | null {
  if (typeof Buffer !== "undefined") {
    try {
      return Buffer.from(value, "base64").toString("utf-8");
    } catch {
      // Fall through to Web API decoding.
    }
  }

  if (typeof atob === "function") {
    try {
      const binary = atob(value);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    } catch {
      return null;
    }
  }

  return null;
}

export function proxy(request: NextRequest) {
  // Only protect the admin route.
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return unauthorized("Authentication required");
    }

    const base64Credentials = authHeader.slice("Basic ".length);
    const credentials = decodeBase64(base64Credentials);

    if (!credentials) {
      return unauthorized("Invalid credentials");
    }

    const separatorIndex = credentials.indexOf(":");
    if (separatorIndex < 0) {
      return unauthorized("Invalid credentials");
    }

    const username = credentials.slice(0, separatorIndex);
    const password = credentials.slice(separatorIndex + 1);

    // Get credentials from environment variables.
    const validUsername = process.env.BASIC_AUTH_USER || "admin";
    const validPassword = process.env.BASIC_AUTH_PASS || "password";

    // Validate credentials.
    if (username !== validUsername || password !== validPassword) {
      return unauthorized("Invalid credentials");
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
