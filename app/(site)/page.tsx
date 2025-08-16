import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import Home from '../components/Home/Home';
import { AdWithMeta } from '@/types/ad';

export const runtime = 'nodejs';

type AuthPayload = JwtPayload & { userId: string };

interface FetchAdsResponse {
  data: AdWithMeta[];
  total: number;
}

const ADS_PER_PAGE = 20;

async function fetchInitialAds(
  userId: string | null
): Promise<FetchAdsResponse> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000');

  const params = new URLSearchParams();
  params.set('page', '1');
  params.set('limit', String(ADS_PER_PAGE));
  if (userId) params.set('userId', userId);

  try {
    const res = await fetch(`${base}/api/ad?${params.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return { data: [], total: 0 };
    return (await res.json()) as FetchAdsResponse;
  } catch {
    return { data: [], total: 0 };
  }
}

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
      userId = null;
    }
  }

  const initial = await fetchInitialAds(userId);

  return (
    <div className="w-full flex justify-start">
      <Home
        userId={userId}
        initialAds={initial.data}
        initialTotal={initial.total}
        initialPage={1}
      />
    </div>
  );
}
