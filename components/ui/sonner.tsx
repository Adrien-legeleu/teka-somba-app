// app/(...)/Toaster.tsx
'use client';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

export function Toaster(props: ToasterProps) {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      toastOptions={{
        // soit on force avec !important
        classNames: {
          toast:
            'rounded-3xl !rounded-3xl border border-black/5 shadow-lg shadow-black/5',
        },
      }}
      {...props}
    />
  );
}
