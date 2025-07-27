// app/(site)/layout.tsx
import Header from '@/app/components/Header/Header';
import { Toaster } from '@/components/ui/sonner';
import { Suspense } from 'react';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<div>Chargement...</div>}>
        <Header />
      </Suspense>
      <main>{children}</main>
      <Toaster />
    </>
  );
}
