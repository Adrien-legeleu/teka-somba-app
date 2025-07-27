import { useState, ChangeEvent, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function PasswordChangeBlock() {
  const [form, setForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(false);
    setError(null);

    if (form.newPassword !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur');
      }
      setSuccess(true);
      setForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white/90 rounded-3xl shadow-2xl shadow-black/10 border mt-12 mb-4 p-8">
      <div className="font-semibold text-xl mb-3">Changer mon mot de passe</div>
      <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
        <Input
          name="currentPassword"
          type="password"
          value={form.currentPassword}
          onChange={handleChange}
          placeholder="Mot de passe actuel"
          autoComplete="current-password"
          required
        />
        <Input
          name="newPassword"
          type="password"
          value={form.newPassword}
          onChange={handleChange}
          placeholder="Nouveau mot de passe"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <Input
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Confirmer le nouveau mot de passe"
          autoComplete="new-password"
          minLength={8}
          required
        />
        {success && (
          <div className="bg-green-100 text-green-700 rounded p-2 text-sm">
            Mot de passe modifié avec succès.
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
          disabled={loading}
        >
          {loading ? 'Changement…' : 'Changer le mot de passe'}
        </Button>
      </form>
    </div>
  );
}
