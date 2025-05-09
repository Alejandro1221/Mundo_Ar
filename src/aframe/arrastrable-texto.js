if (!AFRAME.components["arrastrable-texto"]) {
  AFRAME.registerComponent("arrastrable-texto", {
    schema: {
      index: { type: "int" },
    },
    init: function () {
      const texto = this.el;
      let startTouch = null;
      let estaActiva = false;

      const registrarEventos = (canvas) => {
        canvas.addEventListener("touchstart", (e) => {
          if (e.touches.length !== 1) return;
          const touch = e.touches[0];
          const boundingBox = canvas.getBoundingClientRect();
          const x = touch.clientX;
          const y = touch.clientY;
    
          // Verifica si el toque está cerca de esta tarjeta
          const pos = texto.getAttribute("position");
          const camera = texto.sceneEl.camera;
          if (!camera) return;
    
          const worldPos = new THREE.Vector3(pos.x, pos.y, pos.z);
          worldPos.project(camera);
    
          const screenX = (worldPos.x * 0.5 + 0.5) * boundingBox.width;
          const screenY = (1 - (worldPos.y * 0.5 + 0.5)) * boundingBox.height;
    
          const dist = Math.sqrt((screenX - x) ** 2 + (screenY - y) ** 2);
    
          if (dist < 50) {
            estaActiva = true;
            startTouch = touch;
          }
        });
    
        canvas.addEventListener("touchmove", (e) => {
          if (!startTouch || !estaActiva) return;
          const touch = e.touches[0];
          const dx = (touch.clientX - startTouch.clientX) * 0.05;
          const dy = (touch.clientY - startTouch.clientY) * 0.02;
          const pos = texto.getAttribute("position");
          texto.setAttribute("position", {
            x: pos.x + dx,
            y: pos.y - dy,
            z: pos.z,
          });
          startTouch = touch;
        });
    
        canvas.addEventListener("touchend", () => {
          if (!estaActiva) return;
          estaActiva = false;
        
          // Extrae el índice correctamente
          const index = texto.getAttribute("data-index") || texto.components["arrastrable-texto"]?.data?.index;
        
          if (index !== undefined) {
            verificarCoincidencia(texto, parseInt(index));
          }
        
          startTouch = null;
        });
      };
    
      texto.sceneEl.addEventListener("render-target-loaded", () => {
        console.log("🎯 A-Frame renderizado, registrando eventos táctiles");
        registrarEventos(texto.sceneEl.canvas);
      });
    }
    
  });

  function verificarCoincidencia(textoEl, index) {
    console.log("📌 Verificando coincidencia para index:", index);
  
    const textoValor =
      textoEl.getAttribute("value") ||
      textoEl.querySelector("a-text")?.getAttribute("value");
  
    const posicionTexto = new THREE.Vector3();
    textoEl.object3D.getWorldPosition(posicionTexto);
  
    const totalTarjetas = document.querySelectorAll("[arrastrable-texto]").length;
    if (totalTarjetas === 0) {
      console.warn("⚠️ No hay tarjetas disponibles.");
      return;
    }
  
    const siguienteIndex = index + 1;
  
    document.querySelectorAll("[modelo-meta]").forEach((modeloEl) => {
      const esperado = modeloEl.getAttribute("modelo-meta");
      if (!esperado) return;
  
      const posicionModelo = new THREE.Vector3();
      modeloEl.object3D.getWorldPosition(posicionModelo);
  
      const distancia = posicionTexto.distanceTo(posicionModelo);
      console.log("👀 Comparando:", textoValor, "vs", esperado, "→ Distancia:", distancia);

      if (distancia < 0.20 && textoValor?.toLowerCase().trim() === esperado?.toLowerCase().trim()) {

      //if (distancia < 0.5 && textoValor === esperado) {
        textoEl.setAttribute("position", {
          x: posicionModelo.x,
          y: posicionModelo.y + 0.30,
        });
  
        const aText = textoEl.querySelector("a-text");
        if (aText) {
          aText.setAttribute("color", "#00cc66");
        }
  
        textoEl.removeAttribute("arrastrable-texto");
        mostrarMensajeFlotante("¡Correcto!");
  
        const siguiente = document.querySelector(`[data-index="${siguienteIndex}"]`);
        if (siguiente) {
          window.textoActivoIndex = siguienteIndex;
          siguiente.setAttribute("data-activo", "true");
          console.log("🔁 Activando siguiente tarjeta:", siguienteIndex);
        } else {
          console.log("✅ Todas las tarjetas completadas.");
          mostrarMensajeFlotante("¡Actividad completada!");
        }
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
      if (mensaje.parentNode) mensaje.remove();
    }, 2000);
  }
}
