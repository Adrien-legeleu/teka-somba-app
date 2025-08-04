'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useMe } from '@/hooks/useMe';
import Link from 'next/link';
import socket from '@/lib/socket';
import Loader from '@/app/components/Fonctionnalities/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar?: string;
  prenom: string;
  email: string;
}

interface Ad {
  id: string;
  title: string;
  images: string[];
}

interface Message {
  id: string;
  adId: string;
  senderId: string;
  content: string;
  createdAt: string;
  receiver?: User;
  sender?: User;
  ad?: Ad;
}

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const rawId =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : '';

  const [adId, otherUserId] = rawId.split('_');

  const [messages, setMessages] = useState<Message[]>([]);
  const [ad, setAd] = useState<Ad | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { me } = useMe();

  // Charger la conversation
  useEffect(() => {
    if (!adId || !otherUserId) return;
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/messages?adId=${adId}&otherUserId=${otherUserId}`
        );
        const data: Message[] = await res.json();
        setMessages(data);

        if (data.length > 0) {
          setAd(data[0].ad ?? null);
          setOtherUser(
            data[0].senderId === me?.id
              ? (data[0].receiver ?? null)
              : (data[0].sender ?? null)
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
    // eslint-disable-next-line
  }, [adId, otherUserId, me?.id]);

  // Scroll auto en bas à chaque message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adId,
          receiverId: otherUserId,
          content: message,
        }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'envoi");

      setMessage('');
      socket.emit('send_message', {
        adId,
        receiverId: otherUserId,
        senderName: me?.prenom || me?.name || 'Quelqu’un',
        content: message,
        createdAt: new Date().toISOString(),
      });

      const updated = await fetch(
        `/api/messages?adId=${adId}&otherUserId=${otherUserId}`
      );
      setMessages(await updated.json());
    } finally {
      setSending(false);
    }
  }

  if (!adId || !otherUserId) {
    return <div className="text-center p-4">Conversation invalide.</div>;
  }

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl mx-auto py-8 px-5 flex flex-col h-[92vh]">
      {/* Bouton retour sticky */}
      <div className="sticky top-0 z-30 flex items-center mb-2 -mx-2 px-2">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-white border border-orange-100 shadow-lg mr-3 hover:bg-orange-50 transition-all active:scale-95"
          aria-label="Retour"
          tabIndex={0}
        >
          <ArrowLeft className="w-6 h-6 text-orange-500" />
        </button>
        {/* Bloc annonce sticky */}
        <div className="flex-1 flex items-center gap-3 bg-gradient-to-b from-white/95 to-transparent py-2 pl-2 pr-3 rounded-3xl shadow-xl border border-orange-100">
          {ad?.images?.[0] ? (
            <Image
              src={ad.images[0]}
              width={54}
              height={54}
              className="rounded-3xl h-12 md:h-16 xl:h-20 w-12 md:w-16 xl:w-20 object-cover border shadow"
              alt="annonce"
            />
          ) : (
            <div className="w-[54px] h-[54px] bg-gray-200 rounded-2xl" />
          )}
          <div className="flex flex-col flex-1 min-w-0">
            <Link
              href={`/annonce/${adId}`}
              className="font-bold text-base sm:text-lg line-clamp-1 hover:underline"
            >
              {ad?.title}
            </Link>
            <div className="text-xs sm:text-sm text-gray-500 mt-1">
              {otherUser?.prenom} {otherUser?.name}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 mt-1">
              {otherUser?.email}
            </div>
          </div>
          {otherUser?.avatar && (
            <Image
              src={otherUser.avatar}
              width={54}
              height={54}
              className="rounded-3xl h-12 md:h-16 xl:h-20 w-12 md:w-16 xl:w-20 object-cover border-2 border-orange-200 shadow"
              alt={otherUser.name}
            />
          )}
        </div>
      </div>

      {/* Fil de messages */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white via-orange-50 to-orange-100/20 rounded-3xl px-3 py-4 mb-2 custom-scroll">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.23, delay: i * 0.01 }}
              className={`flex mb-2 ${
                msg.senderId === me?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[78%] px-5 py-2.5 rounded-3xl shadow
                  ${
                    msg.senderId === me?.id
                      ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-br-md'
                      : 'bg-white border border-orange-100 text-gray-900 rounded-bl-md'
                  }
                `}
              >
                <div className="whitespace-pre-line break-words text-base">
                  {msg.content}
                </div>
                <div
                  className={`text-xs mt-1 text-right ${msg.senderId === me?.id ? 'text-orange-100/80' : 'text-gray-400'}`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Zone de saisie */}
      <form
        className="flex max-sm:flex-col gap-2 items-end px-2"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <Textarea
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Écrire un message…"
          className="flex-1 rounded-3xl border-2 border-orange-100 shadow focus:border-orange-300 resize-none"
        />
        <Button
          type="submit"
          disabled={sending || !message.trim()}
          className="bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white rounded-3xl px-7 py-3 shadow-xl font-bold transition-all"
        >
          {sending ? 'Envoi…' : 'Envoyer'}
        </Button>
      </form>
    </div>
  );
}
