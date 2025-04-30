import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import { useAR } from "../../hooks/useAR";
import HeaderActividad from "../../components/Estudiante/HeaderActividad";
import "../../aframe/arrastrable-texto";

const ActividadModeloTexto = () => {
  useAR();
  const navigate = useNavigate();
  const { casillaId } = useParams();
  const juegoId = sessionStorage.getItem("juegoId");

  const [modelos, setModelos] = useState([]);
  const [textos, setTextos] = useState([]);

  useEffect(() => {
    if (!juegoId || !casillaId) return navigate("/estudiante/dashboard");

    const cargarDatos = async () => {
      const juegoRef = doc(db, "juegos", juegoId);
      const juegoSnap = await getDoc(juegoRef);
      if (juegoSnap.exists()) {
        const casilla = juegoSnap.data().casillas[casillaId];
        const modelosCargados = casilla?.configuracion?.modelos || [];
        setModelos(modelosCargados);
        const etiquetas = modelosCargados.map((m) => m.texto).sort(() => 0.5 - Math.random());
        setTextos(etiquetas);
      }
    };
    cargarDatos();
  }, [juegoId, casillaId, navigate]);

  useEffect(() => {
    window.verificarTextoCorrecto = (el) => {
      const texto = el.getAttribute("valor-texto");
      const posicionTexto = new THREE.Vector3();
      el.object3D.getWorldPosition(posicionTexto);

      document.querySelectorAll(".modelo-objetivo").forEach((modeloEl) => {
        const esperado = modeloEl.getAttribute("texto-correcto");
        const posicionModelo = new THREE.Vector3();
        modeloEl.object3D.getWorldPosition(posicionModelo);

        const distancia = posicionTexto.distanceTo(posicionModelo);
        if (distancia < 0.5 && texto === esperado) {
          el.setAttribute("position", {
            x: posicionModelo.x,
            y: posicionModelo.y + 0.3,
            z: posicionModelo.z,
          });
          el.removeAttribute("arrastrable-texto");
          mostrarFeedback("¡Correcto!");
        }
      });
    };
  }, []);

  const mostrarFeedback = (texto) => {
    const mensaje = document.createElement("a-text");
    mensaje.setAttribute("value", texto);
    mensaje.setAttribute("color", "blue");
    mensaje.setAttribute("position", "0 -0.2 -1");
    mensaje.setAttribute("scale", "0.3 0.3 0.3");
    mensaje.setAttribute("look-at", "[camera]");
    mensaje.setAttribute("id", "mensaje-feedback");

    const cam = document.querySelector("a-entity[camera]");
    cam?.appendChild(mensaje);

    setTimeout(() => mensaje.remove(), 2000);
  };

  return (
    <div className="actividad-ra-container">
      <HeaderActividad titulo="Arrastra el texto al modelo correcto" />
      <a-scene
        arjs="sourceType: webcam; debugUIEnabled: false;"
        vr-mode-ui="enabled: false"
        renderer="antialias: true; alpha: true"
        embedded
      >
        {modelos.map((modelo, idx) => (
          <a-entity
            key={idx}
            class="modelo-objetivo"
            gltf-model={modelo.url}
            position={`${(idx - modelos.length / 2) * 1.2} 0 -3`}
            scale="0.3 0.3 0.3"
            texto-correcto={modelo.texto}
          ></a-entity>
        ))}

        {textos.map((texto, idx) => (
          <a-text
            key={idx}
            value={texto}
            position={`${(idx - textos.length / 2) * 1.2} 1 -1.5`}
            scale="0.5 0.5 0.5"
            color="black"
            look-at="[camera]"
            valor-texto={texto}
            arrastrable-texto
          ></a-text>
        ))}

        <a-entity camera position="0 0 0"></a-entity>
      </a-scene>
    </div>
  );
};

export default ActividadModeloTexto;