import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/authUser';

export const dynamic = 'force-dynamic';

export async function GET() {
  const userId = await getUserIdFromRequest();

  if (!userId) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, userId });
}
