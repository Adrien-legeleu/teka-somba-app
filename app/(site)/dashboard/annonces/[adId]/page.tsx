import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import EditAdFormClient from '@/app/components/Form/Ad/EditAdFormClient';

export default async function EditAdPage({
  params,
}: {
  params: { adId: string };
}) {
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

  return <EditAdFormClient userId={userId} adId={params.adId} />;
}
