'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { DynamicField } from '@/types/ad';

export default function DynamicFieldsSection({
  fields,
}: {
  fields: DynamicField[];
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6">
      {fields.map((field, idx) => {
        const key = (field as any).id || field.name || String(idx);
        const fieldName = `dynamicFields.${field.name}`;
        const kind = String(field.type || '').toLowerCase();
        const isSelect = kind === 'select' || kind === 'enum';
        const isNumber =
          kind === 'number' || kind === 'int' || kind === 'numeric';
        const isBoolean = kind === 'boolean' || kind === 'bool';

        // Règles communes (required piloté par field.required)
        const rules: any = {
          required: field.required ? 'Champ obligatoire' : false,
        };

        // Coercition/validation pour les nombres
        if (isNumber) {
          rules.setValueAs = (v: any) =>
            v === '' || v === null || typeof v === 'undefined'
              ? undefined
              : Number(v);
          rules.validate = (v: any) =>
            v === undefined || Number.isFinite(v)
              ? true
              : 'Valeur numérique invalide';
        }

        // Pour Boolean "required", on force un vrai choix Oui/Non (select),
        // sinon on laisse un simple checkbox (facultatif).
        const errorMsg = (errors as any)?.dynamicFields?.[field.name]
          ?.message as string | undefined;

        return (
          <div key={key} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              {field.name}{' '}
              {field.required ? <span className="text-red-500">*</span> : null}
            </label>

            {/* SELECT / ENUM */}
            {isSelect && Array.isArray(field.options) && (
              <select
                defaultValue=""
                aria-invalid={!!errorMsg}
                aria-required={field.required || undefined}
                required={!!field.required}
                {...register(fieldName, rules)}
                className={`w-full rounded-xl border bg-white px-4 py-2 text-sm shadow-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 ${
                  errorMsg ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="" disabled>
                  Sélectionnez
                </option>
                {field.options.map((opt: string) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {/* NUMBER */}
            {isNumber && (
              <Input
                type="number"
                inputMode="numeric"
                step="1"
                min={0}
                aria-invalid={!!errorMsg}
                aria-required={field.required || undefined}
                required={!!field.required}
                placeholder={field.required ? 'Obligatoire' : 'Optionnel'}
                {...register(fieldName, rules)}
                className={`rounded-xl px-4 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-200 ${
                  errorMsg ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            )}

            {/* BOOLEAN */}
            {isBoolean ? (
              field.required ? (
                // Version "obligatoire" -> Select Oui/Non pour forcer un choix
                <select
                  defaultValue=""
                  aria-invalid={!!errorMsg}
                  aria-required
                  required
                  {...register(fieldName, {
                    required: 'Champ obligatoire',
                    setValueAs: (v) =>
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
                // Version "facultative" -> simple checkbox
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-400"
                    {...register(fieldName)}
                  />
                  <span className="text-sm text-gray-700">{field.name}</span>
                </div>
              )
            ) : null}

            {/* TEXT (fallback) */}
            {!isSelect && !isNumber && !isBoolean && (
              <Input
                type="text"
                aria-invalid={!!errorMsg}
                aria-required={field.required || undefined}
                required={!!field.required}
                placeholder={field.required ? 'Obligatoire' : 'Optionnel'}
                {...register(fieldName, rules)}
                className={`rounded-xl px-4 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-200 ${
                  errorMsg ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            )}

            {errorMsg ? (
              <p className="text-xs text-red-600">{errorMsg}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
