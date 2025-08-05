import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import SuspenseWrapper from '@/app/components/Dashboard/SuspenseWrapper';
import { Metadata } from 'next';
export const runtime = 'nodejs';
type AuthPayload = JwtPayload & {
  userId: string;
};
export const metadata: Metadata = {
  robots: { index: false, follow: false }, // désindexe toute la zone /dashboard
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
