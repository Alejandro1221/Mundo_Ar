if (!AFRAME.components["arrastrable-modelo"]) {
  AFRAME.registerComponent("arrastrable-modelo", {
    schema: { index: { type: "int" } },

    init: function () {
      const modeloEl = this.el;
      let startTouch = null;

      const registrarEventos = (canvas) => {
        canvas.addEventListener("touchstart", (e) => {
          if (e.touches.length !== 1) return;
          if (modeloEl.classList.contains("bloqueado")) return;
          startTouch = e.touches[0];
        });

        canvas.addEventListener("touchmove", (e) => {
          if (!startTouch || e.touches.length !== 1) return;
          if (modeloEl.classList.contains("bloqueado")) return;

          const touch = e.touches[0];
          const dx = (touch.clientX - startTouch.clientX) * 0.002;
          const dy = (touch.clientY - startTouch.clientY) * 0.002;
          const pos = modeloEl.getAttribute("position");

          modeloEl.setAttribute("position", {
            x: pos.x + dx,
            y: pos.y - dy,
            z: pos.z,
          });

          startTouch = touch;
        });

        canvas.addEventListener("touchend", () => {
          startTouch = null;
        });
      };

      modeloEl.sceneEl.addEventListener("render-target-loaded", () => {
        registrarEventos(modeloEl.sceneEl.canvas);
      });
    },
  });
}
