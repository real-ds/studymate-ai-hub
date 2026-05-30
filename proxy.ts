import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth/config"

export async function proxy(request: NextRequest) {
  const session = await auth()
  
  const isProtected = [
    "/feature/",
    "/profile/",
    "/api/features/",
    "/api/history/",
    "/api/export/",
    "/api/profile/",
  ].some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtected && !session?.user) {
    const loginUrl = new URL("/login", request.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/feature/:path*",
    "/profile/:path*",
    "/api/features/:path*",
    "/api/history/:path*",
    "/api/export/:path*",
    "/api/profile/:path*",
  ],
}
