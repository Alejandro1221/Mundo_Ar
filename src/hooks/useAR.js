import { useEffect } from "react";
import { stopARNow } from "./arCleanup";

export const useAR = () => {
  useEffect(() => {
    document.body.classList.add("modo-ar");
    return () => {
      // limpieza fuerte y reset de viewport
      try { stopARNow(); } catch {}
      document.body.classList.remove("modo-ar");
    };
  }, []);
};