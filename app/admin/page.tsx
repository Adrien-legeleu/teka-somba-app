import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import AdminClientSide from '../components/admin/AdminClientSite';

export default async function AdminPage() {
  const cookieStore = await cookies(); // ⚠️ IMPORTANT : await ici
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');

  let isAdmin = false;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    isAdmin = !!(payload as any).isAdmin;
  } catch {
    redirect('/login');
  }

  if (!isAdmin) redirect('/');

  return <AdminClientSide />;
}
