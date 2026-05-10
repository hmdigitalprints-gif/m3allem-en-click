import { create } from 'zustand';

interface ProductFilterState {
  filters: {
    search: string;
    category: string;
    minPrice: string;
    maxPrice: string;
    city: string;
    seller: string;
  };
  setFilters: (newFilters: Partial<ProductFilterState['filters']>) => void;
  resetFilters: () => void;
}

const defaultFilters = {
  search: '',
  category: '',
  minPrice: '',
  maxPrice: '',
  city: '',
  seller: ''
};

export const useProductFilterStore = create<ProductFilterState>((set) => ({
  filters: defaultFilters,
  setFilters: (newFilters) => 
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  resetFilters: () => set({ filters: defaultFilters })}));
