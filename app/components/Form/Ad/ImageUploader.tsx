'use client';

import { useRef, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';

type ImageItem = {
  url: string;
  isUploading: boolean;
};

export default function ImageUploader({
  onChange,
  onUploadingChange,
  defaultImages = [],
}: {
  onChange: (urls: string[]) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  defaultImages?: string[];
}) {
  const [images, setImages] = useState<ImageItem[]>(
    defaultImages.map((url) => ({ url, isUploading: false }))
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef(images);
  imagesRef.current = images;

  useEffect(() => {
    const anyUploading = images.some((img) => img.isUploading);
    onUploadingChange?.(anyUploading);
  }, [images, onUploadingChange]);

  const uploadFiles = async (files: FileList | File[]) => {
    const previews = Array.from(files).map((file) => ({
      url: URL.createObjectURL(file),
      isUploading: true,
    }));

    setImages((prev) => {
      const all = [...prev, ...previews];
      imagesRef.current = all;
      return all;
    });

    for (const [i, file] of Array.from(files).entries()) {
      const form = new FormData();
      form.append('file', file);
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: form,
        });
        const { url: uploadedUrl } = await res.json();

        setImages((prev) => {
          const updated = [...prev];
          const previewUrl = previews[i].url;
          const index = updated.findIndex(
            (img) => img.url === previewUrl && img.isUploading
          );
          if (index !== -1) {
            updated[index] = { url: uploadedUrl, isUploading: false };
            imagesRef.current = updated;
            onChange(
              updated.filter((img) => !img.isUploading).map((img) => img.url)
            );
          }
          return updated;
        });
      } catch (error) {
        const previewUrl = previews[i].url;
        setImages((prev) => prev.filter((img) => img.url !== previewUrl));
      }
    }
  };

  const removeImage = (index: number) => {
    const updated = imagesRef.current.filter((_, i) => i !== index);
    setImages(updated);
    imagesRef.current = updated;
    onChange(updated.filter((img) => !img.isUploading).map((img) => img.url));
  };

  return (
    <div className="space-y-3">
      <label className="block font-semibold text-sm">Images *</label>
      <div
        className="border-2 border-dashed border-muted p-6 rounded-xl text-center cursor-pointer hover:border-primary transition"
        onClick={() => inputRef.current?.click()}
      >
        <p className="text-muted-foreground text-sm">
          Cliquez ou glissez vos images ici
        </p>
        <Input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          ref={inputRef}
          onChange={(e) => {
            if (e.target.files) uploadFiles(e.target.files);
          }}
        />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
        {images.map((img, index) => (
          <div key={index} className="relative group">
            {img.isUploading ? (
              <div className="w-full h-28 flex items-center justify-center bg-gray-100 rounded-xl border">
                <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
              </div>
            ) : (
              <img
                src={img.url}
                alt={`Image ${index}`}
                className="w-full h-28 object-cover rounded-xl border shadow-sm"
              />
            )}

            {index === 0 && !img.isUploading && (
              <div className="absolute top-1 left-1 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                Couverture
              </div>
            )}

            {!img.isUploading && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-white/90 hover:bg-red-500 hover:text-white w-6 h-6 rounded-full"
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
