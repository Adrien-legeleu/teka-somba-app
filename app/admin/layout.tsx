import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { redirect } from 'next/navigation';

type AuthPayload = JwtPayload & {
  userId: string;
};

export default async function AdminLayout({
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

  return <>{children}</>;
}
