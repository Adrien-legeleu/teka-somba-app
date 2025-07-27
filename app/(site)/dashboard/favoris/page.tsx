export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import FavoriteDashboard from '@/app/components/Favorite/FavoriteDashboard';

type AuthPayload = JwtPayload & {
  userId: string;
};

export default async function MesFavoritesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');

  let payload: AuthPayload;
  try {
    payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as AuthPayload;
  } catch {
    redirect('/login');
  }

  const userId = payload?.userId;
  if (!userId) redirect('/login');

  return <FavoriteDashboard userId={userId} />;
}
