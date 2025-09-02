export const resetAR = () => {
  document.body.classList.remove("modo-ar");
  document.body.style.overflow = "";

  // Apagar cámaras
  document.querySelectorAll("video").forEach(v => {
    try { v.srcObject?.getTracks?.().forEach(t => t.stop()); } catch {}
    if (v.srcObject) v.srcObject = null;
  });

  // Quitar escenas/overlays AR
  document.querySelectorAll("a-scene, .arjs-loader, .arjs-video, .a-loader")
    .forEach(n => { try { n.remove(); } catch {} });
};
