import { z, ZodTypeAny } from 'zod';
import { CategoryField } from '@prisma/client';

export function buildDynamicSchema(
  fields: CategoryField[]
): z.ZodObject<Record<string, ZodTypeAny>> {
  const shape: Record<string, ZodTypeAny> = {};

  fields.forEach((f) => {
    let zodType: ZodTypeAny;

    switch (f.type) {
      case 'int':
      case 'number':
        zodType = z.preprocess(
          (val) => (typeof val === 'string' ? Number(val) : val),
          z.number()
        );
        break;
      case 'boolean':
      case 'bool':
        zodType = z.preprocess(
          (val) =>
            typeof val === 'string' ? val === 'true' || val === '1' : !!val,
          z.boolean()
        );
        break;
      case 'enum':
        zodType =
          f.options && (f.options as string[]).length > 0
            ? z.enum(f.options as [string, ...string[]])
            : z.string();
        break;
      default:
        zodType = z.string();
    }

    shape[f.name] = f.required ? zodType : zodType.optional();
  });

  return z.object(shape);
}
