'use client';
import { motion, AnimatePresence } from 'framer-motion';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Switch } from '@/components/ui/switch';

import CategoryPicker from './CategoryPicker';
import DynamicFieldsSection from './DynamicFieldsSection';
import ImageUploader from './ImageUploader';
import LocationPicker from './LocationPicker';
import AdPreview from './AdPreview';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

type Category = {
  id: string;
  name: string;
  parentId: string | null;
  fields?: DynamicField[];
  children: Category[];
};

type DynamicField = {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
};

export default function NewAdForm({ categories }: { categories: Category[] }) {
  // States
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [dynamicFields, setDynamicFields] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState<string>('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  // Fetch champs dynamiques de la catégorie sélectionnée
  //   useEffect(() => {
  //     if (!categoryId) return setDynamicFields([]);
  //     fetch(`/api/categories/${categoryId}/fields`)
  //       .then((r) => r.json())
  //       .then((data) => setDynamicFields(data.fields))
  //       .catch(() => setDynamicFields([]));
  //   }, [categoryId]);

  // Fonction récursive pour trouver la catégorie sélectionnée
  useEffect(() => {
    if (!categoryId) return setDynamicFields([]);

    // Fonction récursive, typée
    function findCategoryById(cats: Category[], id: string): Category | null {
      for (const cat of cats) {
        if (cat.id === id) return cat;
        if (cat.children && cat.children.length) {
          const found = findCategoryById(cat.children, id);
          if (found) return found;
        }
      }
      return null;
    }

    const cat = findCategoryById(categories, categoryId);
    setDynamicFields(cat?.fields || []);
  }, [categoryId, categories]);

  // Schéma Zod minimal côté client (validation basique, la vraie validation est côté backend)
  const zodBase = z.object({
    title: z.string().min(1, 'Titre obligatoire'),
    description: z.string().min(1, 'Description obligatoire'),
    price: z.number().positive('Prix invalide'),
    images: z.array(z.string().url()).min(1, 'Ajoutez au moins une image'),
    location: z.string(),
    lat: z.number().nullable(),
    lng: z.number().nullable(),
    isDon: z.boolean().optional(),
    categoryId: z.string(),
    dynamicFields: z.object({}).catchall(z.unknown()),
  });

  const methods = useForm({
    resolver: zodResolver(zodBase),
    defaultValues: {
      title: '',
      isDon: false,
      description: '',
      price: undefined,
      images: [],
      location: '',
      lat: null,
      lng: null,
      categoryId: '',
      dynamicFields: {},
    },
  });

  const { handleSubmit, setValue, watch, formState } = methods;
  console.log('formState.errors', formState.errors);

  // Gère submit
  const onSubmit = async (data: any) => {
    // On récupère la catégorie sélectionnée
    const selectedCat = categories
      .flatMap((cat) => [cat, ...(cat.children || [])])
      .find((cat) => cat.id === (categoryId ?? data.categoryId));
    const expectedDynamicFields = (selectedCat?.fields || []).map(
      (f) => f.name
    );

    // Filtrer les dynamicFields pour n’envoyer QUE ceux qui sont attendus par la catégorie sélectionnée
    const filteredDynamicFields = Object.fromEntries(
      Object.entries(data.dynamicFields || {}).filter(
        ([key, value]) => expectedDynamicFields.includes(key) && value !== ''
      )
    );

    // Puis tu POST comme d’habitude :
    try {
      const res = await fetch('/api/ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          images,
          location,
          lat,
          lng,
          categoryId,
          dynamicFields: filteredDynamicFields, // <= ici la correction !
        }),
      });

      if (res.ok) {
        const { adId } = await res.json();
        toast.success('Annonce créée !');
        window.location.href = `/ads/${adId}`;
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erreur de création');
      }
    } catch (e) {
      toast.error('Erreur inconnue');
    }
  };

  // Pour preview
  // Pour preview et logique bouton
  const watched = watch();
  const isDon = watched.isDon;

  // À chaque changement de "isDon", force le champ price à 0 si don
  useEffect(() => {
    if (isDon) {
      setValue('price', 0, { shouldValidate: true });
    } else if (watched.price === 0) {
      setValue('price', NaN, { shouldValidate: false }); // on laisse vide si décoché
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDon]);
  const isFormValid =
    watched.title.trim().length > 0 && categoryId !== null && images.length > 0;
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid md:grid-cols-3 gap-8"
      >
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* 1. Étape Catégorie + Titre */}
          <CategoryPicker
            categories={categories}
            onSelect={(id) => {
              setCategoryId(id);
              setValue('categoryId', id);
            }}
          />

          <Input
            {...methods.register('title')}
            placeholder="Titre de l'annonce"
          />
          <div className="flex items-center space-x-2">
            <Switch id="don" {...methods.register('isDon')} />
            <Label htmlFor="don">Mettre en don (gratuit)</Label>
          </div>

          <AnimatePresence>
            {categoryId && (
              <motion.div
                key="rest-of-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex flex-col gap-6"
              >
                <Textarea
                  {...methods.register('description')}
                  placeholder="Description détaillée"
                  rows={5}
                />
                <Input
                  {...methods.register('price', { valueAsNumber: true })}
                  type="number"
                  placeholder="Prix (FCFA)"
                  min={0}
                  disabled={isDon}
                />

                {dynamicFields.length > 0 && (
                  <DynamicFieldsSection fields={dynamicFields} />
                )}
                <LocationPicker
                  location={location}
                  setLocation={setLocation}
                  lat={lat}
                  setLat={setLat}
                  lng={lng}
                  setLng={setLng}
                />
                <ImageUploader
                  onChange={(urls) => {
                    setImages(urls);
                    setValue('images', urls, { shouldValidate: true });
                  }}
                />
                <Button
                  type="submit"
                  className="mt-4 w-full"
                  disabled={!isFormValid}
                >
                  Créer l'annonce
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Aperçu : toujours visible (si tu veux le cacher au début aussi, ajoute categoryId ici) */}
        <div className="md:col-span-1">
          <AdPreview
            ad={{
              ...watched,
              images,
              location,
              lat,
              lng,
              categoryId,
            }}
            dynamicFields={dynamicFields}
          />
        </div>
      </form>
    </FormProvider>
  );
}
