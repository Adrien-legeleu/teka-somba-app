import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Routes publiques (mais avec protection login/signup si déjà connecté)
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ];

  // Récupération du token
  const token = req.cookies.get('token')?.value;

  // Si utilisateur tente d’accéder à /login ou /signup ET est déjà connecté
  if ((pathname === '/login' || pathname === '/signup') && token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      // Si token valide : redirection dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url));
    } catch {
      // Token cassé ou expiré → laisse passer
    }
  }

  // Les autres routes publiques restent accessibles
  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Pour toutes les routes protégées
  if (!token) return NextResponse.redirect(new URL('/login', req.url));
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    if (pathname.startsWith('/admin') && !(payload as any).isAdmin) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}
