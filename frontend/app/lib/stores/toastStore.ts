// stores/toastStore.ts
import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastStore {
  toasts: Toast[];
  add: (message: string, type?: ToastType, duration?: number) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  add(message, type = 'info', duration = 4000) {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    if (duration > 0) setTimeout(() => get().remove(id), duration);
  },
  remove(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));

export const toast = {
  success: (message: string, duration?: number) => useToastStore.getState().add(message, 'success', duration),
  error: (message: string, duration?: number) => useToastStore.getState().add(message, 'error', duration),
  warning: (message: string, duration?: number) => useToastStore.getState().add(message, 'warning', duration),
  info: (message: string, duration?: number) => useToastStore.getState().add(message, 'info', duration),
};