import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'accessToken';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function fetchUserId(request: NextRequest): Promise<number | null> {
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);

  if (!authCookie) {
    return null;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `${authCookie.name}=${authCookie.value}`,
      },
    });
    if (!res.ok) {
      console.error(`Middleware fetch failed with status: ${res.status}`);
      return null;
    }

    const json = await res.json();

    if (json.resultCode !== '200' || !json.data) {
      return null;
    }

    return json.data.id;
  } catch (error) {
    console.error('Middleware fetch exception:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  console.log('Middleware triggered for:', pathname);

  if (pathname === '/profile') {
    const userId = await fetchUserId(request);

    if (userId) {
      const url = new URL(`/profile/${userId}`, request.url);
      return NextResponse.redirect(url);
    } else {
      const url = new URL('/auth/login', request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile'],
};
