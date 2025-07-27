export type DynamicField = {
  id?: string;
  name: string;
  type: 'string' | 'number' | 'int' | 'boolean' | 'bool' | 'enum';
  required: boolean;
  options?: string[];
};

export type DynamicFieldValue = string | number | boolean | null | undefined;

export type DynamicFieldValues = Record<string, DynamicFieldValue>;

export type Ad = {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  location: string;
  lat: number | null;
  lng: number | null;
  isDon?: boolean;
  categoryId?: string | null;
  dynamicFields?: DynamicFieldValues;
};

export type Category = {
  id: string;
  name: string;
  parentId: string | null;
  fields?: DynamicField[];
  children: Category[];
};
