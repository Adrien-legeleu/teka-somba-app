'use client';

import { Suspense } from 'react';
import Loader from '../Fonctionnalities/Loader';

export default function SuspenseWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<Loader />}>{children}</Suspense>;
}
