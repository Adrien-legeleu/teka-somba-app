import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import AdminPanel from '../components/admin/AdminPanel';
import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
export const runtime = 'nodejs';
type AuthPayload = JwtPayload & {
  userId: string;
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  let payload: AuthPayload;
  try {
    payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as AuthPayload;
  } catch {
    return null;
  }

  const userId = payload.userId;
  if (!userId) return null;

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

  if (!user || !user.isAdmin) {
    return null;
  }
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <AdminPanel />
    </Suspense>
  );
}
