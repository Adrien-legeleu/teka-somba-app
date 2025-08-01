'use client';
import Link from 'next/link';
import { Heart, MessageCircle, UserCircle } from 'lucide-react';
import { motion, LayoutGroup } from 'framer-motion';
import { usePathname } from 'next/navigation';

const icons = [
  { href: '/dashboard/favoris', Icon: Heart },
  { href: '/dashboard/messages', Icon: MessageCircle },
  { href: '/dashboard', Icon: UserCircle },
];

export default function DashboardNav({ hasUnread }: { hasUnread: boolean }) {
  const pathname = usePathname();
  const activeIndex = icons.findIndex((i) => i.href === pathname);

  return (
    <LayoutGroup>
      <nav className="relative flex items-center justify-center lg:gap-2 ap-1 bg-white rounded-full border border-gray-200  px-1 py-1 shadow-sm">
        {icons.map((x, i) => {
          const Icon = x.Icon;
          const isActive = i === activeIndex;
          return (
            <Link key={i} href={x.href} className="relative z-10">
              <div className="p-3 grid place-items-center cursor-pointer">
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 border border-gray-200/80 rounded-full shadow-black/20 shadow-2xl bg-white"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  className={`lg:w-6 lg:h-6 h-5 w-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-orange-500' : 'text-orange-500'
                  } ${x.href === '/dashboard/messages' && hasUnread ? 'animate-bounce' : ''}`}
                />
                {x.href === '/dashboard/messages' && hasUnread && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </LayoutGroup>
  );
}
