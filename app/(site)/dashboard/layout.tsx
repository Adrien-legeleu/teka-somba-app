import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) redirect('/login');

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!payload?.userId) redirect('/login');
  } catch {
    redirect('/login');
  }

  return <>{children}</>;
}
