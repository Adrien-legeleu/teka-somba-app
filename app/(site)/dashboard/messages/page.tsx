'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import Loader from '@/app/components/Fonctionnalities/Loader';
import { AnimatePresence, motion } from 'framer-motion';

interface Ad {
  id: string;
  title: string;
  images: string[];
}

interface User {
  id: string;
  name: string;
  prenom: string;
  avatar?: string;
}

interface Message {
  content: string;
  createdAt: string;
}

interface Thread {
  ad: Ad;
  otherUser: User;
  lastMessage: Message;
}

const THREADS_PER_PAGE = 15;

export default function InboxPage() {
  const [allThreads, setAllThreads] = useState<Thread[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // 1. Récupère tous les threads au chargement
  useEffect(() => {
    localStorage.setItem('messagesSeen', 'true');
    fetch('/api/messages/inbox')
      .then((res) => res.json())
      .then((data: Thread[]) => {
        setAllThreads(data || []);
        setThreads((data || []).slice(0, THREADS_PER_PAGE));
        setHasMore((data || []).length > THREADS_PER_PAGE);
      })
      .finally(() => setLoading(false));
  }, []);

  // 2. Infinite scroll (ajoute les threads suivants par page)
  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setThreads((prev) => {
            const next = allThreads.slice(0, prev.length + THREADS_PER_PAGE);
            setHasMore(next.length < allThreads.length);
            return next;
          });
          setPage((p) => p + 1);
        }
      },
      { rootMargin: '300px' }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [allThreads, hasMore]);

  // 3. Suppression animée
  async function handleDelete(adId: string, otherUserId: string) {
    const confirmDelete = window.confirm('Supprimer cette conversation ?');
    if (!confirmDelete) return;

    const res = await fetch('/api/messages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId, otherUserId }),
    });

    if (res.ok) {
      setAllThreads((prev) =>
        prev.filter(
          (t) => !(t.ad.id === adId && t.otherUser.id === otherUserId)
        )
      );
      setThreads((prev) =>
        prev.filter(
          (t) => !(t.ad.id === adId && t.otherUser.id === otherUserId)
        )
      );
    } else {
      alert('Erreur lors de la suppression.');
    }
  }

  if (loading) return <Loader />;

  if (!threads.length)
    return (
      <div className="text-gray-500 h-screen flex text-center items-center justify-center p-8">
        Aucune conversation.
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto py-10 px-2 sm:px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Mes conversations</h1>
      <div className="flex flex-col gap-6">
        <AnimatePresence initial={false}>
          {threads.map((thread) => (
            <motion.div
              key={`${thread.ad.id}-${thread.otherUser.id}`}
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.93 }}
              transition={{ duration: 0.22 }}
              className="flex items-center gap-4 p-5 bg-white rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.015] hover:bg-orange-50/80 transition group border border-orange-100"
            >
              <Link
                href={`/dashboard/messages/${thread.ad.id}_${thread.otherUser.id}`}
                className="flex items-center w-full gap-4 min-w-0"
              >
                <div className="relative h-20 w-20 shrink-0">
                  {thread.ad.images?.[0] ? (
                    <Image
                      src={thread.ad.images[0]}
                      fill
                      alt="annonce"
                      className="rounded-3xl object-cover border-2 border-orange-100"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-2xl" />
                  )}
                </div>
                <div className="flex flex-col justify-center flex-1 min-w-0">
                  <div className="flex gap-3 items-center mb-1">
                    <span className="font-bold text-lg truncate">
                      {thread.ad.title}
                    </span>
                    <Badge className="ml-1 text-xs animate-pulse bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl px-3 py-1 text-white shadow">
                      {thread.otherUser.prenom}
                    </Badge>
                  </div>
                  <div className="text-gray-700 text-sm truncate max-w-[250px] sm:max-w-none">
                    {thread.lastMessage.content}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(thread.lastMessage.createdAt).toLocaleString(
                      'fr-FR',
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                      }
                    )}
                  </div>
                </div>
              </Link>
              <motion.button
                whileTap={{ scale: 0.85, rotate: -10 }}
                onClick={() => handleDelete(thread.ad.id, thread.otherUser.id)}
                className="text-gray-400 hover:text-red-500 p-2 ml-2 bg-gray-100 hover:bg-red-100 rounded-full transition"
                title="Supprimer"
              >
                <Trash2 className="w-6 h-6" />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
        {/* Infinite loader */}
        {threads.length < allThreads.length && (
          <div
            ref={loaderRef}
            className="h-16 flex items-center justify-center"
          >
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
}
