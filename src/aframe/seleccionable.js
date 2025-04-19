if (!AFRAME.components["seleccionable"]) {
  AFRAME.registerComponent("seleccionable", {
    init: function () {
      const el = this.el;
      let startTouch = null;

      el.sceneEl.canvas.addEventListener("touchstart", (e) => {
        const url = el.getAttribute("data-modelo-url");
        if (window.modeloActivoUrl !== url) return;
        if (e.touches.length !== 1) return;
        startTouch = e.touches[0];
      });

      el.sceneEl.canvas.addEventListener("touchmove", (e) => {
        if (!startTouch || e.touches.length !== 1) return;
        const touch = e.touches[0];
        const deltaX = (touch.clientX - startTouch.clientX) * 0.002;
        const deltaY = (touch.clientY - startTouch.clientY) * 0.002;

        const pos = el.getAttribute("position");
        el.setAttribute("position", {
          x: Math.max(-1.2, Math.min(1.2, pos.x + deltaX)),
          y: Math.max(-1, Math.min(1.2, pos.y - deltaY)),
          z: pos.z,
        });

        startTouch = touch;
      });

      el.sceneEl.canvas.addEventListener("touchend", () => {
        startTouch = null;

        // ✅ SOLO si existe verificarClasificacion
        if (typeof window.verificarClasificacion === "function") {
          window.verificarClasificacion(el);
        }
      });
    },
  });
}
