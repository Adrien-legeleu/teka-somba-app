// components/MobileNavLink.tsx
'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ReactNode } from 'react';

export default function MobileNavLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const router = useRouter();

  // astuce: on laisse Next faire la nav client, puis on rafraîchit l'arbre RSC
  const onClick = () => {
    // Laisse Link gérer la nav; on déclenche un refresh juste après la transition
    // (requestAnimationFrame évite le refresh trop tôt)
    requestAnimationFrame(() => router.refresh());
  };

  return (
    <Link href={href} prefetch className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
