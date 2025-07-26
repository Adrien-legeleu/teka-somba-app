'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import clsx from 'clsx';

type Props = {
  userId: string;
  adId: string;
  onDeleted?: () => void;
  className?: string;
};

export default function DeleteAdButton({
  userId,
  adId,
  onDeleted,
  className,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Supprimer cette annonce ?')) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/ad/user/${userId}/${adId}`, {
        method: 'DELETE',
      });
      setLoading(false);

      if (res.ok) {
        toast.success('Annonce supprimée');
        onDeleted?.();
      } else {
        const error = await res.json().catch(() => ({}));
        toast.error(error?.error || 'Erreur à la suppression');
      }
    } catch {
      toast.error('Erreur de connexion');
      setLoading(false);
    }
  };

  return (
    <button
      aria-label="Supprimer l’annonce"
      onClick={handleDelete}
      disabled={loading}
      className={clsx(
        'delete-button  relative p-2 bg-transparent cursor-pointer transition-transform duration-200 disabled:opacity-50',
        className
      )}
    >
      <svg
        className="trash-svg w-10 h-10"
        viewBox="0 -10 64 74"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g id="trash-can">
          <rect
            x="16"
            y="24"
            width="32"
            height="30"
            rx="3"
            ry="3"
            fill="#e74c3c"
          ></rect>
          <g transform-origin="12 18" id="lid-group">
            <rect
              x="12"
              y="12"
              width="40"
              height="6"
              rx="2"
              ry="2"
              fill="#c0392b"
            ></rect>
            <rect
              x="26"
              y="8"
              width="12"
              height="4"
              rx="2"
              ry="2"
              fill="#c0392b"
            ></rect>
          </g>
        </g>
      </svg>
    </button>
  );
}
