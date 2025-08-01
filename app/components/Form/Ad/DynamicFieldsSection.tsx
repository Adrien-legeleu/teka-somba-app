'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { DynamicField } from '@/types/ad';

export default function DynamicFieldsSection({
  fields,
}: {
  fields: DynamicField[];
}) {
  const { register } = useFormContext();

  return (
    <div className="space-y-6">
      {fields.map((field, idx) => {
        const key = field.id || field.name || String(idx);
        const fieldName = `dynamicFields.${field.name}`;

        return (
          <div key={key} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              {field.name}
            </label>

            {/* Select / Enum */}
            {(field.type === 'enum' || field.type === 'SELECT') &&
              Array.isArray(field.options) && (
                <select
                  defaultValue=""
                  {...register(fieldName)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                >
                  <option value="">Sélectionnez</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}

            {/* Champ numérique */}
            {(field.type === 'int' || field.type === 'number') && (
              <Input
                type="number"
                defaultValue=""
                {...register(fieldName)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-200"
              />
            )}

            {/* Boolean */}
            {field.type === 'boolean' || field.type === 'bool' ? (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  defaultChecked={false}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-400"
                  {...register(fieldName)}
                />
                <span className="text-sm text-gray-700">{field.name}</span>
              </div>
            ) : null}

            {/* String par défaut */}
            {field.type !== 'enum' &&
              field.type !== 'SELECT' &&
              field.type !== 'int' &&
              field.type !== 'number' &&
              field.type !== 'boolean' &&
              field.type !== 'bool' && (
                <Input
                  type="text"
                  defaultValue=""
                  {...register(fieldName)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-200"
                />
              )}
          </div>
        );
      })}
    </div>
  );
}
