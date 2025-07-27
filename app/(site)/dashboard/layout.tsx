import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import SuspenseWrapper from '@/app/components/Dashboard/SuspenseWrapper';
export const runtime = 'nodejs';
type AuthPayload = JwtPayload & {
  userId: string;
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) redirect('/login');

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as AuthPayload;
    if (!payload.userId) redirect('/login');
  } catch {
    redirect('/login');
  }

  return <SuspenseWrapper>{children}</SuspenseWrapper>;
}
