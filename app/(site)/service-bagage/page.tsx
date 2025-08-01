'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function BaggageServicePage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    quantity: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const res = await fetch('/api/baggage-request', {
      method: 'POST',
      body: JSON.stringify(form),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', message: '', quantity: '' });
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Service de bagage</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-3xl shadow-xl border"
      >
        <Input
          name="name"
          placeholder="Votre nom"
          value={form.name}
          onChange={handleChange}
          required
        />
        <Input
          name="email"
          type="email"
          placeholder="Votre e-mail"
          value={form.email}
          onChange={handleChange}
          required
        />
        <Input
          name="phone"
          placeholder="Votre numéro"
          value={form.phone}
          onChange={handleChange}
          required
        />
        <Input
          name="quantity"
          type="number"
          placeholder="Nombre de colis"
          value={form.quantity}
          onChange={handleChange}
          required
        />
        <Textarea
          name="message"
          placeholder="Décrivez ce que vous souhaitez envoyer"
          value={form.message}
          onChange={handleChange}
          required
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Envoi en cours...' : 'Envoyer la demande'}
        </Button>

        {success && (
          <p className="text-green-600 text-sm text-center">
            ✅ Votre demande a bien été envoyée, un agent vous contactera.
          </p>
        )}
      </form>
    </div>
  );
}
