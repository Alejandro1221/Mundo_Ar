import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import { useAR } from "../../hooks/useAR";
import "../../assets/styles/estudiante/ActividadRompecabezas.css";

const ActividadRompecabezas = () => {
  useAR();
  const navigate = useNavigate();
  const [imagenUrl, setImagenUrl] = useState(null);
  const [celebracion, setCelebracion] = useState(null);
  const [encajados, setEncajados] = useState(Array(6).fill(false));
  const mensajeRef = useRef();
  const cubosRef = useRef([]);
  const zonasRef = useRef([]);
  const cuboActivoIndex = useRef(0);

  useEffect(() => {
    const juegoId = sessionStorage.getItem("juegoId");
    const casillaId = sessionStorage.getItem("casillaId");

    if (!juegoId || !casillaId) {
      alert("No se encontró el juego o casilla.");
      navigate("/estudiante/dashboard");
      return;
    }

    const cargarConfiguracion = async () => {
      const docRef = doc(db, "juegos", juegoId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const configuracion = docSnap.data()?.casillas?.[casillaId]?.configuracion;
        if (configuracion?.imagen) setImagenUrl(configuracion.imagen);
        if (configuracion?.celebracion) setCelebracion(configuracion.celebracion);
      }
    };

    cargarConfiguracion();
  }, [navigate]);

  useEffect(() => {
    if (!imagenUrl) return;

    AFRAME.registerComponent("touch-move", {
      init: function () {
        const el = this.el;
        const fichaId = parseInt(el.getAttribute("ficha-id"));
        const posOriginal = Object.assign({}, el.getAttribute("position"));
        let startTouch = null;

        el.sceneEl.canvas.addEventListener("touchstart", (e) => {
          if (fichaId !== cuboActivoIndex.current || e.touches.length !== 1) return;
          startTouch = e.touches[0];
        });

        el.sceneEl.canvas.addEventListener("touchmove", (e) => {
          if (!startTouch || fichaId !== cuboActivoIndex.current) return;
          const touch = e.touches[0];
          const dx = (touch.clientX - startTouch.clientX) * 0.002;
          const dy = (touch.clientY - startTouch.clientY) * 0.002;
          const pos = el.getAttribute("position");
          el.setAttribute("position", { x: pos.x + dx, y: pos.y - dy, z: pos.z });
          startTouch = touch;
        });

        el.sceneEl.canvas.addEventListener("touchend", () => {
          if (encajados[fichaId]) return;
          const actualPos = el.getAttribute("position");
          const tolerancia = 0.1;

          let encajada = false;

          zonasRef.current.forEach((zona, idx) => {
            const posZona = zona.getAttribute("position");
            const dx = Math.abs(actualPos.x - posZona.x);
            const dy = Math.abs(actualPos.y - posZona.y);
            if (dx < tolerancia && dy < tolerancia && fichaId === idx) {
              el.setAttribute("position", { x: posZona.x, y: posZona.y, z: posZona.z });
              encajados[fichaId] = true;
              el.removeAttribute("touch-move");
              encajada = true;
            }
          });

          if (!encajada) {
            el.setAttribute("position", posOriginal);
          } else {
            let next = cuboActivoIndex.current;
            do {
              next = (next + 1) % 6;
            } while (encajados[next] && next !== cuboActivoIndex.current);
            cuboActivoIndex.current = next;

            if (encajados.every(v => v)) {
              mensajeRef.current.setAttribute("visible", true);
            }
          }

          startTouch = null;
        });
      },
    });
  }, [imagenUrl, encajados]);

  return (
    <a-scene
      embedded
      arjs="sourceType: webcam;"
      vr-mode-ui="enabled: false"
      renderer="antialias: true; alpha: true"
    >
      <a-entity camera></a-entity>
      <a-plane color="#D3D3D3" width="0.6" height="0.9" position="-0.6 0 -2" opacity="0.3"></a-plane>
      <a-plane color="#A9CCE3" width="0.6" height="0.9" position="0.6 0 -2" opacity="0.2"></a-plane>

      <a-entity id="zonas">
        {[...Array(6)].map((_, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const pos = `${0.5 + col * 0.2} ${0.3 - row * 0.3} -2.01`;
          return (
            <a-box
              key={i}
              class="zona"
              zona-id={i}
              position={pos}
              depth="0.26"
              height="0.26"
              width="0.26"
              color="#EEE"
              opacity="0.3"
              ref={(el) => (zonasRef.current[i] = el)}
            ></a-box>
          );
        })}
      </a-entity>

      <a-text
        id="mensaje-exito"
        value="¡Rompecabezas completo!"
        visible="false"
        position="0 1.5 -2"
        align="center"
        color="lime"
        scale="1.5 1.5 1.5"
        ref={mensajeRef}
      ></a-text>

      <a-assets>
        <img id="imagen-rompecabezas" src={imagenUrl} crossOrigin="anonymous" />
      </a-assets>

      <a-entity id="cubos">
      {imagenUrl &&
        [...Array(6)].map((_, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const x = -0.6 + col * 0.2;
          const y = 0.3 - row * 0.3;
          const offset = `${col * 0.5} ${1 - row * 0.33}`;
          
          return (
            <a-box
              key={i}
              ficha-id={i}
              depth="0.25"
              height="0.25"
              width="0.25"
              position={`${x} ${y} -2`}
              //material={`src: ${imagenUrl}; repeat: 0.5 0.33; offset: ${offset}; crossorigin: anonymous`}
              //material={`src: ${imagenUrl}; repeat: 0.5 0.33; offset: ${offset}`}
              material={`src: #imagen-rompecabezas; repeat: 0.5 0.33; offset: ${offset}`}
              touch-move
              ref={(el) => (cubosRef.current[i] = el)}
            ></a-box>
          );
        })}

      </a-entity>
    </a-scene>
  );
};

export default ActividadRompecabezas;
