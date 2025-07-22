'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function InboxPage() {
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/messages/inbox')
      .then((res) => res.json())
      .then(setThreads)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Chargement…</div>;

  if (threads.length === 0)
    return <div className="p-8 text-center">Aucune conversation.</div>;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Mes conversations</h1>
      <div className="space-y-4">
        {threads.map((thread) => (
          <Link
            key={thread.ad.id + '-' + thread.otherUser.id}
            href={`/dashboard/messages/${thread.ad.id}_${thread.otherUser.id}`}
            className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow hover:bg-orange-50 transition group"
          >
            <div className="relative h-16 w-16">
              {thread.ad.images?.[0] ? (
                <Image
                  src={thread.ad.images[0]}
                  fill
                  alt="annonce"
                  className="rounded-xl object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-xl" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="font-semibold">{thread.ad.title}</div>
                <Badge className="ml-2">{thread.otherUser.name}</Badge>
              </div>
              <div className="text-gray-600 text-sm line-clamp-1">
                {thread.lastMessage.content}
              </div>
            </div>
            <div className="text-xs text-gray-400 min-w-[90px] text-right">
              {new Date(thread.lastMessage.createdAt).toLocaleString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
              })}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
