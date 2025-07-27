'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import DynamicFieldsSection from './DynamicFieldsSection';
import ImageUploader from './ImageUploader';
import LocationPicker from './LocationPicker';
import AdPreview from './AdPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import CategoryPicker from './CategoryPicker';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import DeleteAdButton from '../../Button/DeleteAdButton';
import { DynamicField, DynamicFieldValues } from '@/types/ad';

type Category = {
  id: string;
  name: string;
  parentId: string | null;
  fields?: DynamicField[];
  children: Category[];
};

type Ad = {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  location: string;
  lat: number | null;
  lng: number | null;
  isDon?: boolean;
  category?: { id: string };
  dynamicFields?: DynamicFieldValues;
};

export default function EditAdForm({
  ad,
  categories,
  userId,
}: {
  ad: Ad;
  categories: Category[];
  userId: string;
}) {
  // States
  const [categoryId, setCategoryId] = useState<string | null>(
    ad.category?.id || null
  );
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [images, setImages] = useState<string[]>(ad.images || []);
  const [location, setLocation] = useState<string>(ad.location || '');
  const [lat, setLat] = useState<number | null>(ad.lat || null);
  const [lng, setLng] = useState<number | null>(ad.lng || null);

  // Gère les champs dynamiques
  useEffect(() => {
    if (!categoryId) return setDynamicFields([]);
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

  // Schéma Zod comme avant
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
    isDon: z.boolean().optional(),
  });

  const methods = useForm({
    resolver: zodResolver(zodBase),
    defaultValues: {
      title: ad.title,
      description: ad.description,
      price: ad.price,
      images: ad.images || [],
      location: ad.location || '',
      lat: ad.lat || null,
      lng: ad.lng || null,
      isDon: ad.isDon || false,
      categoryId: ad.category?.id || '',
      dynamicFields: ad.dynamicFields || {},
    },
  });

  const { handleSubmit, setValue, watch } = methods;
  // Synchronise dès que l'annonce est chargée et que les catégories sont dispo
  useEffect(() => {
    if (ad.category?.id && categories.length > 0) {
      setValue('categoryId', ad.category.id); // RHF
      setCategoryId(ad.category.id); // local
    }
  }, [ad.category?.id, categories, setValue]);

  // Submit PATCH
  const onSubmit = async (data: z.infer<typeof zodBase>) => {
    const selectedCat = categories
      .flatMap((cat) => [cat, ...(cat.children || [])])
      .find((cat) => cat.id === (categoryId ?? data.categoryId));
    const expectedDynamicFields = (selectedCat?.fields || []).map(
      (f) => f.name
    );

    const filteredDynamicFields = Object.fromEntries(
      Object.entries(data.dynamicFields || {}).filter(
        ([key, value]) => expectedDynamicFields.includes(key) && value !== ''
      )
    );

    try {
      const res = await fetch(`/api/ad/user/${userId}/${ad.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          images,
          location,

          lat,
          lng,
          categoryId,
          dynamicFields: filteredDynamicFields,
        }),
      });

      if (res.ok) {
        toast.success('Annonce modifiée !');
        window.location.href = '/dashboard/annonces';
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erreur lors de la modification');
      }
    } catch (e) {
      toast.error('Erreur inconnue');
    }
  };

  const watched = watch();
  useEffect(() => {
    if (methods.watch('isDon')) {
      methods.setValue('price', 0, { shouldValidate: true });
    } else if (methods.watch('price') === 0) {
      methods.setValue('price', NaN, { shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.watch('isDon')]);

  const isFormValid =
    watched.title?.trim().length > 0 &&
    categoryId !== null &&
    images.length > 0;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid md:grid-cols-3 gap-8"
      >
        <div className="md:col-span-2 flex flex-col gap-6">
          <CategoryPicker
            categories={categories}
            categoryId={categoryId || ''}
            setCategoryId={setCategoryId}
            onSelect={(id) => {
              setCategoryId(id);
              setValue('categoryId', id); // react-hook-form
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
                  disabled={methods.watch('isDon')}
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
                  defaultImages={images}
                />
                <div className="flex  w-full mt-4  items-center justify-center gap-5">
                  <Button
                    type="submit"
                    className="mt-4 text-white "
                    disabled={!isFormValid}
                  >
                    Modifier l&apos;annonce
                  </Button>
                  {/* Delete Button */}
                  <DeleteAdButton
                    userId={userId}
                    className="top-1"
                    adId={ad.id}
                    onDeleted={() =>
                      (window.location.href = '/dashboard/annonces')
                    }
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="md:col-span-1">
          <AdPreview
            ad={{
              ...watched,
              images,
              location,
              lat,
              lng,
              categoryId,
              dynamicFields: watched.dynamicFields as DynamicFieldValues,
            }}
            dynamicFields={dynamicFields}
          />
        </div>
      </form>
    </FormProvider>
  );
}
