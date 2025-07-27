import { DynamicField } from './ad';

export type CategoryField = {
  id: string;
  categoryId: string;
  name: string;
  type: string;
  required: boolean;
  options?: any; // Si tu veux, tu peux détailler plus tard le type de options
};

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  fields?: DynamicField[];
  children: Category[];
}
