if (!AFRAME.components["seleccionable-texto"]) {
  AFRAME.registerComponent("seleccionable-texto", {
    init: function () {
      const el = this.el;
      let startTouch = null;

      const isActivo = () => {
        const url = el.getAttribute("data-modelo-url");
        return window.modeloActivoUrl === url;
      };

      const iniciarEventos = (canvas) => {
        if (!canvas) return;

        canvas.addEventListener("touchstart", (e) => {
          if (!isActivo()) return;
          if (e.touches.length !== 1) return;
          startTouch = e.touches[0];
        });

        canvas.addEventListener("touchmove", (e) => {
          if (!startTouch || !isActivo()) return;
          if (e.touches.length !== 1) return;

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

        canvas.addEventListener("touchend", () => {
          if (!isActivo()) return;
          startTouch = null;
        });
      };

      if (el.sceneEl.hasLoaded) {
        iniciarEventos(el.sceneEl.canvas);
      } else {
        el.sceneEl.addEventListener("render-target-loaded", () => {
          iniciarEventos(el.sceneEl.canvas);
        });
      }
    },
  });
}
