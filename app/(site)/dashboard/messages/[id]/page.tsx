'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useMe } from '@/hooks/useMe';

interface User {
  id: string;
  name: string;
  avatar?: string;
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
    if (!adId || !otherUserId) return; // On ne fait rien si les IDs sont invalides
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
  }, [adId, otherUserId, me?.id]);

  // Scroll auto en bas
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
      const updated = await fetch(
        `/api/messages?adId=${adId}&otherUserId=${otherUserId}`
      );
      setMessages(await updated.json());
    } finally {
      setSending(false);
    }
  }

  // Condition de rendu APRÈS tous les hooks
  if (!adId || !otherUserId) {
    return <div className="text-center p-4">Conversation invalide.</div>;
  }

  if (loading) return <div className="p-8 text-center">Chargement…</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 flex flex-col h-[90vh]">
      <div className="flex items-center gap-3 mb-6">
        {ad?.images?.[0] ? (
          <Image
            src={ad.images[0]}
            width={52}
            height={52}
            className="rounded-xl"
            alt="annonce"
          />
        ) : (
          <div className="w-[52px] h-[52px] bg-gray-200 rounded-xl" />
        )}
        <div>
          <div className="font-bold">{ad?.title}</div>
          <div className="text-sm text-gray-500">{otherUser?.name}</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded-2xl px-4 py-3 mb-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 flex ${msg.senderId === me?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[60%] px-4 py-2 rounded-xl ${
                msg.senderId === me?.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-white border'
              }`}
            >
              {msg.content}
              <div className="text-xs text-gray-300 mt-1 text-right">
                {new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <Textarea
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Écrire un message…"
          className="flex-1"
        />
        <Button
          onClick={sendMessage}
          disabled={sending || !message.trim()}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6"
        >
          Envoyer
        </Button>
      </div>
    </div>
  );
}
