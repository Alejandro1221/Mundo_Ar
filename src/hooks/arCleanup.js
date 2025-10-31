// hooks/arCleanup.js
export function stopARNow() {
  try { console.log("[AR] stopARNow → limpieza TOTAL"); } catch {}

  const scene = document.querySelector("a-scene");

  // 1) Cerrar sesión WebXR (si está activa) y pausar la escena
  try {
    const xr = scene?.sceneEl?.renderer?.xr;
    const session = (xr && typeof xr.getSession === "function") ? xr.getSession() : null;
    if (session && typeof session.end === "function") {
      session.end().catch(() => {});
    }
  } catch {}
  try { scene?.pause?.(); } catch {}

  // 2) Detener y eliminar TODOS los <video> que puedan tener la cámara
  try {
    document.querySelectorAll("video.arjs-video, a-scene video, body > video, video").forEach(v => {
      try { v.srcObject?.getTracks?.()?.forEach(t => t.stop()); } catch {}
      try { v.removeAttribute?.("src"); v.srcObject = null; v.load?.(); } catch {}
      try { v.remove?.(); } catch {}
    });
  } catch {}

  // 3) Soltar renderer/canvas de A-Frame para liberar GPU/GL
  try {
    const r = scene?.sceneEl?.renderer;
    try { r?.dispose?.(); } catch {}
    try { r?.forceContextLoss?.(); } catch {}
    try {
      const gl = r?.getContext?.() || r?.domElement?.getContext?.("webgl") || r?.domElement?.getContext?.("webgl2");
      gl?.getExtension?.("WEBGL_lose_context")?.loseContext?.();
    } catch {}
    try { r?.domElement?.remove?.(); } catch {}

    scene?.querySelectorAll("canvas.a-canvas, canvas").forEach(c => {
      try {
        const gl = c.getContext?.("webgl") || c.getContext?.("webgl2");
        gl?.getExtension?.("WEBGL_lose_context")?.loseContext?.();
      } catch {}
      try { c.remove?.(); } catch {}
    });
  } catch {}

  // 4) Eliminar overlays/botones/loader de A-Frame/AR.js
  try {
    document.querySelectorAll(
      ".a-enter-vr, .a-enter-ar, .a-orientation-modal, .a-loader-title, .a-hidden, .arjs-loader"
    ).forEach(el => { try { el.remove(); } catch {} });
  } catch {}

  // 5) Quitar <style> inyectados por A-Frame
  try { document.querySelectorAll("style.a-style").forEach(s => s.remove()); } catch {}

  // 6) Eliminar la escena por completo (React la re-montará cuando toque)
  try { scene?.remove?.(); } catch {}

  // 7) Restaurar <html> y <body> (clases/estilos que distorsionan el viewport)
  try {
    const el = document.documentElement; // <html>
    const bd = document.body;

    [el, bd].forEach(n => {
      // Clases típicas de A-Frame/AR.js
      n.classList.remove(
        "a-fullscreen", "a-body", "a-mobile", "a-touch", "a-no-mouse",
        "a-orientation", "a-ios", "a-desktop", "modo-ar"
      );

      // Limpiar estilos inline peligrosos
      [
        "width","height","margin","marginLeft","marginTop","marginRight","marginBottom",
        "padding","position","overflow","background","backgroundColor","transform"
      ].forEach(k => { try { n.style[k] = ""; } catch {} });

      // Por si quedó style="..."
      try { n.removeAttribute("style"); } catch {}
    });

    // Reset mínimos “seguros”
    bd.style.overflow = "";   // vuelve a usar lo definido por tus CSS
    bd.style.position = "";
  } catch {}

  // 8) Limpiar globales que tu código usa
  try {
    delete window.modeloActivoUrl;
    delete window.verificarClasificacion;
  } catch {}

  // 9) (Opcional) Limpiar caché de Three
  try { window.THREE?.Cache?.clear?.(); } catch {}

  // 10) Forzar reflow + resize para recalcular layout con el viewport real
  try {
    void document.body.offsetHeight; // reflow
    setTimeout(() => window.dispatchEvent(new Event("resize")), 60);
    setTimeout(() => window.scrollTo(0, 0), 80);
  } catch {}
}
