import { useState, useEffect } from "react";

export const useSeleccionModelos = () => {
  const [modelosSeleccionados, setModelosSeleccionados] = useState([]);

  useEffect(() => {
    // Cargar modelos seleccionados desde sessionStorage si existen
    const modelosGuardados = sessionStorage.getItem("modelosSeleccionados");
    if (modelosGuardados) {
      try {
        const modelos = JSON.parse(modelosGuardados);
        if (Array.isArray(modelos)) {
          setModelosSeleccionados(modelos);
        } else {
          console.warn("⚠️ `modelosSeleccionados` no es un array, reinicializando...");
          setModelosSeleccionados([]);
        }
      } catch (err) {
        console.error("❌ Error al parsear `modelosSeleccionados`, reiniciando...", err);
        setModelosSeleccionados([]);
      }
    }
  }, []);

  return { modelosSeleccionados, setModelosSeleccionados };
};
