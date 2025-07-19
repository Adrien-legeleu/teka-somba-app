import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import EditAdForm from '@/app/components/Form/Ad/EditAdForm';

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

  // Fetch catégories
  const categoriesRes = await fetch(
    process.env.NEXT_PUBLIC_SITE_URL + '/api/categories',
    { cache: 'no-store' }
  );
  const categories = await categoriesRes.json();

  // Fetch l'annonce existante (en passant userId dans l’URL)
  const adRes = await fetch(
    process.env.NEXT_PUBLIC_SITE_URL + `/api/ad/user/${userId}/${params.adId}`,
    { cache: 'no-store' }
  );
  if (!adRes.ok) redirect('/dashboard/mes-annonces'); // annonce pas trouvée ou pas à toi
  const ad = await adRes.json();

  return <EditAdForm ad={ad} categories={categories} userId={userId} />;
}
