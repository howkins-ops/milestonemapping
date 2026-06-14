import { useEffect, useState } from "react";
import { safeLoad, safeSave } from "../lib/storage.js";

export function useLocalStorage(key, fallback) {
  const [value, setValue] = useState(() => safeLoad(key, fallback));

  useEffect(() => {
    safeSave(key, value);
  }, [key, value]);

  return [value, setValue];
}
