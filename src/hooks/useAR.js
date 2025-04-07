import { useEffect } from "react";

export const useAR = () => {
  useEffect(() => {
    // ✅ Activar estilos AR
    document.body.classList.add("modo-ar");

    return () => {
      // ✅ Limpiar estilos y cámara
      document.body.classList.remove("modo-ar");

      const video = document.querySelector("video");
      if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
        video.remove(); // Extra seguridad
      }
    };
  }, []);
};
