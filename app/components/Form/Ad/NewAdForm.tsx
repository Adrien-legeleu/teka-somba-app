'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import type { DefaultValues, SubmitHandler } from 'react-hook-form';
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
    dynamicFields: z.record(z.string(), z.unknown()).default({}),
  })
  .superRefine((data, ctx) => {
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

// Types d’input/output pour lever le conflit .default({})
type FormValuesIn = z.input<typeof schema>; // input avant parse (dynamicFields peut être undefined)
type FormValuesOut = z.output<typeof schema>; // output après parse (dynamicFields est {})

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

// ---- Auth helpers (sans any)
async function checkAuth(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/status', {
      credentials: 'include',
      cache: 'no-store',
    });
    if (res.status === 401) return false;
    if (!res.ok) return false;
    const data = (await res.json()) as { authenticated?: boolean };
    return !!data.authenticated;
  } catch {
    return false;
  }
}

function redirectToLogin(): void {
  const next = typeof window !== 'undefined' ? window.location.pathname : '/';
  window.location.replace(`/login?next=${encodeURIComponent(next)}`);
}

async function ensureAuth(showToast = false): Promise<boolean> {
  const ok = await checkAuth();
  if (!ok) {
    if (showToast)
      toast.error('Votre session a expiré. Connectez-vous pour continuer.');
    redirectToLogin();
  }
  return ok;
}

/* =======================
   Component
   ======================= */
export default function NewAdForm({ categories }: { categories: Category[] }) {
  const defaultValues: DefaultValues<FormValuesIn> = {
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

  // useForm — 3 génériques: <TFieldValues, TContext, TTransformedValues>
  const methods = useForm<FormValuesIn, undefined, FormValuesOut>({
    resolver: zodResolver<FormValuesIn, undefined, FormValuesOut>(schema),
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
    if (typeof window !== 'undefined')
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    topRef.current?.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [step]);

  // compute dynamic fields
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
    if (isDon)
      methods.setValue('price', 0, { shouldValidate: true, shouldDirty: true });
  }, [isDon, methods]);

  const selectedCatId =
    (subCategoryId ?? categoryId ?? watched.categoryId ?? '') || '';

  const dynamicFieldNames = useMemo(
    () => (dynamicFields ?? []).map((f) => f.name).filter(Boolean) as string[],
    [dynamicFields]
  );

  // Validations
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

  // Submit
  const onSubmit: SubmitHandler<FormValuesOut> = async (data) => {
    // ✅ Vérif session avant d’appeler l’API
    if (!(await ensureAuth(true))) return;

    if (!(await validateStep1())) return setStep(1);
    if (!(await validateStep2())) return setStep(2);
    if (!(await validateStep3())) return setStep(3);
    if (!(await validateStep4())) return setStep(4);

    const selectedCat = categories
      .flatMap((cat) => [cat, ...(cat.children || [])])
      .find((cat) => cat.id === selectedCatId);

    const nameMap = new Map(
      (selectedCat?.fields || []).map((f) => [normalize(f.name), f.name])
    );

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
        credentials: 'include',
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

      if (res.status === 401) {
        toast.error('Session expirée. Connectez-vous pour continuer.');
        redirectToLogin();
        return;
      }

      if (res.ok) {
        const { adId } = (await res.json()) as { adId: string };
        toast.success('Annonce créée !');
        window.location.href = `/annonce/${adId}`;
      } else {
        const error = await res.json().catch(() => ({}) as { error?: string });
        console.error(error);
        toast.error(error.error || 'Erreur de création');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur inconnue');
    }
  };

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
    <FormProvider<FormValuesIn, undefined> {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-4xl mx-auto space-y-8"
      >
        <div ref={topRef} />
        <StepProgressBar step={step} />

        <AnimatePresence mode="wait">
          {/* Étape 1 */}
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {step === 1 && (
              <>
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
                    type="button"
                    onClick={async () => {
                      // petite vérif session aussi au passage quand on avance
                      if (!(await ensureAuth())) return;
                      const ok = await validateStep1();
                      if (ok) setStep(2);
                    }}
                  >
                    Suivant
                  </Button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...methods.register('description')}
                  placeholder="Décrivez votre produit..."
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
                    placeholder="USD"
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
                      if (!(await ensureAuth())) return;
                      const ok = await validateStep2();
                      if (ok) setStep(3);
                    }}
                  >
                    Suivant
                  </Button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
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
                      if (!(await ensureAuth())) return;
                      const ok = await validateStep3();
                      if (ok) setStep(4);
                    }}
                  >
                    Suivant
                  </Button>
                </div>
              </>
            )}

            {step === 4 && (
              <>
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
                      if (!(await ensureAuth())) return;
                      const ok = await validateStep4();
                      if (ok) setStep(5);
                    }}
                  >
                    Suivant
                  </Button>
                </div>
              </>
            )}

            {step === 5 && (
              <>
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
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </form>
    </FormProvider>
  );
}
