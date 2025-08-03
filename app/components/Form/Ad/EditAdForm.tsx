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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DynamicField, DynamicFieldValues } from '@/types/ad';
import { CategoryPicker } from './CategoryPicker';
import DeleteAdButton from '../../Button/DeleteAdButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  type?: 'FOR_SALE' | 'FOR_RENT';
  durationValue?: number;
  durationUnit?: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  category?: { id: string; parentId: string };
  dynamicFields?: DynamicFieldValues;
};
type DurationUnit = 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

export default function EditAdForm({
  ad,
  categories,
  userId,
}: {
  ad: Ad;
  categories: Category[];
  userId: string;
}) {
  const [categoryId, setCategoryId] = useState<string | null>(
    ad.category?.parentId || null
  );
  console.log('ad direct', ad);

  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [images, setImages] = useState<string[]>(ad.images || []);
  const [location, setLocation] = useState<string>(ad.location || '');
  const [lat, setLat] = useState<number | null>(ad.lat || null);
  const [lng, setLng] = useState<number | null>(ad.lng || null);
  const [subCategoryId, setSubCategoryId] = useState<string | null>(
    ad.category?.id || null
  );

  useEffect(() => {
    if (!subCategoryId) return setDynamicFields([]);

    function findCategoryById(cats: Category[], id: string): Category | null {
      for (const cat of cats) {
        if (cat.id === id) return cat;
        if (cat.children?.length) {
          const found = findCategoryById(cat.children, id);
          if (found) return found;
        }
      }
      return null;
    }

    const selectedSubCategory = findCategoryById(categories, subCategoryId);
    console.log(
      'SubCat:',
      selectedSubCategory?.name,
      selectedSubCategory?.fields
    );

    setDynamicFields(selectedSubCategory?.fields || []);
  }, [subCategoryId, categories]);

  const AdSchema = z.object({
    title: z.string().min(1, 'Titre obligatoire'),
    description: z.string().min(1, 'Description obligatoire'),
    price: z.number().min(0, 'Prix invalide'),
    images: z.array(z.string().url()).min(1, 'Ajoutez au moins une image'),
    location: z.string().optional().default(''),
    lat: z.number().nullable(),
    lng: z.number().nullable(),
    categoryId: z.string(),
    isDon: z.boolean().optional(),
    subCategoryId: z.string().min(1, 'Sous-catégorie obligatoire'),

    type: z.enum(['FOR_SALE', 'FOR_RENT']),
    durationValue: z.number().min(1, 'Durée requise').optional().nullable(),
    durationUnit: z
      .enum(['HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR'])
      .optional()
      .nullable(),
    dynamicFields: z.object({}).catchall(z.unknown()),
  });
  console.log('[DEBUG] ad reçu dans EditAdForm:', ad);

  const methods = useForm({
    resolver: zodResolver(AdSchema),
    defaultValues: {
      title: ad.title,
      description: ad.description,
      price: ad.price,
      images: ad.images || [],
      location: ad.location || '',
      lat: ad.lat || null,
      lng: ad.lng || null,
      isDon: ad.isDon || false,
      categoryId: ad.category?.parentId || '',
      subCategoryId: ad.category?.id || '',
      dynamicFields: ad.dynamicFields || {},
      type: ad.type ?? 'FOR_SALE', // ✅ ici
      durationValue: ad.durationValue ?? undefined, // ✅ ici
      durationUnit: ad.durationUnit ?? undefined, // ✅ ici
    },
  });

  const { handleSubmit, setValue, watch } = methods;

  useEffect(() => {
    if (ad.category?.parentId && categories.length > 0) {
      setValue('categoryId', ad.category.parentId);
      setCategoryId(ad.category.parentId);
    }
    if (ad.category?.id) {
      setValue('subCategoryId', ad.category.id);
      setSubCategoryId(ad.category.id);
    }
  }, [ad.category?.id, ad.category?.parentId, categories, setValue]);

  const onSubmit = async (data: z.infer<typeof AdSchema>) => {
    const selectedCat = categories
      .flatMap((cat) => [cat, ...(cat.children || [])])
      .find((cat) => cat.id === (subCategoryId ?? data.subCategoryId));
    const expectedFields = (selectedCat?.fields || []).map((f) => f.name);

    const filteredDynamicFields = Object.fromEntries(
      expectedFields.map((name) => [name, data.dynamicFields?.[name] ?? null])
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
    } catch {
      toast.error('Erreur inconnue');
    }
  };

  const watched = watch();
  useEffect(() => {
    if (watched.isDon) {
      setValue('price', 0, { shouldValidate: true });
    } else if (watched.price === 0) {
      setValue('price', NaN, { shouldValidate: false });
    }
  }, [watched.isDon]);

  const isFormValid =
    watched.title?.trim().length > 0 &&
    categoryId !== null &&
    images.length > 0;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <div className="md:col-span-2 flex flex-col gap-6">
          <CategoryPicker
            categoryId={categoryId}
            subCategoryId={subCategoryId}
            setCategoryId={(id) => {
              setCategoryId(id);
              setValue('categoryId', id);
            }}
            setSubCategoryId={(id) => {
              setSubCategoryId(id);
              setValue('subCategoryId', id); // fonctionne si ton schéma Zod ou RHF l’accepte
            }}
          />

          <Input
            {...methods.register('title')}
            placeholder="Titre de l'annonce"
            className="rounded-xl px-4 py-2 shadow-sm"
          />

          <div className="flex items-center space-x-2">
            <Switch id="don" {...methods.register('isDon')} />
            <Label htmlFor="don">Mettre en don (gratuit)</Label>
          </div>

          <Select
            value={watched.type}
            onValueChange={(val) =>
              setValue('type', val as 'FOR_SALE' | 'FOR_RENT')
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Type d'annonce" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FOR_SALE">À vendre</SelectItem>
              <SelectItem value="FOR_RENT">À louer</SelectItem>
            </SelectContent>
          </Select>

          {watched.type === 'FOR_RENT' && (
            <div className="flex items-center gap-4">
              <Input
                type="number"
                placeholder="Durée"
                {...methods.register('durationValue', { valueAsNumber: true })}
                className="w-24"
              />
              <Select
                value={watched.durationUnit ?? undefined}
                onValueChange={(val: DurationUnit) =>
                  setValue('durationUnit', val)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Unité de durée" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOUR">Heure</SelectItem>
                  <SelectItem value="DAY">Jour</SelectItem>
                  <SelectItem value="WEEK">Semaine</SelectItem>
                  <SelectItem value="MONTH">Mois</SelectItem>
                  <SelectItem value="YEAR">Année</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

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
                  className="rounded-xl px-4 py-2 shadow-sm"
                />
                <div className="flex w-full gap-2 items-center">
                  <Input
                    {...methods.register('price', { valueAsNumber: true })}
                    type="number"
                    placeholder="Prix (USD)"
                    min={0}
                    disabled={methods.watch('isDon')}
                    className="rounded-xl px-4 py-2 shadow-sm"
                  />
                  <span className="font-semibold">USD</span>
                </div>

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
                <div className="flex flex-col  md:flex-row w-full mt-4 items-stretch md:items-center justify-center gap-5">
                  <Button
                    type="submit"
                    disabled={!isFormValid}
                    className="mt-4 text-white w-full md:w-auto"
                  >
                    Modifier l&apos;annonce
                  </Button>
                  <DeleteAdButton
                    userId={userId}
                    adId={ad.id}
                    className="top-1 w-full md:w-auto"
                    onDeleted={() => {
                      window.location.href = '/dashboard/annonces';
                    }}
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
              type: watched.type,
              durationUnit: watched.durationUnit ?? undefined,
              durationValue: watched.durationValue ?? undefined,

              dynamicFields: watched.dynamicFields as DynamicFieldValues,
            }}
            dynamicFields={dynamicFields}
          />
        </div>
      </form>
    </FormProvider>
  );
}
