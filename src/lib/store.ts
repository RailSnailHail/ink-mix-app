import { create } from 'zustand';

export interface MixComponent {
  inkId: number;
  name: string;
  colorHex: string;
  grams: number;
}

export interface Recipe {
  id: number;
  name: string;
  swatchHex: string;
  components: {
    ratio: number;
    Ink: { id: number; name: string; colorHex: string; shade: string; };
  }[];
}

interface MixState {
  mixName: string;
  components: MixComponent[];
  activeRecipe: Recipe | null;
  targetGrams: number;
  setMixName: (name: string) => void;
  addComponent: (newComponent: MixComponent) => void;
  removeLastComponent: () => void;
  clearMix: () => void;
  setActiveRecipe: (recipe: Recipe | null) => void;
  setTargetGrams: (grams: number) => void;
}

export const useMixStore = create<MixState>((set) => ({
  mixName: '',
  components: [],
  activeRecipe: null,
  targetGrams: 100,
  setMixName: (name) => set({ mixName: name }),
  addComponent: (newComponent) => set((state) => {
    const existingIndex = state.components.findIndex(c => c.inkId === newComponent.inkId);
    if (existingIndex > -1) {
      const updated = [...state.components];
      updated[existingIndex].grams += newComponent.grams;
      return { components: updated };
    }
    return { components: [...state.components, newComponent] };
  }),
  removeLastComponent: () => set((state) => ({ components: state.components.slice(0, -1) })),
  clearMix: () => set({ mixName: '', components: [], activeRecipe: null, targetGrams: 100 }),
  setActiveRecipe: (recipe) => set({ activeRecipe: recipe, mixName: recipe ? `Re-mix of ${recipe.name}` : '', components: [] }),
  setTargetGrams: (grams) => set({ targetGrams: grams > 0 ? grams : 1 }),
}));