import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import SignUp from '@/app/components/Form/SignUp';

export default async function SignupPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      redirect('/dashboard');
    } catch {}
  }

  return <SignUp />;
}
