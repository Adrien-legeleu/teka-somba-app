'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import CategoryPicker from './CategoryPicker';
import DynamicFieldsSection from './DynamicFieldsSection';
import ImageUploader from './ImageUploader';
import LocationPicker from './LocationPicker';
import AdPreview from './AdPreview';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

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
    categoryId: z.string(),
    dynamicFields: z.object({}).catchall(z.unknown()),
  });

  const methods = useForm({
    resolver: zodResolver(zodBase),
    defaultValues: {
      title: '',
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
      // ... reste du code

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
  const watched = watch();

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid md:grid-cols-3 gap-8"
      >
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* 1. Catégorie */}
          <CategoryPicker
            categories={categories}
            onSelect={(id) => {
              setCategoryId(id);
              setValue('categoryId', id);
            }}
          />

          {/* 2. Champs communs */}
          <Input
            {...methods.register('title')}
            placeholder="Titre de l'annonce"
          />
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
          />

          {/* 3. Champs dynamiques */}
          {dynamicFields.length > 0 && (
            <DynamicFieldsSection fields={dynamicFields} />
          )}

          {/* 4. Localisation */}
          <LocationPicker
            location={location}
            setLocation={setLocation}
            lat={lat}
            setLat={setLat}
            lng={lng}
            setLng={setLng}
          />

          {/* 5. Upload images */}
          <ImageUploader
            onChange={(urls) => {
              setImages(urls);
              setValue('images', urls, { shouldValidate: true }); // <--- ici ! (update RHF + validation)
            }}
          />

          <button type="submit" className="mt-4 w-full">
            Créer l'annonce
          </button>
        </div>
        {/* 6. Aperçu live */}
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
