if (!AFRAME.components["colision-modelo-texto"]) {
  AFRAME.registerComponent("colision-modelo-texto", {
    schema: { textoId: { type: "string" } },

    init: function () {
      this.detectado = false;
    },

    tick: function () {
      if (this.detectado) return;

      const modeloEl = this.el;
      const textoEl = document.querySelector(`#${this.data.textoId}`);
      if (!textoEl) return;

      const textoMeta = textoEl.querySelector("a-text")?.getAttribute("texto-meta")?.trim()?.toLowerCase();
      const modeloMeta = modeloEl.getAttribute("modelo-meta")?.trim()?.toLowerCase();
      if (textoMeta !== modeloMeta) return;

      const posModelo = new THREE.Vector3();
      const posTexto = new THREE.Vector3();
      modeloEl.object3D.getWorldPosition(posModelo);
      textoEl.object3D.getWorldPosition(posTexto);

      const distancia = posModelo.distanceTo(posTexto);

      if (distancia < 0.1 && !modeloEl.classList.contains("bloqueado")) {
        this.detectado = true;

        modeloEl.classList.add("bloqueado");
        modeloEl.removeAttribute("arrastrable-modelo");
        modeloEl.removeAttribute("seleccionable-texto");

        const textoPos = textoEl.getAttribute("position");
        modeloEl.setAttribute("position", {
          x: textoPos.x,
          y: textoPos.y + 0.15,
          z: textoPos.z,
        });
        modeloEl.setAttribute("scale", "0.3 0.3 0.3");

        textoEl.querySelector("a-text")?.setAttribute("color", "#00cc66");
        mostrarMensajeFlotante("¡Excelente!");

        if (typeof window.avanzarModeloActivo === "function") {
          setTimeout(() => window.avanzarModeloActivo(), 600);
        }

        const total = document.querySelectorAll("[modelo-meta]").length;
        const bloqueados = document.querySelectorAll(".bloqueado").length;
        if (bloqueados === total) {
          setTimeout(() => {
            mostrarMensajeFlotante("🎉 ¡Actividad completada!");
          }, 1200);
        }
      }
    },
  });

  function mostrarMensajeFlotante(texto = "¡Excelente!") {
    const escena = document.querySelector("a-scene");
    if (!escena) return;

    const wrapper = document.createElement("a-entity");

    const fondo = document.createElement("a-plane");
    fondo.setAttribute("width", 1.6);
    fondo.setAttribute("height", 0.5);
    fondo.setAttribute("color", "#000");
    fondo.setAttribute("opacity", 0.7);
    fondo.setAttribute("position", "0 0 0");

    const mensaje = document.createElement("a-text");
    mensaje.setAttribute("value", texto);
    mensaje.setAttribute("align", "center");
    mensaje.setAttribute("color", "#00cc66");
    mensaje.setAttribute("width", 4);
    mensaje.setAttribute("position", "0 0 0.01");

    wrapper.setAttribute("position", "0 1.5 -2");
    wrapper.setAttribute("look-at", "[camera]");
    wrapper.setAttribute("class", "feedback");

    wrapper.appendChild(fondo);
    wrapper.appendChild(mensaje);
    escena.appendChild(wrapper);

    setTimeout(() => wrapper.remove(), 2500);
  }
}
