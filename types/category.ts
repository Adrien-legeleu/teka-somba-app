export type CategoryField = {
  id: string;
  categoryId: string;
  name: string;
  type: string;
  required: boolean;
  options?: any; // Si tu veux, tu peux détailler plus tard le type de options
};

export type Category = {
  id: string;
  name: string;
  parentId?: string;
  fields: CategoryField[];
  children: Category[];
};
