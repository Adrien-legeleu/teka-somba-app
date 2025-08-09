// /lib/zodDynamic.ts (compatible anciennes versions de Zod)
import { z, ZodTypeAny } from 'zod';
import type { CategoryField } from '@prisma/client';

// '' / null -> undefined ; string -> string.trim()
function cleanInput(v: unknown) {
  if (typeof v === 'string') {
    const t = v.trim();
    return t === '' ? undefined : t;
  }
  if (v === null) return undefined;
  return v;
}

function normalizeType(t: unknown): 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'TEXT' {
  const s = String(t ?? '').toLowerCase();
  if (s === 'number' || s === 'int' || s === 'float') return 'NUMBER';
  if (s === 'boolean' || s === 'bool') return 'BOOLEAN';
  if (s === 'select' || s === 'enum') return 'SELECT';
  if (s === 'text' || s === 'string') return 'TEXT';
  return 'TEXT';
}

export function buildDynamicSchema(
  fields: CategoryField[]
): z.ZodObject<Record<string, ZodTypeAny>> {
  const shape: Record<string, ZodTypeAny> = {};

  for (const f of fields) {
    const type = normalizeType(f.type);
    const optsRaw = (f.options as unknown) ?? null;

    let schema: ZodTypeAny;

    switch (type) {
      case 'NUMBER': {
        // Accepte "123", 123, "", null -> undefined si optionnel
        schema = z.preprocess(cleanInput, z.coerce.number());
        break;
      }
      case 'BOOLEAN': {
        // Accepte true/false/"true"/"false"/1/0/"", null
        schema = z.preprocess(cleanInput, z.coerce.boolean());
        break;
      }
      case 'SELECT': {
        const allowed = Array.isArray(optsRaw) ? optsRaw.map(String) : [];
        schema = z.preprocess(cleanInput, z.string());
        if (allowed.length > 0) {
          schema = schema.refine(
            (v) => v === undefined || allowed.includes(String(v)),
            { message: `Option non autorisée (attendu: ${allowed.join(', ')})` }
          );
        }
        break;
      }
      case 'TEXT':
      default: {
        schema = z.preprocess(cleanInput, z.string());
        break;
      }
    }

    // Required / Optional
    shape[f.name] = f.required ? schema : schema.optional();
  }

  return z.object(shape);
}
