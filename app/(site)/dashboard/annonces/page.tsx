import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import UserAdsDashboard from '@/app/components/Dashboard/UserAdsDashboard';
import { AuroraBackground } from '@/components/ui/aurora-background';

export default async function MesAnnoncesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    redirect('/login');
  }

  const userId = (payload as any).userId;
  if (!userId) redirect('/login');

  return (
    <div className="min-h-screen flex justify-start">
      <UserAdsDashboard userId={userId} />
    </div>
  );
}
