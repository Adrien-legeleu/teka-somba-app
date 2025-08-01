'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function DashboardCard({
  title,
  desc,
  emoji,
  href,
  external = false,
  index = 0,
}: {
  title: string;
  desc: string;
  emoji: string;
  href: string;
  external?: boolean;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
    >
      <Link
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className="group relative border rounded-3xl bg-white p-6 flex flex-col items-start gap-2 shadow-2xl shadow-black/10 hover:scale-[1.03] transition-all min-h-[150px] focus:ring-2 ring-[var(--color-primary)]"
      >
        <div className="rounded-3xl shadow-xl shadow-black/5 bg-[#ffbf00]/20 aspect-square flex items-center justify-center text-3xl p-3">
          {emoji}
        </div>
        <div className="font-semibold text-xl text-[var(--color-secondary)]">
          {title}
        </div>
        <div className="text-gray-500 text-sm">{desc}</div>
        <span className="absolute top-5 right-5 text-[var(--color-accent)] text-xl opacity-0 group-hover:opacity-80 transition-opacity">
          →
        </span>
      </Link>
    </motion.div>
  );
}
