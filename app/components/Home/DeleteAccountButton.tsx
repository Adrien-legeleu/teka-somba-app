// app/components/Account/DeleteAccountButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

export default function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const canDelete = confirm === 'SUPPRIMER';

  const onDelete = async () => {
    if (!canDelete) return;
    setLoading(true);
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Erreur');
      }
      // Redirige vers la home (cookie supprimé côté serveur)
      router.replace('/?account_deleted=1');
      router.refresh();
    } catch (e) {
      alert(
        e instanceof Error
          ? e.message
          : 'Une erreur est survenue lors de la suppression.'
      );
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        className="rounded-full"
        onClick={() => setOpen(true)}
      >
        Supprimer mon compte
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl z-[100000000]">
          <DialogHeader>
            <DialogTitle>Supprimer votre compte</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Cette action est <strong>définitive</strong>. Toutes vos annonces,
              favoris et messages seront supprimés.
            </p>
            <label className="text-sm">
              Tapez{' '}
              <code className="px-2 py-0.5 rounded bg-gray-100">SUPPRIMER</code>{' '}
              pour confirmer :
            </label>
            <input
              className="w-full rounded-xl border px-3 py-2"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="SUPPRIMER"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              className="rounded-full"
              onClick={onDelete}
              disabled={!canDelete || loading}
            >
              {loading ? 'Suppression…' : 'Supprimer définitivement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
