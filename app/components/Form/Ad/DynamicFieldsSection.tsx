'use client';

import { useFormContext, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { DynamicField } from '@/types/ad';

type DynamicFieldsValues = Record<string, unknown>;

export default function DynamicFieldsSection({
  fields,
}: {
  fields: DynamicField[];
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<DynamicFieldsValues>();

  return (
    <div className="space-y-6">
      {fields.map((field, idx) => {
        const key = field.id ?? field.name ?? String(idx);
        const fieldName = `dynamicFields.${field.name}` as const;
        const kind = (field.type ?? '').toLowerCase();
        const isSelect = kind === 'select' || kind === 'enum';
        const isNumber =
          kind === 'number' || kind === 'int' || kind === 'numeric';
        const isBoolean = kind === 'boolean' || kind === 'bool';

        const rules: Record<string, unknown> = {
          required: field.required ? 'Champ obligatoire' : false,
        };

        if (isNumber) {
          rules.setValueAs = (v: string) =>
            v === '' || v === null || v === undefined ? undefined : Number(v);
          rules.validate = (v: number | undefined) =>
            v === undefined || Number.isFinite(v)
              ? true
              : 'Valeur numérique invalide';
        }

        const dynamicErrors = (errors as FieldErrors<DynamicFieldsValues>)
          ?.dynamicFields as Record<string, { message?: string }> | undefined;

        const errorMsg = dynamicErrors?.[field.name]?.message;

        return (
          <div key={key} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              {field.name}
              {field.required && <span className="text-red-500">*</span>}
            </label>

            {isSelect && Array.isArray(field.options) && (
              <select
                defaultValue=""
                aria-invalid={!!errorMsg}
                aria-required={field.required || undefined}
                required={field.required}
                {...register(fieldName, rules)}
                className={`w-full rounded-xl border bg-white px-4 py-2 text-sm shadow-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 ${errorMsg ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="" disabled>
                  {' '}
                  Sélectionnez{' '}
                </option>
                {field.options.map((opt) => {
                  const val = String(opt);
                  return (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  );
                })}
              </select>
            )}

            {/* NUMBER */}
            {isNumber && (
              <Input
                type="number"
                inputMode="decimal"
                step="any" // ← au lieu de "1"
                // min={0}                 // ← enlève si pas sûr
                aria-invalid={!!errorMsg}
                aria-required={field.required || undefined}
                required={field.required}
                placeholder={field.required ? 'Obligatoire' : 'Optionnel'}
                {...register(fieldName, rules)}
                className={`rounded-xl px-4 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-200 ${errorMsg ? 'border-red-500' : 'border-gray-300'}`}
              />
            )}

            {/* BOOLEAN */}
            {isBoolean &&
              (field.required ? (
                <select
                  defaultValue=""
                  aria-invalid={!!errorMsg}
                  aria-required
                  required
                  {...register(fieldName, {
                    required: 'Champ obligatoire',
                    setValueAs: (v: string) =>
                      v === 'true' ? true : v === 'false' ? false : undefined,
                  })}
                  className={`w-full rounded-xl border bg-white px-4 py-2 text-sm shadow-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 ${
                    errorMsg ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="" disabled>
                    Sélectionnez
                  </option>
                  <option value="true">Oui</option>
                  <option value="false">Non</option>
                </select>
              ) : (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-400"
                    {...register(fieldName)}
                  />
                  <span className="text-sm text-gray-700">{field.name}</span>
                </div>
              ))}

            {/* TEXT (fallback) */}
            {!isSelect && !isNumber && !isBoolean && (
              <Input
                type="text"
                aria-invalid={!!errorMsg}
                aria-required={field.required || undefined}
                required={field.required}
                placeholder={field.required ? 'Obligatoire' : 'Optionnel'}
                {...register(fieldName, rules)}
                className={`rounded-xl px-4 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-200 ${
                  errorMsg ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            )}

            {errorMsg && (
              <p className="text-xs text-red-600">{String(errorMsg)}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
