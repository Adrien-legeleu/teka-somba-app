'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { PasswordChangeBlock } from '@/app/components/Profil/MDProfil';

// Interface pour l'utilisateur
interface UserProfile {
  id: string;
  name: string;
  prenom: string;
  email: string;
  city?: string;
  age?: number;
  phone?: string;
  avatar?: string;
  identityCardUrl?: string;
  isVerified?: boolean;
  isRejected?: boolean;
}

export default function ProfilPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<UserProfile>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data: UserProfile) => {
        setUser(data);
        setForm(data);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Erreur lors de la sauvegarde');
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8 text-center">Chargement…</div>;
  if (!user) return <div className="p-8 text-center">Profil introuvable.</div>;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Mon profil</h1>
      <Card className="bg-white/90 backdrop-blur-xl shadow-black/10 rounded-3xl shadow-2xl mb-8">
        <CardContent className="p-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex flex-col items-start gap-2">
              <label className="font-medium text-sm">Photo de profil</label>

              <div className="relative group">
                <label
                  htmlFor="avatar-upload"
                  className="w-24 h-24 rounded-full border border-gray-300 flex items-center justify-center overflow-hidden bg-gray-100 text-gray-500 cursor-pointer hover:ring-2 hover:ring-orange-400 transition"
                >
                  {form.avatar ? (
                    <Image
                      src={form.avatar}
                      alt="Photo de profil"
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-xs text-center px-2">
                      Ajouter une photo
                    </span>
                  )}

                  <div className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-md border group-hover:scale-105 transition">
                    📷
                  </div>
                </label>

                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const formData = new FormData();
                    formData.append('file', file);

                    const res = await fetch('/api/upload', {
                      method: 'POST',
                      body: formData,
                    });

                    const data = await res.json();
                    setForm((prev) => ({ ...prev, avatar: data.url }));
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="prenom"
                value={form.prenom || ''}
                onChange={handleChange}
                placeholder="Prénom"
                required
              />
              <Input
                name="name"
                value={form.name || ''}
                onChange={handleChange}
                placeholder="Nom"
                required
              />
              <Input
                name="city"
                value={form.city || ''}
                onChange={handleChange}
                placeholder="Ville"
              />
              <Input
                name="age"
                value={form.age?.toString() || ''}
                onChange={handleChange}
                type="number"
                placeholder="Âge"
                min={0}
              />
              <Input
                name="phone"
                value={form.phone || ''}
                onChange={handleChange}
                placeholder="Téléphone"
              />
              <Input
                name="email"
                value={form.email || ''}
                readOnly
                disabled
                className="bg-gray-100 text-gray-500 cursor-not-allowed"
                placeholder="Email"
              />
            </div>
            <div className="text-xs text-gray-400">
              Pour changer d’adresse, veuillez supprimer votre compte et en
              recréer un.
            </div>

            {/* Upload carte d'identité */}
            <div>
              <div className="mb-1 font-medium">
                Carte d&apos;identité (photo/scan)
              </div>
              {form.identityCardUrl ? (
                <div className="flex items-center gap-4">
                  <Image
                    src={form.identityCardUrl}
                    alt="Carte d'identité"
                    width={80}
                    height={60}
                    className="rounded-lg border"
                  />
                  <span
                    className={
                      form.isVerified
                        ? 'bg-green-100 text-green-600 px-3 py-1 rounded-xl text-xs'
                        : form.isRejected
                          ? 'bg-red-100 text-red-600 px-3 py-1 rounded-xl text-xs'
                          : 'bg-yellow-100 text-yellow-700 px-3 py-1 rounded-xl text-xs'
                    }
                  >
                    {form.isVerified
                      ? 'Validée'
                      : form.isRejected
                        ? 'Refusée'
                        : 'En attente de validation'}
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-gray-500 text-sm">
                    Aucun fichier ajouté
                  </span>
                </div>
              )}
            </div>

            {success && (
              <div className="bg-green-100 text-green-700 rounded p-2 text-sm">
                Profil mis à jour !
              </div>
            )}
            {error && (
              <div className="bg-red-100 text-red-700 rounded p-2 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-10"
              disabled={saving}
            >
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <PasswordChangeBlock />
    </div>
  );
}
