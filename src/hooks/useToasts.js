import { useAppData } from "./useAppData.js";

export function useToasts() {
  const { toasts, pushToast, dismissToast } = useAppData();
  return { toasts, pushToast, dismissToast };
}
