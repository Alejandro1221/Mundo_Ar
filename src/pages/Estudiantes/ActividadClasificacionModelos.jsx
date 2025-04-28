import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import { useAR } from "../../hooks/useAR";
import "../../assets/styles/estudiante/ActividadClasificacionModelos.css";
import HeaderActividad from "../../components/Estudiante/HeaderActividad";

import "../../aframe/seleccionable";

const ActividadClasificacionModelos = () => {
  useAR();
  const navigate = useNavigate();
  const [modelos, setModelos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [celebracion, setCelebracion] = useState({ tipo: "mensaje", opciones: {} });
  const [modeloActivo, setModeloActivo] = useState(null);

  const juegoId = sessionStorage.getItem("juegoId");
  const casillaId = sessionStorage.getItem("casillaId");

  useEffect(() => {
    window.modeloActivoUrl = modeloActivo;
  }, [modeloActivo]);

  useEffect(() => {
    if (!juegoId || !casillaId) {
      alert("Error: No se encontró el juego o la casilla.");
      navigate("/estudiante/dashboard");
      return;
    }

    const cargarConfiguracion = async () => {
      const juegoRef = doc(db, "juegos", juegoId);
      const juegoSnap = await getDoc(juegoRef);

      if (juegoSnap.exists()) {
        const casilla = juegoSnap.data().casillas[casillaId];
        if (casilla?.configuracion) {
          setModelos(casilla.configuracion.modelos || []);
          setGrupos(casilla.configuracion.grupos || []);
          setCelebracion(casilla.configuracion.celebracion || { tipo: "mensaje", opciones: {} });
        } else {
          alert("⚠️ Esta casilla no tiene configuración.");
        }
      }
    };

    cargarConfiguracion();
  }, [juegoId, casillaId, navigate]);

  useEffect(() => {
    window.verificarClasificacion = (modeloEl) => {
      console.log("🟡 Verificando clasificación de:", modeloEl.getAttribute("data-modelo-url")); // DEBUG
      const categoriaModelo = modeloEl.getAttribute("grupo");
      const posicionModelo = new THREE.Vector3();
      modeloEl.object3D.getWorldPosition(posicionModelo);

      document.querySelectorAll("a-box[categoria]").forEach((zona) => {
        const categoriaZona = zona.getAttribute("categoria");
        const posicionZona = new THREE.Vector3();
        zona.object3D.getWorldPosition(posicionZona);

        const distancia = posicionModelo.distanceTo(posicionZona);
        if (distancia < 0.6 && categoriaModelo === categoriaZona) {
          zona.setAttribute("material", "color:rgb(90, 216, 199); opacity: 0.9; transparent: true");

          modeloEl.setAttribute("position", {
            x: zona.getAttribute("position").x,
            y: zona.getAttribute("position").y + 0.25,
            z: zona.getAttribute("position").z
          });

          modeloEl.setAttribute("scale", "0.08 0.08 0.08");
          modeloEl.removeAttribute("seleccionable");

          mostrarFeedback("¡Correcto!");
        }
      });
    };
  }, [grupos]);

  const mostrarFeedback = (texto) => {
    const prev = document.getElementById("mensaje-feedback");
    if (prev) prev.remove();
  
    const mensaje = document.createElement("a-text");
    mensaje.setAttribute("value", texto);
    mensaje.setAttribute("color", "blue");
    mensaje.setAttribute("position", "0 -0.2 -1"); 
    mensaje.setAttribute("align", "center");
    mensaje.setAttribute("scale", "0.3 0.3 0.3");
    mensaje.setAttribute("id", "mensaje-feedback");
    mensaje.setAttribute("side", "double");
    mensaje.setAttribute("look-at", "[camera]");
  
    const cam = document.querySelector("a-entity[camera]");
    if (cam) {
      cam.appendChild(mensaje);
    }
  
    setTimeout(() => {
      if (mensaje && mensaje.parentNode) mensaje.remove();
    }, 2000);
  };

  return (
    <div className="actividad-ra-container">
      <HeaderActividad titulo="Clasifica los modelos" />

      <a-scene
        arjs="sourceType: webcam; facingMode: environment; debugUIEnabled: false;"
        vr-mode-ui="enabled: false"
        renderer="antialias: true; alpha: true; logarithmicDepthBuffer: true"
        background="transparent: true"
      >
        {grupos.map((grupo, index) => (
          <a-entity key={index}>
            <a-box
              categoria={grupo}
              position={`${(index - (grupos.length - 1) / 2) * 1} 0 -3`}
              depth="0.3" height="0.3" width="0.3"
              color="#4CAF50"
              material="opacity: 0.5; transparent: true"
            ></a-box>
            <a-text
              value={grupo}
              position={`${(index - (grupos.length - 1) / 1.9) * 2.3} 0.85 -8`}
              align="center"
              anchor="center"
              baseline="top"
              wrap-count="11"
              width="2.4"
              scale="1 1 1"
              color="#ffffff"
              class="texto-grupo"
            ></a-text>
          </a-entity>
        ))}

        {modelos.map((modelo, index) => (
          <a-entity
            key={index}
            gltf-model={modelo.url}
            position={`0 ${(index - (modelos.length - 1) / 2) * -1.2} -3`}
            scale="0.25 0.25 0.25"
            grupo={modelo.grupo}
            seleccionable
            data-modelo-url={modelo.url}
          ></a-entity>
        ))}

        <a-entity camera="fov: 95" position="0 0 0"></a-entity>
      </a-scene>

      <div className="controles-modelos">
        {modelos.map((modelo, index) => (
          <button
            key={index}
            className={`btn-modelo ${modelo.url === modeloActivo ? "activo" : ""}`}
            onClick={() => setModeloActivo(modelo.url)}
          >
            {modelo.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ActividadClasificacionModelos;
