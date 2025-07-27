import { DynamicField } from './ad';

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  fields?: DynamicField[];
  children: Category[];
}
