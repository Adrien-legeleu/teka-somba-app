import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import AdminPanel from '../components/admin/AdminPanel';
import { prisma } from '@/lib/prisma';

export default async function AdminPage() {
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

  // Récupération du vrai user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      city: true,
      prenom: true,
      avatar: true,
      age: true,
      isAdmin: true,
    },
  });
  if (!user || !user.isAdmin) redirect('/login');

  return <AdminPanel />;
}
