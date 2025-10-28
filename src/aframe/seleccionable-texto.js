if (!AFRAME.components["seleccionable-texto"]) {
  AFRAME.registerComponent("seleccionable-texto", {
    schema: {
      velocidad: { type: "number", default: 0.002 }, // sensibilidad del arrastre
      minX: { type: "number", default: -1.2 },
      maxX: { type: "number", default:  1.2 },
      minY: { type: "number", default: -1.0 },
      maxY: { type: "number", default:  1.2 },
    },

    init: function () {
      const el = this.el;
      const s = this.data;

      let dragging = false;
      let last = { x: 0, y: 0 };

      const isActivo = () => {
        if (el.classList.contains("bloqueado")) return false; // ✅ no mover si ya acertó
        const url = el.getAttribute("data-modelo-url");
        return window.modeloActivoUrl === url;
      };

      // --- POINTER EVENTS (mouse + touch + stylus) ---
      const onPointerDown = (e) => {
        if (!isActivo()) return;
        dragging = true;
        last.x = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
        last.y = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0;
        e.preventDefault?.();
      };

      const onPointerMove = (e) => {
        if (!dragging || !isActivo()) return;
        const cx = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? last.x;
        const cy = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? last.y;

        const deltaX = (cx - last.x) * s.velocidad;
        const deltaY = (cy - last.y) * s.velocidad;

        const pos = el.getAttribute("position");
        const next = {
          x: Math.max(s.minX, Math.min(s.maxX, pos.x + deltaX)),
          y: Math.max(s.minY, Math.min(s.maxY, pos.y - deltaY)),
          z: pos.z,
        };

        el.setAttribute("position", next);
        last.x = cx; last.y = cy;

        // (opcional) Emite un evento de “arrastrando” por si quieres feedback en UI
        el.emit("modelo-arrastrado", { position: next }, false);

        e.preventDefault?.();
      };

      const onPointerUp = (e) => {
        if (!isActivo()) return;
        dragging = false;
        e.preventDefault?.();
      };

      const iniciar = (canvas) => {
        if (!canvas) return;

        // Pointer events (soporta mouse y touch)
        canvas.addEventListener("pointerdown", onPointerDown, { passive: false });
        canvas.addEventListener("pointermove", onPointerMove, { passive: false });
        canvas.addEventListener("pointerup", onPointerUp, { passive: false });
        canvas.addEventListener("pointercancel", onPointerUp, { passive: false });

        // iOS/Safari: prevenir zoom con doble tap durante el drag
        canvas.style.touchAction = "none";
      };

      if (el.sceneEl.hasLoaded) {
        iniciar(el.sceneEl.canvas);
      } else {
        this._onLoaded = () => iniciar(el.sceneEl.canvas);
        el.sceneEl.addEventListener("render-target-loaded", this._onLoaded, { once: true });
      }

      // Guarda ref para cleanup
      this._cleanup = () => {
        const canvas = el.sceneEl?.canvas;
        if (!canvas) return;
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointercancel", onPointerUp);
      };
    },

    remove: function () {
      // Limpiar listeners para evitar fugas
      try { this._cleanup?.(); } catch {}
      try { this.el.sceneEl?.removeEventListener("render-target-loaded", this._onLoaded); } catch {}
    },
  });
}
