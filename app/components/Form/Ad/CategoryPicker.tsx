import { useState } from 'react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

type Category = {
  id: string;
  name: string;
  parentId: string | null;
  children: Category[];
};

export default function CategoryPicker({
  categories,
  onSelect,
}: {
  categories: Category[];
  onSelect: (id: string) => void;
}) {
  // Racines
  const rootCats = categories.filter((cat) => !cat.parentId);
  const [parent, setParent] = useState<string | null>(null);
  const [sub, setSub] = useState<string | null>(null);

  // Sous-catégories du parent sélectionné
  const subCats = parent
    ? (categories.find((cat) => cat.id === parent)?.children ?? [])
    : [];

  return (
    <div className="flex gap-4">
      {/* Sélecteur catégorie racine */}
      <Select
        onValueChange={(id) => {
          setParent(id);
          setSub(null);
          onSelect(''); // Reset la sélection, car la feuille n'est pas encore choisie
        }}
        value={parent ?? ''}
      >
        <SelectTrigger className="w-[180px]">
          {parent ? categories.find((c) => c.id === parent)?.name : 'Catégorie'}
        </SelectTrigger>
        <SelectContent>
          {rootCats.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Sélecteur sous-catégorie */}
      {subCats.length > 0 && (
        <Select
          onValueChange={(id) => {
            setSub(id);
            onSelect(id); // Là, c'est la vraie catégorie sélectionnée !
          }}
          value={sub ?? ''}
        >
          <SelectTrigger className="w-[180px]">
            {sub ? subCats.find((c) => c.id === sub)?.name : 'Sous-catégorie'}
          </SelectTrigger>
          <SelectContent>
            {subCats.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
