import { create } from 'zustand';

interface FilterState {
  filters: {
    search: string;
    category: string;
    minRating: number;
    minPrice: string;
    maxPrice: string;
    isOnline: boolean;
    availability: string;
    city: string;
    distance: number;
    experience: number;
    verified: boolean;
    sortBy: string;
  };
  setFilters: (newFilters: Partial<FilterState['filters']>) => void;
  resetFilters: () => void;
}

const defaultFilters = {
  search: '',
  category: '',
  minRating: 0,
  minPrice: '',
  maxPrice: '',
  isOnline: false,
  availability: '',
  city: '',
  distance: 50,
  experience: 0,
  verified: false,
  sortBy: 'popularity'
};

export const useFilterStore = create<FilterState>((set) => ({
  filters: defaultFilters,
  setFilters: (newFilters) => 
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  resetFilters: () => set({ filters: defaultFilters })}));
