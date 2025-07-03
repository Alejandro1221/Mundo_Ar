import { useState, useEffect } from "react";

/**
 * Hook para manejar modelos seleccionados por juego y casilla.
 * Aísla los datos usando una clave única por combinación de juegoId y casillaId.
 */
export const useSeleccionModelos = (juegoId, casillaId) => {
  const key = `modelosSeleccionados_${juegoId}_${casillaId}`;
  const [modelosSeleccionados, setModelosSeleccionados] = useState([]);

  // Cargar desde sessionStorage
  useEffect(() => {
    const modelosGuardados = sessionStorage.getItem(key);
    if (modelosGuardados) {
      try {
        const modelos = JSON.parse(modelosGuardados);
        if (Array.isArray(modelos)) {
          setModelosSeleccionados(modelos);
        }
      } catch {
        setModelosSeleccionados([]);
      }
    }
  }, [key]);

  // Guardar en sessionStorage cada vez que cambien
  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(modelosSeleccionados));
  }, [modelosSeleccionados, key]);

  return { modelosSeleccionados, setModelosSeleccionados };
};
