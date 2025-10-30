// hooks/arCleanup.js
export function stopARNow() {
  try { console.log("stopARNow: Limpieza TOTAL de AR"); } catch {}

  // 0) Escena objetivo (la primera <a-scene> existente)
  const scene = document.querySelector("a-scene");

  // 1) Cerrar sesión WebXR (si existe) y pausar escena
  try {
    const sceneEl = scene && scene.sceneEl ? scene.sceneEl : null;
    if (sceneEl && sceneEl.renderer && sceneEl.renderer.xr) {
      const xr = sceneEl.renderer.xr;
      const session = typeof xr.getSession === "function" ? xr.getSession() : null;
      if (session && typeof session.end === "function") {
        session.end().catch(() => {});
      }
    }
  } catch {}

  try { scene?.pause?.(); } catch {}

  // 2) Detener streams de video usados por AR.js (sin pedir nuevos)
  try {
    // a) videos con clase típica de AR.js
    document.querySelectorAll("video.arjs-video").forEach(v => {
      try {
        if (v.srcObject) v.srcObject.getTracks().forEach(t => t.stop());
        v.removeAttribute("src");
        v.srcObject = null;
        v.load?.();
        v.remove();
      } catch {}
    });

    // b) cualquier <video> DENTRO de la escena (fallback seguro)
    if (scene) {
      scene.querySelectorAll("video").forEach(v => {
        try {
          if (v.srcObject) v.srcObject.getTracks().forEach(t => t.stop());
          v.removeAttribute("src");
          v.srcObject = null;
          v.load?.();
          v.remove();
        } catch {}
      });
    }
  } catch {}

  // 3) Liberar renderer/canvas solamente de la escena
  try {
    if (scene && scene.sceneEl && scene.sceneEl.renderer) {
      const r = scene.sceneEl.renderer;
      try { r.dispose?.(); } catch {}
      try { r.forceContextLoss?.(); } catch {}
      try { r.getContext?.()?.getExtension?.("WEBGL_lose_context")?.loseContext?.(); } catch {}
      try { r.domElement?.remove?.(); } catch {}
    }

    // Eliminar canvas A-Frame dentro de la escena
    if (scene) {
      scene.querySelectorAll("canvas.a-canvas").forEach(c => {
        try {
          // extra: por si el contexto no se perdió arriba
          const gl = c.getContext("webgl") || c.getContext("webgl2");
          gl?.getExtension?.("WEBGL_lose_context")?.loseContext?.();
        } catch {}
        try { c.remove(); } catch {}
      });
    }
  } catch {}

  // 4) Eliminar la escena (y dejar React que re-monte cuando corresponda)
  try { scene?.remove?.(); } catch {}

  // 5) Quitar botones/overlays propios de A-Frame
  try {
    document.querySelectorAll(".a-enter-vr, .a-enter-ar, .a-orientation-modal, .a-loader-title, .a-hidden").forEach(el => {
      try { el.remove(); } catch {}
    });
  } catch {}

  // 6) Eliminar SOLO estilos inyectados por A-Frame (clase a-style)
  try {
    document.querySelectorAll("style.a-style").forEach(s => {
      try { s.remove(); } catch {}
    });
  } catch {}

  // 7) Restaurar body (sin tocar estilos generales de la app)
  try {
    document.body.classList.remove("a-body", "a-mobile", "modo-ar");
    document.body.style.overflow = "";
    document.body.style.background = "";
    document.body.style.margin = "";
    document.body.style.padding = "";
    document.body.style.height = "";
    document.body.style.position = "";
  } catch {}

  // 8) Limpiar caché de Three (si disponible)
  try { window.THREE?.Cache?.clear?.(); } catch {}

  // 9) Limpiar globales que tú usas
  try {
    delete window.modeloActivoUrl;
    delete window.verificarClasificacion;
  } catch {}
}
