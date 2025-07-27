import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import UserAdsDashboard from '@/app/components/Dashboard/UserAdsDashboard';

type AuthPayload = JwtPayload & {
  userId: string;
};

export default async function MesAnnoncesPage() {
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

  return (
    <div className="min-h-screen flex justify-start">
      <UserAdsDashboard userId={userId} />
    </div>
  );
}
