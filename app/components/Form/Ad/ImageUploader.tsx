'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Loader2, Crop, GripVertical, Star } from 'lucide-react';
import { IconPennant, IconPennantFilled } from '@tabler/icons-react';
import { supabase } from '@/lib/supabase';
import Cropper, { type Area, type Point } from 'react-easy-crop';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';

type ImageItem = {
  url: string; // URL publique supabase OU preview local
  isUploading: boolean; // état d’upload
};

type Props = {
  onChange: (urls: string[]) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  defaultImages?: string[];
};

export default function ImageUploader({
  onChange,
  onUploadingChange,
  defaultImages = [],
}: Props) {
  const [images, setImages] = useState<ImageItem[]>(
    defaultImages.map((url) => ({ url, isUploading: false }))
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const draggingIndexRef = useRef<number | null>(null);

  useEffect(() => {
    onUploadingChange?.(images.some((img) => img.isUploading));
  }, [images, onUploadingChange]);

  /* ──────────────────────────────
   *  Compression + redimension avant upload
   * ────────────────────────────── */
  const downscaleImage = useCallback(async (file: File, maxSize = 1600) => {
    const dataUrl = await fileToDataURL(file);
    const img = await loadImage(dataUrl);
    const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * ratio);
    canvas.height = Math.round(img.height * ratio);
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((res) =>
      canvas.toBlob((b) => res(b as Blob), 'image/jpeg', 0.82)
    );
  }, []);

  /* ──────────────────────────────
   *  Upload Supabase (bucket public "images")
   * ────────────────────────────── */
  const uploadToSupabase = useCallback(async (blob: Blob, ext = 'jpg') => {
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from('images')
      .upload(fileName, blob);
    if (error) return null;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${fileName}`;
  }, []);

  /* ──────────────────────────────
   *  Ajout / upload fichiers
   * ────────────────────────────── */
  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const previews = Array.from(files).map((f) => ({
        url: URL.createObjectURL(f),
        isUploading: true,
      }));
      setImages((p) => [...p, ...previews]);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const processed = await downscaleImage(file);
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
        const publicUrl = await uploadToSupabase(processed, ext);
        if (!publicUrl) {
          setImages((prev) =>
            prev.filter((img) => img.url !== previews[i].url)
          );
          continue;
        }
        setImages((prev) => {
          const copy = [...prev];
          const idx = copy.findIndex(
            (img) => img.url === previews[i].url && img.isUploading
          );
          if (idx !== -1) copy[idx] = { url: publicUrl, isUploading: false };
          onChange(copy.filter((im) => !im.isUploading).map((im) => im.url));
          return copy;
        });
      }
    },
    [downscaleImage, uploadToSupabase, onChange]
  );

  const removeImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      onChange(updated.filter((im) => !im.isUploading).map((im) => im.url));
      return updated;
    });
  };

  /* ──────────────────────────────
   *  Drag & Drop réordonnancement
   * ────────────────────────────── */
  const onDragStart = (idx: number) => (e: React.DragEvent) => {
    draggingIndexRef.current = idx;
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDrop = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const from = draggingIndexRef.current;
    draggingIndexRef.current = null;
    if (from === null || from === idx) return;
    setImages((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(from, 1);
      copy.splice(idx, 0, moved);
      onChange(copy.filter((im) => !im.isUploading).map((im) => im.url));
      return copy;
    });
  };

  const setAsCover = (index: number) => {
    setImages((prev) => {
      if (index === 0) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(index, 1);
      copy.unshift(moved);
      onChange(copy.filter((im) => !im.isUploading).map((im) => im.url));
      return copy;
    });
  };

  /* ──────────────────────────────
   *  Crop (recadrage)
   * ────────────────────────────── */
  const [cropOpen, setCropOpen] = useState(false);
  const [cropIdx, setCropIdx] = useState<number | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const confirmCrop = useCallback(async () => {
    if (cropIdx === null || !croppedAreaPixels) return;
    const srcUrl = images[cropIdx]?.url;
    if (!srcUrl) return;
    const originalBlob = await fetch(srcUrl).then((r) => r.blob());
    const dataUrl = await blobToDataURL(originalBlob);
    const croppedBlob = await getCroppedBlob(dataUrl, croppedAreaPixels);
    const publicUrl = await uploadToSupabase(croppedBlob, 'jpg');
    if (!publicUrl) return;
    setImages((prev) => {
      const copy = [...prev];
      copy[cropIdx] = { url: publicUrl, isUploading: false };
      onChange(copy.filter((im) => !im.isUploading).map((im) => im.url));
      return copy;
    });
    setCropOpen(false);
    setCropIdx(null);
  }, [cropIdx, croppedAreaPixels, images, uploadToSupabase, onChange]);

  /* ──────────────────────────────
   *  Rendu
   * ────────────────────────────── */
  return (
    <div className="space-y-4">
      <label className="block font-semibold text-sm">Images *</label>

      {/* Drop zone */}
      <div
        className="rounded-3xl border-2 border-dashed border-muted p-6 text-center cursor-pointer hover:border-primary transition"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
        }}
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

      {/* Grille responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((img, index) => (
          <div
            key={index}
            className="relative group rounded-3xl overflow-hidden border bg-white select-none cursor-grab active:cursor-grabbing"
            draggable
            onDragStart={onDragStart(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop(index)}
          >
            {/* poignée drag (toujours visible en mobile) */}
            <div className="absolute left-2 top-2 z-10">
              <div className="px-2 py-1 rounded-2xl bg-white/90 shadow border flex items-center gap-1 text-[11px] sm:opacity-0 sm:group-hover:opacity-100 transition">
                <GripVertical className="w-3.5 h-3.5" />
                Glisser
              </div>
            </div>

            {/* badge couverture */}
            {index === 0 && !img.isUploading && (
              <div className="absolute right-2 top-2 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1 shadow">
                <Star className="w-3 h-3" /> Couverture
              </div>
            )}

            {/* contenu */}
            {img.isUploading ? (
              <div className="w-full aspect-square grid place-items-center bg-gray-50">
                <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
              </div>
            ) : (
              <Image
                src={asThumb(img.url, 640, 640)} // carré pour cohérence UI
                alt={`Image ${index}`}
                width={1000}
                height={1000}
                className="w-full aspect-square object-cover rounded-3xl"
                loading="lazy"
                decoding="async"
              />
            )}

            {/* barre d’actions (mobile : visible, desktop : au survol) */}
            {!img.isUploading && (
              <div className="absolute inset-x-2 bottom-2 z-10 rounded-3xl bg-white/95 backdrop-blur-sm border shadow-sm p-2 flex items-center justify-between sm:opacity-0 sm:group-hover:opacity-100 transition">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAsCover(index)}
                  className="rounded-2xl max-sm:p-1"
                  title={
                    index === 0 ? 'Déjà en couverture' : 'Mettre en couverture'
                  }
                >
                  {index === 0 ? (
                    <IconPennantFilled className="sm:w-4 sm:h-4 h-2 w-2" />
                  ) : (
                    <IconPennant className="sm:w-4 sm:h-4 h-2 w-2" />
                  )}
                </Button>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl max-sm:p-1"
                    onClick={() => {
                      setCropIdx(index);
                      setCropOpen(true);
                    }}
                  >
                    <Crop className="sm:w-4 sm:h-4 h-2 w-2" />
                  </Button>

                  <Button
                    variant="destructive"
                    className="rounded-2xl max-sm:p-1"
                    title="Supprimer"
                    onClick={() => removeImage(index)}
                  >
                    <X className="sm:w-4 sm:h-4 h-2 w-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dialog de recadrage (responsive) */}
      <Dialog open={cropOpen} onOpenChange={setCropOpen}>
        <DialogContent className="z-[100000000] w-[95vw] sm:max-w-[820px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>Recadrer l’image</DialogTitle>
          </DialogHeader>

          <div className="relative w-full h-[55vh] sm:h-[60vh] rounded-3xl overflow-hidden bg-black/5">
            {cropOpen && (
              <Cropper
                image={cropIdx !== null ? images[cropIdx]?.url : undefined}
                crop={crop}
                zoom={zoom}
                rotation={0}
                minZoom={1}
                maxZoom={3}
                zoomSpeed={0.1}
                aspect={1 / 1} // carré par défaut pour homogénéité
                cropShape="rect"
                objectFit="contain"
                showGrid={false}
                restrictPosition={true}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedPixels) =>
                  setCroppedAreaPixels(croppedPixels)
                }
                /* props additionnelles pour compat types stricts */
                style={{
                  containerStyle: {
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                  },
                  mediaStyle: {},
                  cropAreaStyle: {},
                }}
                classes={{
                  containerClassName: '',
                  mediaClassName: '',
                  cropAreaClassName: '',
                }}
                mediaProps={{ crossOrigin: 'anonymous' }}
              />
            )}
          </div>

          <div className="py-3">
            <div className="text-xs mb-1">Zoom</div>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.05}
              onValueChange={(v) => setZoom(v[0] ?? 1)}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => setCropOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={confirmCrop}
              className="rounded-2xl text-white"
              style={{ background: 'linear-gradient(90deg, #ff7a00, #ff3c00)' }}
            >
              Valider le recadrage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ───────────────────────── Helpers ───────────────────────── */

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/** Transforme une URL Supabase en thumbnail optimisé (fit=crop + webp) */
function asThumb(url: string, width = 640, height = 640, quality = 70): string {
  try {
    const u = new URL(url);
    if (u.pathname.startsWith('/storage/v1/object/public/')) {
      u.searchParams.set('width', String(width));
      u.searchParams.set('height', String(height));
      u.searchParams.set('fit', 'cover');
      u.searchParams.set('quality', String(quality));
      u.searchParams.set('format', 'webp');
      return u.toString();
    }
    return url;
  } catch {
    return url;
  }
}

/** Recadre un dataURL selon une zone en px, renvoie un Blob jpeg */
async function getCroppedBlob(imageDataUrl: string, crop: Area): Promise<Blob> {
  const img = await loadImage(imageDataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(crop.width));
  canvas.height = Math.max(1, Math.round(crop.height));
  const ctx = canvas.getContext('2d');
  ctx?.drawImage(
    img,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );
  return await new Promise<Blob>((res) =>
    canvas.toBlob((b) => res(b as Blob), 'image/jpeg', 0.9)
  );
}
