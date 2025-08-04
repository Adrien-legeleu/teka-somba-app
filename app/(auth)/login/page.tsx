import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import Login from '@/app/components/Form/Login';

export default async function LoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      redirect('/dashboard');
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.error('⚠️ Token expiré');
      } else if (error instanceof jwt.JsonWebTokenError) {
        console.error('❌ Token invalide :', error.message);
      } else if (error instanceof Error) {
        console.error('❌ Erreur inconnue :', error.message);
      } else {
        console.error('❌ Erreur inconnue de type inconnu');
      }

      // Supprimer le cookie expiré si nécessaire
      // cookies().delete('token');
    }
  }

  return <Login />;
}
