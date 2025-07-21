'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useMe } from '@/hooks/useMe';

export default function ConversationPage() {
  const { id } = useParams(); // Format: [adId]_[otherUserId]
  const [messages, setMessages] = useState<any[]>([]);
  const [ad, setAd] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { me } = useMe();

  const [adId, otherUserId] = id.split('_');

  // Charger la conversation
  useEffect(() => {
    setLoading(true);
    fetch(`/api/messages?adId=${adId}&otherUserId=${otherUserId}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
        if (data.length > 0) {
          setAd(data[0].ad ?? null);
          setOtherUser(
            data[0].senderId === me?.id ? data[0].receiver : data[0].sender
          );
        }
      })
      .finally(() => setLoading(false));
  }, [adId, otherUserId]);

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
      if (!res.ok) throw new Error('Erreur');
      setMessage('');
      // Recharge messages
      fetch(`/api/messages?adId=${adId}&otherUserId=${otherUserId}`)
        .then((res) => res.json())
        .then(setMessages);
    } finally {
      setSending(false);
    }
  }

  if (loading) return <div className="p-8 text-center">Chargement…</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 flex flex-col h-[90vh]">
      <div className="flex items-center gap-3 mb-6">
        {ad?.images?.[0] && (
          <Image
            src={ad.images[0]}
            width={52}
            height={52}
            className="rounded-xl"
            alt="annonce"
          />
        )}
        <div>
          <div className="font-bold">{ad?.title}</div>
          <div className="text-sm text-gray-500">{otherUser?.name}</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded-2xl px-4 py-3 mb-3">
        {messages.map((msg, idx) => (
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
