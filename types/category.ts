import { DynamicField } from './ad';

export interface Category {
  id: string;
  name: string;
  icon: string;
  parentId: string | null;
  fields?: DynamicField[];
  children: Category[];
}
