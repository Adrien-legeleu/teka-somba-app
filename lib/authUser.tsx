// /lib/authUser.ts
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function getUserIdFromRequest(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return payload.userId || null;
  } catch {
    return null;
  }
}
