if (!AFRAME.components["touch-move"]) {
  AFRAME.registerComponent("touch-move", {
    init: function () {
      const el = this.el;
      const fichaId = parseInt(el.getAttribute("ficha-id"));
      const posOriginal = Object.assign({}, el.getAttribute("position"));
      let startTouch = null;

      el.sceneEl.canvas.addEventListener("touchstart", (e) => {
        console.log("TOCADO:", fichaId, "activo:", window.cuboActivoIndex);
        if (fichaId !== window.cuboActivoIndex || e.touches.length !== 1) return;
        startTouch = e.touches[0];
      });

      el.sceneEl.canvas.addEventListener("touchmove", (e) => {
        if (!startTouch || fichaId !== window.cuboActivoIndex) return;
        const touch = e.touches[0];
        const dx = (touch.clientX - startTouch.clientX) * 0.005;
        const dy = (touch.clientY - startTouch.clientY) * 0.002;
        const pos = el.getAttribute("position");
        el.setAttribute("position", { x: pos.x + dx, y: pos.y - dy, z: pos.z });
        startTouch = touch;
      });

      el.sceneEl.canvas.addEventListener("touchend", () => {
        if (window.encajados && window.encajados[fichaId]) return;
        const actualPos = el.getAttribute("position");
        const tolerancia = 0.1;
        let encajada = false;

        if (window.zonasRef && window.cubosData) {
          const fichaOriginal = window.cubosData[fichaId]?.fichaOriginal;

          window.zonasRef.forEach((zona) => {
            const posZona = zona.getAttribute("position");
            const zonaId = parseInt(zona.getAttribute("zona-id"));
            const dx = Math.abs(actualPos.x - posZona.x);
            const dy = Math.abs(actualPos.y - posZona.y);

            if (dx < tolerancia && dy < tolerancia && fichaOriginal === zonaId) {
              el.setAttribute("position", {
                x: posZona.x,
                y: posZona.y,
                z: posZona.z + 0.03,
              });
              el.removeAttribute("touch-move");
              encajada = true;
              
              if (typeof window.marcarCuboComoEncajado === "function") {
                window.marcarCuboComoEncajado(fichaId);
              }
            }
          });
        }

        if (!encajada) {
          el.setAttribute("position", posOriginal);
        }

        startTouch = null;
      });
    },
  });
}
