if (!AFRAME.components["colisionable-texto"]) {
  AFRAME.registerComponent("colisionable-texto", {
    tick: function () {
      const cubo = this.el;
      const textoCubo = cubo.getAttribute("data-texto");
      if (!cubo.object3D) return;

      const cuboBox = new THREE.Box3().setFromObject(cubo.object3D);

      document.querySelectorAll("a-entity[modelo-meta]").forEach((modeloEl) => {
        if (!modeloEl.object3D) return;

        const modeloTexto = modeloEl.getAttribute("modelo-meta");
        const modeloBox = new THREE.Box3().setFromObject(modeloEl.object3D);

        if (cuboBox.intersectsBox(modeloBox)) {
          if (
            textoCubo &&
            modeloTexto &&
            textoCubo.trim().toLowerCase() === modeloTexto.trim().toLowerCase()
          ) {
            // Emparejamiento correcto
            if (window.manejarEmparejamiento) {
              window.manejarEmparejamiento(cubo);
            }
          }
        }
      });
    },
  });
}
