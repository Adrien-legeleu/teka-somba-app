'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { Category } from '@/types/category';

// Define the shape of our filter context state
interface FilterContextProps {
  categories: Category[];
  categoryId: string;
  subCategoryId: string;
  city: string;
  search: string;
  isDon: boolean;
  priceMin: string;
  priceMax: string;
  sortOrder: 'asc' | 'desc';
  setCategoryId: (id: string) => void;
  setSubCategoryId: (id: string) => void;
  setCity: (city: string) => void;
  setSearch: (search: string) => void;
  setIsDon: (val: boolean) => void;
  setPriceMin: (val: string) => void;
  setPriceMax: (val: string) => void;
  setSortOrder: (val: 'asc' | 'desc') => void;
  resetFilters: () => void;
  isFilterModalOpen: boolean;
  setFilterModalOpen: (open: boolean) => void;
  radius: string;
  setRadius: (radius: string) => void;
  lat: string | null;
  lng: string | null;
  setLat: (lat: string | null) => void;
  setLng: (lng: string | null) => void;
}

// Create context with default (will be overridden by provider)
const FilterContext = createContext<FilterContextProps | undefined>(undefined);

// Hook to use the filter context
export const useFilter = (): FilterContextProps => {
  const context = useContext(FilterContext);
  if (!context) throw new Error('useFilter must be used within FilterProvider');
  return context;
};

// Provider component to wrap around parts of the app that use filters
export function FilterProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  const [subCategoryId, setSubCategoryId] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [isDon, setIsDon] = useState<boolean>(false);
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isFilterModalOpen, setFilterModalOpen] = useState<boolean>(false);
  const [radius, setRadius] = useState<string>('');
  const [lat, setLat] = useState<string | null>('');
  const [lng, setLng] = useState<string | null>('');

  const searchParams = useSearchParams(); // to read URL query params

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const data: Category[] = await res.json();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    }
    fetchCategories();
  }, []);

  // Sync filter state with URL parameters on initial load or when they change
  useEffect(() => {
    if (!searchParams) return;
    // Search query (q)
    const qParam = searchParams.get('q') || '';
    setSearch(qParam);
    // Donation filter (isDon)
    const isDonParam = searchParams.get('isDon') === 'true';
    setIsDon(isDonParam);
  }, [searchParams]);

  // Once categories are loaded, handle categoryId from URL (if any)
  useEffect(() => {
    if (!searchParams || categories.length === 0) return;
    const urlCatId = searchParams.get('categoryId');
    if (!urlCatId) return;
    // Determine if the URL categoryId is a parent category or a subcategory
    let foundParent: Category | null = null;
    let foundChild: Category | null = null;
    for (const cat of categories) {
      if (cat.id === urlCatId) {
        foundParent = cat;
        break;
      }
      if (cat.children) {
        const child = cat.children.find((sub) => sub.id === urlCatId);
        if (child) {
          foundParent = cat;
          foundChild = child;
          break;
        }
      }
    }
    setCategoryId(foundParent?.id || ''); // set main category (or empty if not found)
    setSubCategoryId(foundChild?.id || ''); // set subcategory if applicable (or empty)
  }, [categories, searchParams]);

  // Reset all filters to default values
  const resetFilters = () => {
    setSearch('');
    setCity('');
    setCategoryId('');
    setSubCategoryId('');
    setIsDon(false);
    setPriceMin('');
    setPriceMax('');
    setSortOrder('desc');
  };

  // Context value to provide
  const value: FilterContextProps = {
    categories,
    categoryId,
    setCategoryId,
    subCategoryId,
    setSubCategoryId,
    city,
    setCity,
    search,
    setSearch,
    isDon,
    setIsDon,
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,
    sortOrder,
    setSortOrder,
    resetFilters,
    isFilterModalOpen,
    setFilterModalOpen,
    radius,
    setRadius,
    lat,
    setLat,
    lng,
    setLng,
  };

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}
