'use client';

import ResetPasswordContent from '@/app/components/Form/ResetPasswordContent';
import { Suspense } from 'react';

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
