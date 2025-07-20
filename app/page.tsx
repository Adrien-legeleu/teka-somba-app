import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Home from './components/Home/Home';

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return;
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {}

  const userId = (payload as any).userId;

  return <Home userId={userId ?? null} />;
}
