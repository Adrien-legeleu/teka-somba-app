'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { AuroraBackground } from '@/components/ui/aurora-background';

export default function SupportPage() {
  const [form, setForm] = useState({ subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Erreur lors de l’envoi');
      setSuccess(true);
      setForm({ subject: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-start">
      <div className="w-full max-w-5xl mx-auto  px-2 mt-20 md:px-0">
        {/* Header */}
        <div className="bg-white/90 border backdrop-blur-xl p-10 rounded-3xl shadow-2xl shadow-black/10 mb-8">
          <h1 className="text-3xl font-bold mb-2">Aide & support</h1>
          <p className="text-gray-600">
            Besoin d'aide ? Consultez la FAQ ou contactez-nous directement.
          </p>
        </div>

        {/* FAQ - Accordion */}
        <div className="bg-white/90 border backdrop-blur-xl p-10 rounded-3xl shadow-2xl shadow-black/10 mb-8">
          <div className="font-semibold text-lg mb-4">
            FAQ (Questions fréquentes)
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Comment déposer une annonce ?</AccordionTrigger>
              <AccordionContent>
                Cliquez sur le bouton orange « Déposer une annonce » en haut du
                site. Remplissez le formulaire, ajoutez vos photos et validez.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                Comment modifier ou supprimer mon annonce ?
              </AccordionTrigger>
              <AccordionContent>
                Rendez-vous dans « Mes annonces » sur votre tableau de bord,
                puis cliquez sur l’icône d’édition ou de suppression à côté de
                votre annonce.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                Comment changer mon mot de passe ?
              </AccordionTrigger>
              <AccordionContent>
                Allez dans la section « Profil », cliquez sur « Modifier », puis
                suivez la procédure pour changer votre mot de passe en toute
                sécurité.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>
                J’ai un problème de paiement, que faire ?
              </AccordionTrigger>
              <AccordionContent>
                Contactez-nous via le formulaire ci-dessous en indiquant le
                numéro de l’annonce concernée. Notre équipe traitera votre
                demande sous 24h.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>
                Comment signaler un utilisateur ou une annonce ?
              </AccordionTrigger>
              <AccordionContent>
                Utilisez le bouton « Signaler » sur la page de l’annonce ou
                contactez-nous directement en précisant les détails du problème.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Formulaire de contact support */}
        <div className="bg-white/90 border backdrop-blur-xl p-10 rounded-3xl shadow-2xl shadow-black/10 mb-8">
          <div className="font-semibold text-lg mb-4">Contacter le support</div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              name="subject"
              placeholder="Sujet (ex: Problème de paiement, question sur un compte, etc.)"
              value={form.subject}
              onChange={handleChange}
              required
              className="rounded-xl"
              disabled={loading}
            />
            <Textarea
              name="message"
              placeholder="Décrivez votre problème ou question…"
              rows={4}
              value={form.message}
              onChange={handleChange}
              required
              className="rounded-xl"
              disabled={loading}
            />
            {success && (
              <div className="bg-green-100 text-green-700 rounded-xl p-3 text-sm">
                Votre demande a bien été envoyée ! Un membre de notre équipe
                vous répondra rapidement par mail.
              </div>
            )}
            {error && (
              <div className="bg-red-100 text-red-700 rounded-xl p-3 text-sm">
                {error}
              </div>
            )}
            <Button
              type="submit"
              disabled={loading || !form.subject.trim() || !form.message.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-8"
            >
              {loading ? 'Envoi…' : 'Envoyer'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
