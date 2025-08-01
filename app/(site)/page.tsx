import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import Home from '../components/Home/Home';
import { Suspense } from 'react';
export const runtime = 'nodejs';

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
    <div className=" w-full flex justify-start">
      <Suspense>
        <Home userId={userId} />
      </Suspense>
    </div>
  );
}
