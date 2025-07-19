'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ImageUploader({
  onChange,
  defaultImages = [],
}: {
  onChange: (urls: string[]) => void;
  defaultImages?: string[];
}) {
  const [images, setImages] = useState<string[]>(defaultImages);
  const [loadingIndexes, setLoadingIndexes] = useState<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setImages(defaultImages || []);
  }, [defaultImages]);

  async function uploadFiles(files: FileList | File[]) {
    const newImages: string[] = [];
    const uploadingIndexes: number[] = [];

    for (const file of files) {
      const currentIndex = images.length + newImages.length;
      uploadingIndexes.push(currentIndex);
      setLoadingIndexes((prev) => [...prev, currentIndex]);

      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const { url } = await res.json();

      newImages.push(url);
      setLoadingIndexes((prev) => prev.filter((i) => i !== currentIndex));
    }

    const updated = [...images, ...newImages];
    setImages(updated);
    onChange(updated);
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

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  function handleDropImage(index: number) {
    if (draggedIndex === null || draggedIndex === index) return;
    const updated = [...images];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, moved);
    setImages(updated);
    onChange(updated);
    setDraggedIndex(null);
  }

  function removeImage(index: number) {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onChange(updated);
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

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
        {images.map((src, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDropImage(index)}
            className="relative group"
          >
            {loadingIndexes.includes(index) ? (
              <Skeleton className="w-full h-28 rounded-xl" />
            ) : (
              <img
                src={src}
                alt={`img-${index}`}
                className="w-full h-28 object-cover rounded-xl shadow-md border border-gray-200 transition-transform duration-200 group-hover:scale-105"
              />
            )}

            {index === 0 && !loadingIndexes.includes(index) && (
              <div className="absolute top-1 left-1 text-xs bg-primary text-white px-2 py-0.5 rounded-full shadow">
                Couverture
              </div>
            )}

            {!loadingIndexes.includes(index) && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-white/80 hover:bg-red-500 hover:text-white transition rounded-full w-6 h-6 p-0"
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
