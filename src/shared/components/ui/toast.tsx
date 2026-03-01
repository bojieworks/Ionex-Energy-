import { create } from "zustand";
import { useEffect } from "react";
import { cn } from "@/shared/utils/cn";

export type ToastItem = {
  id: string;
  title?: string;
  description?: string;
  type?: "default" | "success" | "error" | "warning";
  duration?: number;
};

type ToastStore = {
  toasts: ToastItem[];
  show: (toast: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
};

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  show: (toast) => {
    const id = Math.random().toString(36).slice(2);
    const duration = toast.duration ?? 3000;
    const item: ToastItem = { id, ...toast };
    set((s) => ({ toasts: [...s.toasts, item] }));
    if (duration > 0) {
      setTimeout(() => get().dismiss(id), duration);
    }
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function useToast() {
  const show = useToastStore((s) => s.show);
  return {
    toast: show,
    success: (msg: string, opts?: Omit<ToastItem, "id" | "type" | "description">) =>
      show({ title: "成功", description: msg, type: "success", ...opts }),
    error: (msg: string, opts?: Omit<ToastItem, "id" | "type" | "description">) =>
      show({ title: "錯誤", description: msg, type: "error", ...opts }),
    warning: (msg: string, opts?: Omit<ToastItem, "id" | "type" | "description">) =>
      show({ title: "提醒", description: msg, type: "warning", ...opts }),
  };
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    // nothing, placeholder for future portal mounting etc.
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute right-4 top-4 flex w-96 max-w-full flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto rounded-md border bg-card p-4 shadow-md",
              t.type === "success" && "border-green-300",
              t.type === "error" && "border-red-300",
              t.type === "warning" && "border-yellow-300",
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-1 h-2 w-2 rounded-full",
                  t.type === "success" && "bg-green-500",
                  t.type === "error" && "bg-red-500",
                  t.type === "warning" && "bg-yellow-500",
                  (!t.type || t.type === "default") && "bg-foreground/40",
                )}
              />
              <div className="flex-1">
                {t.title && <div className="font-semibold">{t.title}</div>}
                {t.description && (
                  <div className="text-sm text-muted-foreground">{t.description}</div>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="ml-2 text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
