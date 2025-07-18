import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'edge'; // obligatoire avec Vercel Blob !

export async function POST(req: NextRequest) {
  // Récupère le fichier du formulaire
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 });
  }

  // Upload sur Vercel Blob
  const blob = await put(file.name, file, {
    access: 'public', // ou 'private'
    addRandomSuffix: true,
  });

  return NextResponse.json({ url: blob.url });
}
