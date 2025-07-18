'use client';
import { cn } from '@/lib/utils';
import React, { ReactNode } from 'react';

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          'transition-bg relative flex h-full flex-col items-center justify-center bg-[var(--color-bg)] text-slate-950 dark:bg-zinc-900',
          className
        )}
        {...props}
      >
        <div
          className="absolute inset-0 overflow-hidden"
          style={
            {
              '--aurora':
                'repeating-linear-gradient(100deg, var(--color-primary)_0%, var(--color-primary)_25%, var(--color-primary)_50%, var(--color-primary)_75%, var(--color-primary)_100%)',
              '--dark-gradient':
                'repeating-linear-gradient(100deg, #000_0%, #000_7%, transparent_10%, transparent_12%, #000_16%)',
              '--white-gradient':
                'repeating-linear-gradient(100deg, #fff_0%, #fff_7%, transparent_10%, transparent_12%, #fff_16%)',
              '--transparent': 'transparent',
              opacity: 0.9,
            } as React.CSSProperties
          }
        >
          <div
            className={cn(
              `after:animate-aurora pointer-events-none absolute -inset-[10px] 
              [background-image:var(--white-gradient),var(--aurora)] 
              [background-size:300%,_200%] 
              [background-position:50%_50%,50%_50%] 
              opacity-50 blur-[10px] invert filter will-change-transform 
              [--aurora:repeating-linear-gradient(100deg,var(--color-primary)_0%,var(--color-primary)_25%,var(--color-primary)_50%,var(--color-primary)_75%,var(--color-primary)_100%)] 
              [--dark-gradient:repeating-linear-gradient(100deg,#000_0%,#000_7%,transparent_10%,transparent_12%,#000_16%)] 
              [--white-gradient:repeating-linear-gradient(100deg,#fff_0%,#fff_7%,transparent_10%,transparent_12%,#fff_16%)] 
              after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] 
              after:[background-size:200%,_100%] after:[background-attachment:fixed] after:mix-blend-difference after:content-[""] 
              dark:[background-image:var(--dark-gradient),var(--aurora)] dark:invert-0 after:dark:[background-image:var(--dark-gradient),var(--aurora)]`,
              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
            )}
          ></div>
        </div>
        {children}
      </div>
    </main>
  );
};
