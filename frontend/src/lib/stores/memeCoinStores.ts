import { writable } from 'svelte/store';
import { z } from 'zod';
import { schemas } from '../shared/schemas';

// Definición de tipos
export interface MemeoinFormData {
  network: string;
  name: string;
  symbol: string;
  supply: string;
  logo: string | null;
}

export interface FormErrors {
  network: string;
  name: string;
  symbol: string;
  supply: string;
}

export interface AISuggestion {
  name: string;
  symbol: string;
  supply: string;
}

export interface GenerationStatus {
  name: boolean;
  symbol: boolean;
  supply: boolean;
  logo: boolean;
}

// Estado inicial
const initialFormData: MemeoinFormData = {
  network: "",
  name: "",
  symbol: "",
  supply: "",
  logo: null
};

const initialErrors: FormErrors = {
  network: "",
  name: "",
  symbol: "",
  supply: ""
};

// Crear stores
export const formData = writable<MemeoinFormData>(initialFormData);
export const errors = writable<FormErrors>(initialErrors);
export const currentStep = writable<number>(1);
export const aiSuggestions = writable<AISuggestion>({
  name: "",
  symbol: "",
  supply: ""
});
export const isGenerating = writable<GenerationStatus>({
  name: false,
  symbol: false,
  supply: false,
  logo: false
});
export const whitepaperGenerated = writable<boolean>(false);

// Funciones para validación
export function validateStep(step: number): boolean {
  let isValid = true;
  let stepErrors = { ...initialErrors };

  try {
    if (step === 1) {
      const formValue = { network: get(formData).network };
      schemas.networkSchema.parse(formValue);
    } else if (step === 2) {
      const formValue = { name: get(formData).name };
      schemas.nameSchema.parse(formValue);
    } else if (step === 3) {
      const formValue = { 
        symbol: get(formData).symbol, 
        supply: get(formData).supply 
      };
      schemas.symbolSchema.parse(formValue);
    }
  } catch (err) {
    isValid = false;
    if (err instanceof z.ZodError) {
      const flatErrors = err.flatten().fieldErrors;
      stepErrors = {
        ...stepErrors,
        ...Object.fromEntries(
          Object.entries(flatErrors).map(([key, value]) => [key, value[0] || ''])
        )
      };
    }
  }

  errors.set(stepErrors);
  return isValid;
}