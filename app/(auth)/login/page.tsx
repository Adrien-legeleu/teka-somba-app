import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import Login from '@/app/components/Form/Login';

export default async function LoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (token) {
    console.log(token, ' 0000000000 ', process.env.JWT_SECRET);
    console.log(jwt.verify(token, process.env.JWT_SECRET!));

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      redirect('/dashboard');
    } catch {
      // token non valide → on affiche la page login normalement
    }
  }

  return <Login />;
}
