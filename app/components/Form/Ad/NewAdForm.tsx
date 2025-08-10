'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import type { DefaultValues, Resolver } from 'react-hook-form';
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
import type { DurationUnit } from '@prisma/client';

type Category = {
  id: string;
  name: string;
  parentId: string | null;
  fields?: DynamicField[];
  children: Category[];
};

type AdType = 'FOR_SALE' | 'FOR_RENT';

/* =======================
   Zod schema
   ======================= */
const schema = z
  .object({
    title: z.string().min(1, 'Titre obligatoire'),
    description: z.string().min(1, 'Description obligatoire'),
    price: z.number().int().nonnegative(),
    images: z.array(z.string().url()).min(1, 'Ajoutez au moins une image'),
    location: z.string().min(1, 'Localisation obligatoire'),
    lat: z.number().nullable(),
    lng: z.number().nullable(),
    isDon: z.boolean().optional(),
    categoryId: z.string().min(1, 'Catégorie obligatoire'),
    type: z.enum(['FOR_SALE', 'FOR_RENT']),
    durationValue: z.number().int().positive().optional(),
    durationUnit: z.enum(['HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR']).optional(),
    // préciser keyType + valueType pour compat Zod
    dynamicFields: z.record(z.string(), z.unknown()).default({}),
  })
  .superRefine((data, ctx) => {
    // Prix: 0 si don, >0 sinon
    if (data.isDon) {
      if (data.price !== 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['price'],
          message: 'Pour un don, le prix doit être 0.',
        });
      }
    } else if (!(typeof data.price === 'number' && data.price > 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['price'],
        message: 'Le prix doit être strictement positif.',
      });
    }

    // Durée obligatoire si location
    if (data.type === 'FOR_RENT') {
      if (!data.durationValue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['durationValue'],
          message: 'Durée obligatoire pour une location.',
        });
      }
      if (!data.durationUnit) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['durationUnit'],
          message: 'Unité obligatoire pour une location.',
        });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

/* =======================
   Helpers
   ======================= */
function normalize(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '');
}

const durationLabels: Record<DurationUnit, string> = {
  HOUR: 'Heure(s)',
  DAY: 'Jour(s)',
  WEEK: 'Semaine(s)',
  MONTH: 'Mois',
  YEAR: 'An(s)',
};

/* =======================
   Component (init form)
   ======================= */
export default function NewAdForm({ categories }: { categories: Category[] }) {
  const defaultValues: DefaultValues<FormValues> = {
    title: '',
    description: '',
    price: 0,
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
  };

  // Cast du resolver pour éviter les mismatches de types inter-version RHF/resolvers
  const resolver = zodResolver(schema) as unknown as Resolver<FormValues, any>;

  const methods = useForm<FormValues>({
    resolver,
    mode: 'onChange',
    defaultValues,
  });

  const { watch, setValue, handleSubmit, trigger } = methods;

  const [step, setStep] = useState(1);
  const topRef = useRef<HTMLDivElement | null>(null);

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

  // scroll top on step change
  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    }
    topRef.current?.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [step]);

  // compute dynamic fields from selected category (sub first, else parent)
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

  // don => price = 0
  useEffect(() => {
    if (isDon) {
      methods.setValue('price', 0, { shouldValidate: true, shouldDirty: true });
    }
  }, [isDon, methods]);

  // selected cat id (sub prioritaire)
  const selectedCatId =
    (subCategoryId ?? categoryId ?? watched.categoryId ?? '') || '';

  const dynamicFieldNames = useMemo(
    () => (dynamicFields ?? []).map((f) => f.name).filter(Boolean) as string[],
    [dynamicFields]
  );

  /* =======================
     Validations par étape
     ======================= */
  const validateStep1 = async () => {
    if (!selectedCatId) {
      toast.warning('Veuillez choisir une catégorie.');
      return false;
    }
    setValue('categoryId', selectedCatId, { shouldValidate: true });
    const ok = await trigger(['title', 'type', 'categoryId']);
    if (!ok) {
      if (watched.type === 'FOR_RENT') {
        const okRent = await trigger(['durationValue', 'durationUnit']);
        if (!okRent) {
          toast.warning('Veuillez renseigner la durée de location.');
          return false;
        }
      } else {
        toast.warning('Veuillez remplir tous les champs requis.');
        return false;
      }
    } else if (watched.type === 'FOR_RENT') {
      const okRent = await trigger(['durationValue', 'durationUnit']);
      if (!okRent) {
        toast.warning('Veuillez renseigner la durée de location.');
        return false;
      }
    }
    return true;
  };

  const validateStep2 = async () => {
    const baseOk = await trigger(['description', 'price']);
    if (!baseOk) {
      toast.warning('Description et prix sont requis.');
      return false;
    }
    // Vérifier dyn fields requis
    const missing = dynamicFields
      .filter((f) => f.required)
      .filter((f) => {
        const v = (
          watched.dynamicFields as Record<string, unknown> | undefined
        )?.[f.name];
        return v === '' || v === null || v === undefined;
      })
      .map((f) => f.name);

    if (missing.length > 0) {
      toast.warning(`Complétez les champs spécifiques: ${missing.join(', ')}.`);
      return false;
    }
    return true;
  };

  const validateStep3 = async () => {
    if (isUploading) {
      toast.info("Patientez, l'upload d'images est en cours…");
      return false;
    }
    if (images.length === 0) {
      toast.warning('Ajoutez au moins une image.');
      return false;
    }
    setValue('images', images, { shouldValidate: true });
    const ok = await trigger(['images']);
    if (!ok) {
      toast.warning('Image(s) requise(s).');
      return false;
    }
    return true;
  };

  const validateStep4 = async () => {
    if (!location.trim()) {
      toast.warning('Indiquez une localisation.');
      return false;
    }
    setValue('location', location, { shouldValidate: true });
    setValue('lat', lat, { shouldValidate: false });
    setValue('lng', lng, { shouldValidate: false });
    const ok = await trigger(['location']);
    if (!ok) {
      toast.warning('Localisation requise.');
      return false;
    }
    return true;
  };

  /* =======================
     Submit (typé simple)
     ======================= */
  const onSubmit = async (data: FormValues) => {
    // garde-fous finaux
    if (!(await validateStep1())) return setStep(1);
    if (!(await validateStep2())) return setStep(2);
    if (!(await validateStep3())) return setStep(3);
    if (!(await validateStep4())) return setStep(4);

    // récupère la catégorie sélectionnée (sub prioritaire)
    const selectedCat = categories
      .flatMap((cat) => [cat, ...(cat.children || [])])
      .find((cat) => cat.id === selectedCatId);

    // map des noms exacts des champs dynamiques
    const nameMap = new Map(
      (selectedCat?.fields || []).map((f) => [normalize(f.name), f.name])
    );

    // remap keys dynamiques -> noms originaux (accents/espaces)
    const remappedDynamicFields = Object.fromEntries(
      Object.entries(data.dynamicFields || {}).flatMap(([key, val]) => {
        const original = nameMap.get(normalize(key));
        return original ? [[original, val]] : [];
      })
    );

    const finalDurationValue =
      data.type === 'FOR_RENT'
        ? (data.durationValue ?? watched.durationValue)
        : undefined;
    const finalDurationUnit =
      data.type === 'FOR_RENT'
        ? (data.durationUnit ?? watched.durationUnit)
        : undefined;

    const dynamicFieldsClean = Object.fromEntries(
      Object.entries(remappedDynamicFields).filter(
        ([, v]) => v !== '' && v !== undefined && v !== null
      )
    );

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
          categoryId: selectedCatId,
          durationValue: finalDurationValue,
          durationUnit: finalDurationUnit,
          dynamicFields: dynamicFieldsClean,
        }),
      });

      if (res.ok) {
        const { adId } = await res.json();
        toast.success('Annonce créée !');
        window.location.href = `/annonce/${adId}`;
      } else {
        const error = await res.json().catch(() => ({}));
        console.error(error);
        toast.error(error.error || 'Erreur de création');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur inconnue');
    }
  };

  // valid global (disable submit)
  const isFormValid =
    watched.title.trim().length > 0 &&
    !!selectedCatId &&
    images.length > 0 &&
    location.trim().length > 0 &&
    (isDon
      ? watched.price === 0
      : typeof watched.price === 'number' && watched.price > 0) &&
    (watched.type === 'FOR_RENT'
      ? !!watched.durationValue && !!watched.durationUnit
      : true);

  const durationUnit = watch('durationUnit');

  return (
    // cast léger pour éviter les conflits de versions RHF (aucune erreur)
    <FormProvider {...(methods as unknown as any)}>
      <form
        onSubmit={(methods.handleSubmit as any)(onSubmit)}
        className="w-full max-w-4xl mx-auto space-y-8"
      >
        <div ref={topRef} />
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
                onValueChange={(val) =>
                  setValue('type', val as AdType, { shouldValidate: true })
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
                    inputMode="numeric"
                    step={1}
                    min={1}
                    placeholder="Durée"
                    {...methods.register('durationValue', {
                      valueAsNumber: true,
                    })}
                    className="w-24"
                    onKeyDown={(e) => {
                      if (['e', 'E', '+', '-', '.'].includes(e.key))
                        e.preventDefault();
                    }}
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
                      <SelectItem value="HOUR">Heure(s)</SelectItem>
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
                  style={{
                    background: 'linear-gradient(90deg, #ff7a00, #ff3c00)',
                  }}
                  className="text-white"
                  onClick={async () => {
                    const ok = await validateStep1();
                    if (ok) setStep(2);
                  }}
                  type="button"
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

              <Label htmlFor="price">Prix *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="price"
                  type="number"
                  inputMode="numeric"
                  step={1}
                  min={0}
                  {...methods.register('price', { valueAsNumber: true })}
                  disabled={isDon}
                  className="w-40"
                  placeholder="FCFA"
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-', '.'].includes(e.key))
                      e.preventDefault();
                  }}
                />
              </div>

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
                <Button
                  style={{
                    background: 'linear-gradient(90deg, #ff7a00, #ff3c00)',
                  }}
                  className="text-white"
                  type="button"
                  onClick={async () => {
                    const ok = await validateStep2();
                    if (ok) setStep(3);
                  }}
                >
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
                  style={{
                    background: 'linear-gradient(90deg, #ff7a00, #ff3c00)',
                  }}
                  className="text-white"
                  type="button"
                  disabled={isUploading}
                  onClick={async () => {
                    const ok = await validateStep3();
                    if (ok) setStep(4);
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
                <Button
                  style={{
                    background: 'linear-gradient(90deg, #ff7a00, #ff3c00)',
                  }}
                  className="text-white"
                  type="button"
                  onClick={async () => {
                    const ok = await validateStep4();
                    if (ok) setStep(5);
                  }}
                >
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
                  categoryId: selectedCatId,
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
                <Button
                  style={{
                    background: 'linear-gradient(90deg, #ff7a00, #ff3c00)',
                  }}
                  className="text-white"
                  type="submit"
                  disabled={!isFormValid}
                >
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
