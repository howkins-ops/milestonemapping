import { useAppData } from "./useAppData.js";

export function useSettings() {
  const { settings, updateSettings } = useAppData();
  return { settings, updateSettings };
}
