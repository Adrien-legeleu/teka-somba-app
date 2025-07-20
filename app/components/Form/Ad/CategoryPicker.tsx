import { useEffect, useState } from 'react';
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
  categoryId,
  setCategoryId,
  onSelect,
}: {
  categories: Category[];
  categoryId?: string;
  setCategoryId?: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  // Racines
  const rootCats = categories.filter((cat) => !cat.parentId);

  function findParentAndSub(categoryId: string | undefined): {
    parent: string;
    sub: string;
  } {
    if (!categoryId) return { parent: '', sub: '' };

    let parent = '';
    let sub = '';

    function search(categories: Category[]) {
      for (const cat of categories) {
        if (cat.id === categoryId) {
          if (cat.parentId) {
            parent = cat.parentId;
            sub = cat.id;
          } else {
            parent = cat.id;
            sub = '';
          }
          return true;
        }

        if (cat.children.length > 0) {
          if (search(cat.children)) return true;
        }
      }
      return false;
    }

    search(categories);
    return { parent, sub };
  }

  const { parent: initialParent, sub: initialSub } =
    findParentAndSub(categoryId);

  const [parent, setParent] = useState<string>(initialParent);
  const [sub, setSub] = useState<string>(initialSub);

  // Pour suivre les changements venant du parent (utile pour édition/préremplissage)
  useEffect(() => {
    console.log(categoryId);
    const { parent: newParent, sub: newSub } = findParentAndSub(categoryId);
    console.log(newParent, newSub);

    setParent(newParent);
    setSub(newSub);
  }, [categoryId, categories]);

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
          setSub('');
          onSelect(''); // Reset, rien n'est sélectionné tant que pas de sous-catégorie
        }}
        value={parent || ''}
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
            onSelect(id);
            setCategoryId?.(id);
          }}
          value={sub || ''}
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
