import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Home from './components/Home/Home';
import { AuroraBackground } from '@/components/ui/aurora-background';

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  let payload;
  try {
    if (token) payload = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {}

  const userId = payload ? (payload as any).userId : null;

  return (
    <AuroraBackground className="min-h-screen flex justify-start">
      <Home userId={userId ?? null} />
    </AuroraBackground>
  );
}
