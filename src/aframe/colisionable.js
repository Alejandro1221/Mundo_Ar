if (!AFRAME.components["colisionable"]) {
    AFRAME.registerComponent("colisionable", {
      tick: function () {
        const modelo = this.el;
        const objetivo = document.querySelector(".objetivo-sonido");
        if (!modelo.object3D || !objetivo?.object3D) return;
  
        const modeloBox = new THREE.Box3().setFromObject(modelo.object3D);
        const objetivoBox = new THREE.Box3().setFromObject(objetivo.object3D);
  
        if (modeloBox.intersectsBox(objetivoBox)) {
          const modeloURL = modelo.getAttribute("data-modelo-url");
          if (window.manejarSeleccionGlobal && modeloURL) {
            objetivo.setAttribute("material", "color", "#00ff00"); // cambia color
            window.manejarSeleccionGlobal({ url: modeloURL });
          }
        }
      },
    });
  }
  