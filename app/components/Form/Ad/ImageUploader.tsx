'use client';

import { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';

type ImageItem = {
  url: string; // preview locale OU url cloud
  isUploading: boolean; // true si upload en cours
};

export default function ImageUploader({
  onChange,
  defaultImages = [],
}: {
  onChange: (urls: string[]) => void;
  defaultImages?: string[];
}) {
  const [images, setImages] = useState<ImageItem[]>(
    (defaultImages || []).map((url) => ({ url, isUploading: false }))
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Pour garder la dernière valeur de images pendant l’async
  const imagesRef = useRef(images);
  imagesRef.current = images;

  async function uploadFiles(files: FileList | File[]) {
    const newItems: ImageItem[] = Array.from(files).map((file) => ({
      url: URL.createObjectURL(file), // preview instantanée
      isUploading: true,
    }));

    // Ajoute preview instantanée
    setImages((prev) => {
      const all = [...prev, ...newItems];
      imagesRef.current = all;
      return all;
    });

    // Pour chaque fichier, upload en parallèle et remplace la preview par l’url cloud
    Array.from(files).forEach(async (file, i) => {
      const thisPreviewUrl = newItems[i].url;
      const form = new FormData();
      form.append('file', file);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: form });
        const { url: uploadedUrl } = await res.json();

        setImages((prev) => {
          const idx = prev.findIndex(
            (img) => img.url === thisPreviewUrl && img.isUploading
          );
          if (idx === -1) return prev;
          const updated = [...prev];
          updated[idx] = { url: uploadedUrl, isUploading: false };
          imagesRef.current = updated;
          // Notifie le parent dès que l’upload est fini (ne remonte QUE les url uploadées)
          onChange(updated.filter((i) => !i.isUploading).map((i) => i.url));
          return updated;
        });
      } catch (e) {
        // Si upload fail, retire la preview
        setImages((prev) => prev.filter((img) => img.url !== thisPreviewUrl));
      }
    });
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) uploadFiles(e.target.files);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length) uploadFiles(files);
  }

  function handleDragStart(index: number) {
    setDraggedIndex(index);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDropImage(index: number) {
    if (draggedIndex === null || draggedIndex === index) return;
    const updated = [...imagesRef.current];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, moved);
    setImages(updated);
    imagesRef.current = updated;
    onChange(updated.filter((i) => !i.isUploading).map((i) => i.url));
    setDraggedIndex(null);
  }

  function removeImage(index: number) {
    const updated = imagesRef.current.filter((_, i) => i !== index);
    setImages(updated);
    imagesRef.current = updated;
    onChange(updated.filter((i) => !i.isUploading).map((i) => i.url));
  }

  return (
    <div className="space-y-2">
      <label className="block font-semibold">Images</label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => inputRef.current?.click()}
        className="border-dashed border-2 border-muted p-6 rounded-2xl text-center cursor-pointer hover:border-primary transition"
      >
        <p className="text-sm text-muted-foreground">
          Glissez vos images ici ou cliquez pour en ajouter
        </p>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          className="hidden"
          ref={inputRef}
        />
      </div>

      {/* Miniatures */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
        {images.map((img, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDropImage(index)}
            className="relative group"
          >
            {img.isUploading ? (
              <div className="w-full h-28 flex items-center justify-center bg-gray-100 rounded-xl border border-gray-200">
                <Loader2 className="animate-spin w-7 h-7 text-gray-400" />
              </div>
            ) : (
              <img
                src={img.url}
                alt={`img-${index}`}
                className="w-full h-28 object-cover rounded-xl shadow-md border border-gray-200 transition-transform duration-200 group-hover:scale-105"
              />
            )}

            {index === 0 && !img.isUploading && (
              <div className="absolute top-1 left-1 text-xs bg-primary text-white px-2 py-0.5 rounded-full shadow">
                Couverture
              </div>
            )}

            {!img.isUploading && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-white/90 hover:bg-red-500 hover:text-white transition rounded-full w-6 h-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
