// utils/fixViewportOnce.js
export function fixViewportOnce() {
  try {
    // 1) Quitar estilos inline que deja A-Frame/AR.js en body/html
    const elBody = document.body;
    const elHtml  = document.documentElement;

    elBody.removeAttribute("style");
    elHtml.removeAttribute("style");

    // Reset explícito por si quedaron valores “pegados”
    Object.assign(elBody.style, {
      width: "", height: "", margin: "", padding: "",
      overflow: "", position: "", background: ""
    });
    Object.assign(elHtml.style, {
      width: "", height: "", overflow: ""
    });

    // 2) Quitar clases que alteran el viewport/layout
    elBody.classList.remove("modo-ar", "a-body", "a-mobile");
    elHtml.classList.remove(
      "a-fullscreen", "a-touch", "a-no-mouse", "a-orientation",
      "a-ios", "a-grab-cursor"
    );

    // 3) Quitar overlays/botones residuales de A-Frame
    document
      .querySelectorAll(".a-enter-vr, .a-enter-ar, .a-orientation-modal, .a-hidden")
      .forEach(el => { try { el.remove(); } catch {} });

    // 4) Forzar reflow y disparar un resize
    void elBody.offsetHeight;
    window.scrollTo(0, 0);
    setTimeout(() => window.dispatchEvent(new Event("resize")), 0);
  } catch {}
}
