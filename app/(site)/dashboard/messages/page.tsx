'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';

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

export default function InboxPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/messages/inbox')
      .then((res) => res.json())
      .then((data: Thread[]) => setThreads(data))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(adId: string, otherUserId: string) {
    const confirmDelete = window.confirm('Supprimer cette conversation ?');
    if (!confirmDelete) return;

    const res = await fetch('/api/messages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId, otherUserId }),
    });

    if (res.ok) {
      setThreads((prev) =>
        prev.filter(
          (t) => !(t.ad.id === adId && t.otherUser.id === otherUserId)
        )
      );
    } else {
      alert('Erreur lors de la suppression.');
    }
  }

  if (loading) return <div className="p-8 text-center">Chargement…</div>;

  if (threads.length === 0)
    return (
      <div className="text-gray-500 h-screen flex text-center items-center justify-center p-8">
        Aucune conversation.
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Mes conversations</h1>
      <div className="space-y-4">
        {threads.map((thread) => (
          <div
            key={`${thread.ad.id}-${thread.otherUser.id}`}
            className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow hover:bg-orange-50 transition group"
          >
            <Link
              href={`/dashboard/messages/${thread.ad.id}_${thread.otherUser.id}`}
              className="flex items-center w-full flex-col gap-4 "
            >
              <div className="w-full flex justify-between items-start">
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
                <Badge className="ml-2">{thread.otherUser.prenom}</Badge>
              </div>
              <div className="flex-1 flex-col items-start jusitfy-start">
                <div className="flex items-center gap-2">
                  <div className="font-semibold max-wm:text-sm">
                    {thread.ad.title}
                  </div>
                </div>
                <div className="text-gray-600 text-sm line-clamp-1">
                  {thread.lastMessage.content}
                </div>
                <div className="text-xs text-gray-400 min-w-[90px] text-left">
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
            <button
              onClick={() => handleDelete(thread.ad.id, thread.otherUser.id)}
              className="text-gray-400  hover:text-red-500 p-2"
              title="Supprimer"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
