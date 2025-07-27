import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import EditAdFormClient from '@/app/components/Form/Ad/EditAdFormClient';

type AuthPayload = JwtPayload & {
  userId: string;
};

export default async function EditAdPage({
  params,
}: {
  params: { adId: string };
}) {
  // cookies() est synchrone dans l'app router, pas besoin de await
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

  return <EditAdFormClient userId={userId} adId={params.adId} />;
}
