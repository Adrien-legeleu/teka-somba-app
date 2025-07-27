// /lib/authUser.ts
import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';

type TokenPayload = JwtPayload & {
  userId?: string;
};

export async function getUserIdFromRequest(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    return payload.userId ?? null;
  } catch {
    return null;
  }
}
