// types/ad.ts

export type DynamicField = {
  id?: string;
  name: string;
  type: 'string' | 'number' | 'int' | 'boolean' | 'bool' | 'enum' | 'SELECT';
  required: boolean;
  options?: string[];
};

export type DynamicFieldValue = string | number | boolean | null | undefined;

export type DynamicFieldValues = Record<string, DynamicFieldValue>;

export interface AdAnalytics {
  views: number;
  messagesCount: number;
  favoritesCount: number;
}

export interface Ad {
  id: string; // 👈 manquait dans ton type global
  title: string;
  description: string;
  price: number;
  images: string[];
  location?: string | null; // 👈 maintenant optionnel et nullable
  lat: number | null;
  lng: number | null;

  isFavorite?: boolean; // 👈 ajouté car utilisé dans Home
  isDon?: boolean;
  category?: { id: string; name?: string; parentId: string };
  subCategoryId?: string;
  dynamicFields?: DynamicFieldValues;
  durationValue?: number;
  durationUnit?: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  adAnalytics?: AdAnalytics;
  user?: User;

  fields?: AdField[];
}

export type Category = {
  id: string;
  name: string;
  parentId: string | null;
  fields?: DynamicField[];
  children: Category[];
};

export interface User {
  id: string;
  name: string;
  prenom?: string | null;
  avatar?: string | null;
  email: string | null;
  phone?: string | null;
  city?: string | null;
  age?: number | null;
  isVerified?: boolean;
}

export interface AdField {
  value: string | number | boolean | null;
  categoryField: {
    name: string;
  };
}
