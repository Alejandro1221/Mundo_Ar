import { useEffect } from "react";

export const useAR = () => {
  useEffect(() => {
    // Estilos de modo AR (guardar y restaurar al salir)
    const prevOverflow = document.body.style.overflow || "";
    const prevTouchAction = document.body.style.touchAction || "";
    document.body.classList.add("modo-ar");
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      // 1) Restaurar body
      document.body.classList.remove("modo-ar");
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;

      // 2) Apagar cámara y retirar SOLO videos de AR.js
      const isARVideo = (v) =>
        v.id === "arjs-video" ||
        (v.autoplay && v.hasAttribute("playsinline") && v.hasAttribute("muted"));

      document.querySelectorAll("video").forEach((v) => {
        if (isARVideo(v) && v.srcObject instanceof MediaStream) {
          try { v.srcObject.getTracks().forEach((t) => t.stop()); } catch {}
          v.srcObject = null;
          v.parentNode?.removeChild(v);
        }
      });

      // 3) Quitar UI auxiliar de A-Frame si quedó viva
      document.querySelectorAll(".a-enter-vr, .a-loader-title")
        .forEach((n) => n?.parentNode?.removeChild(n));

      // 4) Nudge de layout (iOS/Safari a veces queda “pegado” tras cerrar cámara)
      try { window.dispatchEvent(new Event("resize")); } catch {}
    };
  }, []);
};
