import { useEffect } from "react";

export const useAR = () => {
  useEffect(() => {
    document.body.classList.add("modo-ar");
    return () => {
      document.body.classList.remove("modo-ar");

      // detener cámara de seguridad
      const video = document.querySelector("video");
      if (video && video.srcObject) {
        try { video.srcObject.getTracks().forEach(t => t.stop()); } catch {}
        video.srcObject = null;
        try { video.remove(); } catch {}
      }

      // 🔸 quitar estilos inline heredados
      try { document.body.removeAttribute("style"); } catch {}
      try { document.documentElement.removeAttribute("style"); } catch {}
      try {
        document.documentElement.classList.remove(
          "a-fullscreen","a-touch","a-no-mouse","a-orientation","a-ios"
        );
      } catch {}
    };
  }, []);
};
