import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import Home from '../components/Home/Home';

type AuthPayload = JwtPayload & {
  userId: string;
};

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  let userId: string | null = null;

  if (token) {
    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as AuthPayload;
      userId = payload.userId || null;
    } catch {
      userId = null; // Si le token est invalide
    }
  }

  return (
    <div className="min-h-screen flex justify-start">
      <Home userId={userId} />
    </div>
  );
}
