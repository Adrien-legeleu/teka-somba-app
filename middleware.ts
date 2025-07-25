import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  // Routes publiques accessibles à tous
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ];

  // Rediriger vers /dashboard si connecté et tente d’accéder à login ou signup
  if ((pathname === '/login' || pathname === '/signup') && token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      return NextResponse.redirect(new URL('/dashboard', req.url));
    } catch {
      // Token invalide : on laisse passer
    }
  }

  // Autoriser les routes publiques
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Vérification JWT
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Si route admin → il faut isAdmin
    if (pathname.startsWith('/admin')) {
      if (!payload.isAdmin) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return NextResponse.next();
  } catch {
    // Token cassé ou expiré → redirection login
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/signup'],
};
