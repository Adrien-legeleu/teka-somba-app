import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ];
  if (publicRoutes.some((r) => pathname.startsWith(r)))
    return NextResponse.next();

  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', req.url));
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    if (pathname.startsWith('/admin') && !(payload as any).isAdmin)
      return NextResponse.redirect(new URL('/', req.url));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}
