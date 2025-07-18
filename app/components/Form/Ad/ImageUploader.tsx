import { useState } from 'react';
import { Input } from '@/components/ui/input';

export default function ImageUploader({
  onChange,
}: {
  onChange: (urls: string[]) => void;
}) {
  const [previews, setPreviews] = useState<string[]>([]);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const urls: string[] = [];

    for (const file of files) {
      // Appelle ton endpoint d'upload vers Vercel Blob ici, et récupère l'URL retournée :
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const { url } = await res.json();
      urls.push(url);
    }

    setPreviews(urls);
    onChange(urls);
  }

  return (
    <div>
      <label>Images (1 à 5)</label>
      <Input type="file" multiple accept="image/*" onChange={handleChange} />
      <div className="flex gap-2 mt-2">
        {previews.map((src, i) => (
          <img
            src={src}
            alt={`preview-${i}`}
            key={i}
            className="w-16 h-16 rounded object-cover"
          />
        ))}
      </div>
    </div>
  );
}
