import React from 'react';
import { cn } from '@/lib/utils';
import { IconRocket } from '@tabler/icons-react';
interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = 'Button', className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'group relative w-32 cursor-pointer overflow-hidden shadow-2xl shadow-black/10 rounded-full border bg-white p-2 text-center font-semibold',
        className
      )}
      {...props}
    >
      <span className="inline-block translate-x-1 transition-all text-[var(--color-text-primary)] duration-300 group-hover:translate-x-12 group-hover:opacity-0">
        {text}
      </span>
      <div className="absolute bg-[var(--color-primary)]  top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-white opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100">
        <span>{text}</span>
        <IconRocket />
      </div>
      <div className="absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg bg-[var(--color-primary)] transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8] group-hover:bg-[var(--color-primary)]"></div>
    </button>
  );
});

InteractiveHoverButton.displayName = 'InteractiveHoverButton';

export { InteractiveHoverButton };
