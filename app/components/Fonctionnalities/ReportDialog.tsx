'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Flag } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportAdDialog({ adId }: { adId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return toast.error('Choisis une raison');
    setLoading(true);
    const res = await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId, reason, message }),
    });
    if (res.ok) {
      toast.success('Signalement envoyé.');
      setOpen(false);
      setReason('');
      setMessage('');
    } else {
      toast.error('Erreur lors de l’envoi.');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 text-sm">
          <Flag className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl max-w-md w-[90%]  z-[100000000000]">
        <DialogHeader>
          <DialogTitle className="text-orange-600">
            Signaler cette annonce
          </DialogTitle>
          <DialogDescription>
            Cette action est anonyme. L’équipe d’administration analysera ce
            signalement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4  ">
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choisissez une raison" />
            </SelectTrigger>
            <SelectContent className="z-[100000000000]">
              <SelectItem value="INAPPROPRIATE">Contenu inapproprié</SelectItem>
              <SelectItem value="SCAM">Arnaque</SelectItem>
              <SelectItem value="SPAM">Spam</SelectItem>
              <SelectItem value="VIOLENCE">Violence</SelectItem>
              <SelectItem value="OTHER">Autre</SelectItem>
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Message facultatif…"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <DialogFooter className="flex justify-end pt-4">
          <Button disabled={loading || !reason} onClick={handleSubmit}>
            {loading ? 'Envoi…' : 'Envoyer le signalement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
