import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import HeaderActividad from "../../components/Estudiante/HeaderActividad";
import "../../assets/styles/estudiante/actividadModeloTexto.css";
import "../../aframe/arrastrable-modelo";
import "../../aframe/colision-modelo-texto";
import "../../aframe/seleccionable-texto";

const ActividadModeloTexto = ({ vistaPrevia = false }) => {
  const navigate = useNavigate();
  const casillaId = sessionStorage.getItem("casillaId");
  const juegoId = sessionStorage.getItem("juegoId");
  const [modelos, setModelos] = useState([]);

  const [modeloActivoIndex, setModeloActivoIndex] = useState(0);

useEffect(() => {
  const establecerModeloActivo = (modelos) => {
    setModelos(modelos);
    if (modelos.length > 0) {
      setModeloActivoIndex(0);
      window.modeloActivoUrl = modelos[0].url; 
    }
  };

    if (vistaPrevia) {
      const modelosGuardados = JSON.parse(
        sessionStorage.getItem("modelosSeleccionados") || "[]"
      );

      establecerModeloActivo(modelosGuardados);
      return;
    }

  const cargarModelos = async () => {
    if (!juegoId || casillaId === null) {
      navigate("/estudiante/dashboard");
      return;
    }

    try {
      const index = parseInt(casillaId);
      const juegoRef = doc(db, "juegos", juegoId);
      const juegoSnap = await getDoc(juegoRef);

      if (!juegoSnap.exists()) return;

      const data = juegoSnap.data();
      const casilla = data.casillas[index];

      if (!casilla?.configuracion?.modelos) return;

      const modelosCargados = casilla.configuracion.modelos.filter(
        (m) => m && m.url && m.texto && m.texto.trim() !== ""
      );

      establecerModeloActivo(modelosCargados);
    } catch (error) {
      console.error("❌ Error al cargar los modelos:", error);
    }
  };

  cargarModelos();
}, [vistaPrevia, casillaId, juegoId, navigate]);

useEffect(() => {
  if (modelos[modeloActivoIndex]) {
    window.modeloActivoUrl = modelos[modeloActivoIndex].url;
  }

  window.avanzarModeloActivo = () => {
    setModeloActivoIndex((prev) => {
      const siguiente = (prev + 1) % modelos.length;
      window.modeloActivoUrl = modelos[siguiente]?.url;
      return siguiente;
    });
  };
}, [modeloActivoIndex, modelos]);


  return (
    <div className="actividad-ra-container">
      <HeaderActividad titulo="arrastra el modelo 3d y llevalo hasta el texto correspondiente" />
      <a-scene
        arjs="sourceType: webcam;"
        vr-mode-ui="enabled: false"
        renderer="antialias: true; alpha: true; logarithmicDepthBuffer: true"
        background="transparent: true"
      >
        
        {/* Modelos 3D */}
        {modelos.map((modelo, i) => (
          <a-entity
            id={`modelo-${i}`}
            key={`modelo-${i}`}
            gltf-model={modelo.url}
            position={`${-0.3 + i * 0.6} -0.5 -2`}
            scale="0.5 0.5 0.5"
            modelo-meta={modelo.texto}
            seleccionable-texto
            data-modelo-url={modelo.url}
            arrastrable-modelo={`index: ${i}`}
            colision-modelo-texto={`textoId: texto-${i}`}
            activo={i === modeloActivoIndex ? "true" : "false"}
          > {i === modeloActivoIndex && (
            <a-ring
              class="indicador-activo"
              position="0 0.01 0"
              color="#FFDD00"
              radius-inner="0.25"
              radius-outer="0.35"
              rotation="-90 0 0"
              animation="property: scale; to: 1.2 1.2 1.2; dur: 1000; dir: alternate; loop: true"
            ></a-ring>
          )}
          </a-entity>
        ))}

        {/* Tarjetas de texto */}
        {modelos.map((modelo, i) => {
          const texto = modelo.texto.trim();
          const posX = -0.3 + i * 0.6;

          return (
            <a-entity
              id={`texto-${i}`}
              key={`texto-${i}`}
              geometry="primitive: plane; height: 0.2; width: 0.3"
              material="opacity: 0"
              position={`${posX} 0.4 -2`}
              data-index={i}
              data-activo={i === 0 ? "true" : "false"}
            >
              <a-plane
                width="0.3"
                height="0.1"
                color="#ffffff"
                material="shader: flat"
                position="0 0 0"
                opacity="0.8"
              ></a-plane>
              <a-text
                value={texto}
                align="center"
                color="black"
                width="2"
                position="0 0.09 0.02"
                texto-meta={texto}
              ></a-text>
            </a-entity>
          );
        })}

        <a-entity camera="fov: 95" position="0 0 0"></a-entity>
      </a-scene>
      <button
        className="btn-cambiar-modelo"
        onClick={() =>
          setModeloActivoIndex((prev) => (prev + 1) % modelos.length)
        }
      >
        Cambiar de modelo
      </button>
    </div>
  );
};

export default ActividadModeloTexto;
