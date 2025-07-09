import { useState, useEffect } from "react";

export const useSeleccionModelos = (juegoId, casillaId) => {
  const key = `modelosSeleccionados_${juegoId}_${casillaId}`;
  const [modelosSeleccionados, setModelosSeleccionados] = useState(null); 
  // Cargar desde sessionStorage SOLO si aún no se ha definido
  useEffect(() => {
    if (modelosSeleccionados !== null) return; 
    const modelosGuardados = sessionStorage.getItem(key);
    if (modelosGuardados) {
      try {
        const modelos = JSON.parse(modelosGuardados);
        if (Array.isArray(modelos)) {
          setModelosSeleccionados(modelos);
        } else {
          setModelosSeleccionados([]);
        }
      } catch {
        console.warn("⚠️ Error al leer modelos del sessionStorage");
        setModelosSeleccionados([]);
      }
    } else {
      setModelosSeleccionados([]);
    }
  }, [key, modelosSeleccionados]);

  // Guardar en sessionStorage cada vez que cambien
  useEffect(() => {
    if (Array.isArray(modelosSeleccionados)) {
      sessionStorage.setItem(key, JSON.stringify(modelosSeleccionados));
    }
  }, [modelosSeleccionados, key]);

  return {
    modelosSeleccionados: modelosSeleccionados || [],
    setModelosSeleccionados,
  };
};
