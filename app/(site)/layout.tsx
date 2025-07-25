// app/(site)/layout.tsx
import Header from '@/app/components/Header/Header';
import { Toaster } from '@/components/ui/sonner';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Toaster />
    </>
  );
}
