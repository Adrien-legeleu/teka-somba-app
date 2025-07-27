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
    <div className="space-y-2">
      {fields.map((field, idx) => {
        const key = field.id || field.name || String(idx);

        if (field.type === 'enum' && Array.isArray(field.options)) {
          return (
            <div key={key}>
              <label>{field.name}</label>
              <select
                {...register(`dynamicFields.${field.name}`)}
                className="input-class"
              >
                <option value="">Sélectionnez</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        if (field.type === 'int' || field.type === 'number') {
          return (
            <div key={key}>
              <label>{field.name}</label>
              <Input
                type="number"
                {...register(`dynamicFields.${field.name}`)}
              />
            </div>
          );
        }

        if (field.type === 'boolean' || field.type === 'bool') {
          return (
            <div key={key} className="flex gap-2 items-center">
              <input
                type="checkbox"
                {...register(`dynamicFields.${field.name}`)}
              />
              <label>{field.name}</label>
            </div>
          );
        }

        // Par défaut : string
        return (
          <div key={key}>
            <label>{field.name}</label>
            <Input type="text" {...register(`dynamicFields.${field.name}`)} />
          </div>
        );
      })}
    </div>
  );
}
