import { NextResponse } from "next/server";

export function extensionCorsHeaders(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  const headers = new Headers();
  if (origin.startsWith("chrome-extension://")) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, DELETE, OPTIONS",
    );
  }
  return headers;
}

export function withCors(request: Request, response: NextResponse) {
  const cors = extensionCorsHeaders(request);
  cors.forEach((value, key) => response.headers.set(key, value));
  return response;
}

export function optionsCors(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }));
}
