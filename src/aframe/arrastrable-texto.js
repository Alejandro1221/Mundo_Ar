/*AFRAME.registerComponent("arrastrable-texto", {
    init: function () {
      const texto = this.el;
      texto.setAttribute("cursor", "rayOrigin: mouse");
      texto.setAttribute("material", "color: #fff");
      texto.setAttribute("geometry", "primitive: plane; height: auto; width: auto;");
      texto.setAttribute("text", {
        align: "center",
        wrapCount: 20,
        color: "#000",
        value: texto.getAttribute("value") || "Texto"
      });
  
      let isDragging = false;
      let offset = new THREE.Vector3();
  
      texto.addEventListener("mousedown", (e) => {
        isDragging = true;
        texto.object3D.parent.worldToLocal(offset.copy(e.detail.intersection.point));
      });
  
      texto.sceneEl.addEventListener("mouseup", () => {
        if (isDragging) {
          isDragging = false;
          verificarCoincidencia(texto);
        }
      });
  
      texto.sceneEl.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const intersection = e.detail.intersection;
        if (intersection) {
          const pos = intersection.point.clone().sub(offset);
          texto.object3D.position.copy(pos);
        }
      });
    }
  });
  
  function verificarCoincidencia(textoEl) {
    const textoValor = textoEl.getAttribute("valor-texto");
    const posicionTexto = new THREE.Vector3();
    textoEl.object3D.getWorldPosition(posicionTexto);
  
    document.querySelectorAll("a-entity[modelo-meta]").forEach((modeloEl) => {
      const esperado = modeloEl.getAttribute("modelo-meta");
      const posicionModelo = new THREE.Vector3();
      modeloEl.object3D.getWorldPosition(posicionModelo);
  
      const distancia = posicionTexto.distanceTo(posicionModelo);
  
      if (distancia < 0.6 && textoValor === esperado) {
        // Posicionar al lado del modelo
        textoEl.setAttribute("position", {
          x: posicionModelo.x + 0.2,
          y: posicionModelo.y + 0.25,
          z: posicionModelo.z
        });
  
        textoEl.setAttribute("material", "color: #00cc66");
        textoEl.removeAttribute("arrastrable-texto");
  
        mostrarMensajeFlotante("¡Correcto!");
      }
    });
  }
  
  function mostrarMensajeFlotante(texto) {
    const mensaje = document.createElement("a-text");
    mensaje.setAttribute("value", texto);
    mensaje.setAttribute("color", "green");
    mensaje.setAttribute("position", "0 1.5 -2");
    mensaje.setAttribute("align", "center");
    mensaje.setAttribute("scale", "0.5 0.5 0.5");
    mensaje.setAttribute("look-at", "[camera]");
  
    document.querySelector("a-scene").appendChild(mensaje);
  
    setTimeout(() => {
      if (mensaje && mensaje.parentNode) mensaje.remove();
    }, 2000);
  }
  */