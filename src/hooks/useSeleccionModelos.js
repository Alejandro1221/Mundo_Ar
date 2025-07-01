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
          setModelosSeleccionados([]);
        }
      } catch (err) {
        setModelosSeleccionados([]);
      }
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("modelosSeleccionados", JSON.stringify(modelosSeleccionados));
  }, [modelosSeleccionados]);

  return { modelosSeleccionados, setModelosSeleccionados };
};
