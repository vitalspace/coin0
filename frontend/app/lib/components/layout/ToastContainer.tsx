// components/ToastContainer.tsx
"use client";

import { X } from 'lucide-react';
import { useToastStore } from "../../stores/toastStore";
import StatusIcon from './StatusIcon';

const colors: Record<string, string> = {
  success: 'bg-green-500/10 border-green-500/30 text-green-400',
  error:   'bg-red-500/10 border-red-500/30 text-red-400',
  info:    'bg-[#6fc7ba]/10 border-[#6fc7ba]/30 text-[#6fc7ba]',
  warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
};

const iconColors: Record<string, string> = {
  success: 'text-green-400',
  error:   'text-red-400',
  info:    'text-[#6fc7ba]',
  warning: 'text-yellow-400',
};

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  return (
    <div className="fixed bottom-4 right-4 z-100 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm min-w-[320px] max-w-[400px] shadow-lg animate-toast-in ${colors[toast.type]}`}
        >
          <div className={`shrink-0 mt-0.5 ${iconColors[toast.type]}`}>
            <StatusIcon type={toast.type} />
          </div>
          <p className="flex-1 text-sm leading-relaxed">{toast.message}</p>
          <button
            onClick={() => remove(toast.id)}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}