// app/(auth)/layout.tsx
import { Toaster } from '@/components/ui/sonner';
import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false }, // évite d’indexer /login /signup /reset-password etc.
};
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="min-h-screen">{children}</main>
      <Toaster />
    </>
  );
}
