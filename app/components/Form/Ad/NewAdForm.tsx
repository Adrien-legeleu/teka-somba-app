'use client';

import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import { CategoryPicker } from './CategoryPicker';
import DynamicFieldsSection from './DynamicFieldsSection';
import ImageUploader from './ImageUploader';
import LocationPicker from './LocationPicker';
import AdPreview from './AdPreview';
import StepProgressBar from './StepProgressbar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

import { DynamicField, DynamicFieldValues } from '@/types/ad';
import { DurationUnit } from '@prisma/client';

type Category = {
  id: string;
  name: string;
  parentId: string | null;
  fields?: DynamicField[];
  children: Category[];
};

type AdType = 'FOR_SALE' | 'FOR_RENT';

const schema = z.object({
  title: z.string().min(1, 'Titre obligatoire'),
  description: z.string().min(1, 'Description obligatoire'),
  price: z.number().positive('Prix invalide'),
  images: z.array(z.string().url()).min(1, 'Ajoutez au moins une image'),
  location: z.string(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  isDon: z.boolean().optional(),
  categoryId: z.string(),
  type: z.enum(['FOR_SALE', 'FOR_RENT']),
  durationValue: z.number().optional(),
  durationUnit: z.enum(['DAY', 'WEEK', 'MONTH', 'YEAR']).optional(),
  dynamicFields: z.object({}).catchall(z.unknown()),
});
function normalize(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // enlever accents
    .toLowerCase()
    .replace(/\s+/g, ''); // enlever les espaces
}

export default function NewAdForm({ categories }: { categories: Category[] }) {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      price: undefined,
      images: [],
      location: '',
      lat: null,
      lng: null,
      isDon: false,
      type: 'FOR_SALE',
      durationValue: undefined,
      durationUnit: undefined,
      categoryId: '',
      dynamicFields: {},
    },
  });

  const { watch, setValue, handleSubmit } = methods;
  const [step, setStep] = useState(1);
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [subCategoryId, setSubCategoryId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const watched = watch();
  const isDon = !!watched.isDon;
  const priceValue = isDon
    ? 0
    : watched.price === undefined
      ? ''
      : watched.price;

  useEffect(() => {
    const targetId = subCategoryId || categoryId;
    if (!targetId) return;

    const findCategoryById = (
      cats: Category[],
      id: string
    ): Category | null => {
      for (const cat of cats) {
        if (cat.id === id) return cat;
        if (cat.children?.length) {
          const found = findCategoryById(cat.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const cat = findCategoryById(categories, targetId);
    setDynamicFields(cat?.fields || []);
  }, [categoryId, subCategoryId, categories]);

  useEffect(() => {
    if (isDon) {
      setValue('price', 0, { shouldValidate: true });
    }
  }, [isDon, setValue]);

  const isFormValid =
    watched.title.trim().length > 0 && categoryId !== null && images.length > 0;

  const onSubmit = async (data: z.infer<typeof schema>) => {
    console.log('🟡 Données soumises par le formulaire (brutes) :', data);
    console.log('🟢 Champs dynamiques (avant filtre) :', data.dynamicFields);

    const selectedCatId = subCategoryId ?? categoryId ?? data.categoryId;
    const selectedCat = categories
      .flatMap((cat) => [cat, ...(cat.children || [])])
      .find((cat) => cat.id === selectedCatId);

    console.log('📛 categoryId :', categoryId);
    console.log('📛 subCategoryId :', subCategoryId);
    console.log('📛 data.categoryId :', data.categoryId);
    console.log('📛 Catégorie trouvée :', selectedCat);

    const expectedDynamicFields = (selectedCat?.fields || []).map((f) =>
      normalize(f.name)
    );

    console.log(expectedDynamicFields);

    const filteredDynamicFields = Object.fromEntries(
      Object.entries(data.dynamicFields || {}).filter(([key]) => {
        return expectedDynamicFields.some(
          (expected) => normalize(expected) === normalize(key)
        );
      })
    );

    console.log(
      '🔵 Champs dynamiques filtrés (après nettoyage) :',
      filteredDynamicFields
    );

    const finalDurationValue =
      data.durationValue ?? watched.durationValue ?? undefined;
    const finalDurationUnit =
      data.durationUnit ?? watched.durationUnit ?? undefined;
    console.log('📤 Payload envoyé à /api/ad :', {
      ...data,
      images,
      location,
      lat,
      lng,
      categoryId: subCategoryId ?? categoryId,
      durationValue: finalDurationValue,
      durationUnit: finalDurationUnit,
      dynamicFields: filteredDynamicFields,
    });

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
          categoryId: subCategoryId ?? categoryId, // use subCategoryId if it exists
          durationValue: finalDurationValue,
          durationUnit: finalDurationUnit,
          dynamicFields: filteredDynamicFields,
        }),
      });

      if (res.ok) {
        const { adId } = await res.json();
        toast.success('Annonce créée !');
        window.location.href = `/annonce/${adId}`;
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erreur de création');
        console.error(error);
      }
    } catch (err) {
      toast.error('Erreur inconnue');
      console.error(err);
    }
  };

  const durationUnit = watch('durationUnit');
  const durationLabels: Record<DurationUnit, string> = {
    DAY: 'Jour(s)',
    WEEK: 'Semaine(s)',
    MONTH: 'Mois',
    YEAR: 'An(s)',
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-4xl mx-auto space-y-8"
      >
        <StepProgressBar step={step} />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Label>Catégorie *</Label>
              <CategoryPicker
                categoryId={categoryId}
                setCategoryId={setCategoryId}
                subCategoryId={subCategoryId}
                setSubCategoryId={setSubCategoryId}
              />

              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                {...methods.register('title')}
                placeholder="Ex : iPhone 14 Pro, Maison à louer, etc."
              />

              <div className="flex items-center gap-3">
                <Switch
                  id="don"
                  checked={isDon}
                  onCheckedChange={(val) => {
                    setValue('isDon', val, { shouldValidate: true });
                    if (val) setValue('price', 0, { shouldValidate: true });
                  }}
                />
                <Label htmlFor="don">Mettre en don (gratuit)</Label>
              </div>

              <Label>Type *</Label>
              <RadioGroup
                defaultValue="FOR_SALE"
                onValueChange={(val: AdType) =>
                  setValue('type', val, { shouldValidate: true })
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="FOR_SALE" id="for_sale" />
                  <Label htmlFor="for_sale">À vendre</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="FOR_RENT" id="for_rent" />
                  <Label htmlFor="for_rent">À louer</Label>
                </div>
              </RadioGroup>

              {watch('type') === 'FOR_RENT' && (
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    placeholder="Durée"
                    {...methods.register('durationValue', {
                      valueAsNumber: true,
                    })}
                    className="w-24"
                  />
                  <Select
                    onValueChange={(val) =>
                      setValue('durationUnit', val as DurationUnit, {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger className="w-32">
                      {durationUnit ? durationLabels[durationUnit] : 'Unité'}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAY">Jour(s)</SelectItem>
                      <SelectItem value="WEEK">Semaine(s)</SelectItem>
                      <SelectItem value="MONTH">Mois</SelectItem>
                      <SelectItem value="YEAR">An(s)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    if (
                      !categoryId ||
                      !subCategoryId ||
                      watched.title.trim().length === 0 ||
                      (watched.type === 'FOR_RENT' &&
                        (!watched.durationValue || !watched.durationUnit))
                    ) {
                      toast.warning('Veuillez remplir tous les champs requis');
                      return;
                    }
                    setStep(2);
                  }}
                >
                  Suivant
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                {...methods.register('description')}
                placeholder="Décrivez votre produit ou service en détail..."
                rows={4}
              />

              <Label htmlFor="price">Prix (FCFA) *</Label>
              <Input
                id="price"
                type="number"
                value={priceValue}
                onChange={(e) =>
                  setValue(
                    'price',
                    e.target.value === '' ? NaN : Number(e.target.value),
                    { shouldValidate: true }
                  )
                }
                disabled={isDon}
              />

              {dynamicFields.length > 0 && (
                <DynamicFieldsSection fields={dynamicFields} />
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setStep(1)}
                >
                  Retour
                </Button>
                <Button type="button" onClick={() => setStep(3)}>
                  Suivant
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <ImageUploader
                defaultImages={images}
                onChange={(urls) => {
                  setImages(urls);
                  setValue('images', urls, { shouldValidate: true });
                }}
                onUploadingChange={(uploading) => setIsUploading(uploading)}
              />

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setStep(2)}
                >
                  Retour
                </Button>
                <Button
                  type="button"
                  disabled={isUploading}
                  onClick={() => {
                    if (isUploading) return;
                    setStep(4);
                  }}
                >
                  Suivant
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <LocationPicker
                location={location}
                setLocation={setLocation}
                lat={lat}
                setLat={setLat}
                lng={lng}
                setLng={setLng}
              />
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setStep(3)}
                >
                  Retour
                </Button>
                <Button type="button" onClick={() => setStep(5)}>
                  Suivant
                </Button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <AdPreview
                ad={{
                  ...watched,
                  images,
                  location,
                  lat,
                  lng,
                  categoryId,
                  type: watched.type,
                  durationUnit: watched.durationUnit,
                  durationValue: watched.durationValue,
                  dynamicFields: watched.dynamicFields as DynamicFieldValues,
                }}
                dynamicFields={dynamicFields}
              />
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(4)}>
                  Retour
                </Button>
                <Button type="submit" disabled={!isFormValid}>
                  Créer l’annonce
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </FormProvider>
  );
}
