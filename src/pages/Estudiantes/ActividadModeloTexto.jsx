import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import HeaderActividad from "../../components/Estudiante/HeaderActividad";
import "../../assets/styles/estudiante/actividadModeloTexto.css";
import "../../aframe/arrastrable-texto";


const ActividadModeloTexto = ({ vistaPrevia = false }) => { 

  const navigate = useNavigate();
  const casillaId = sessionStorage.getItem("casillaId");
  const juegoId = sessionStorage.getItem("juegoId");
  const [modelos, setModelos] = useState([]);
  
  useEffect(() => {
    if (vistaPrevia) {
      const modelosGuardados = JSON.parse(sessionStorage.getItem("modelosSeleccionados") || "[]");
      const asignacionesTexto = JSON.parse(sessionStorage.getItem("asignacionesTexto") || "{}");
  
      // Fusionar asignaciones de texto a los modelos
      const modelosConTexto = modelosGuardados.map((modelo) => ({
        ...modelo,
        texto: asignacionesTexto[modelo.url] || "",
      }));
  
      setModelos(modelosConTexto);
      console.log("🧾 Vista previa cargada con", modelosConTexto.length, "modelos");
      return;
    }
  
    const cargarModelos = async () => {
      if (!juegoId || casillaId === null) {
        console.warn("❌ No hay juegoId o casillaId");
        navigate("/estudiante/dashboard");
        return;
      }
  
      try {
        const index = parseInt(casillaId);
        const juegoRef = doc(db, "juegos", juegoId);
        const juegoSnap = await getDoc(juegoRef);
  
        if (!juegoSnap.exists()) {
          console.error("❌ El documento del juego no existe.");
          return;
        }
  
        const data = juegoSnap.data();
        const casilla = data.casillas[index];
  
        if (!casilla?.configuracion?.modelos) {
          console.warn("⚠️ Esta casilla no tiene modelos configurados.");
          return;
        }
  
        const modelosCargados = casilla.configuracion.modelos.filter(
          (m) => m && m.url && m.texto && m.texto.trim() !== ""
        );
  
        setModelos(modelosCargados);
        console.log("Total de tarjetas generadas:", modelosCargados.length);
  
      } catch (error) {
        console.error("❌ Error al cargar los modelos:", error);
      }
    };
  
    cargarModelos();
  }, [vistaPrevia, casillaId, juegoId, navigate]);
  

  return (
    <div className="actividad-ra-container">
    <HeaderActividad titulo="Identifica el texto con el modelo" />
      <a-scene
        arjs="sourceType: webcam;"
        vr-mode-ui="enabled: false"
        renderer="antialias: true; alpha: true; logarithmicDepthBuffer: true"
        background="transparent: true"
      >
        {/* Modelos 3D */}
        {modelos.map((modelo, i) => (
          <a-entity
            key={`modelo-${i}`}
            gltf-model={modelo.url}
            position={`${-0.3 + i * 0.6} -0.5 -2`}
            scale=" 2 2 2"
            modelo-meta={modelo.texto}
          ></a-entity>
        ))}

        {/* Tarjetas de texto */}
        {modelos.map((modelo, i) => {
          const texto = modelo.texto.trim();
          const posX = -0.3 + i * 0.6;
          
          return (
            <a-entity
              key={`texto-${i}`}
              position={`${posX} 0.4 -2`}
              data-index={i}
              arrastrable-texto={`index: ${i}`}
            >
              <a-plane
                width="0.1"
                height="0.1"
                color="transparent"
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
    
    </div>
  );
};

export default ActividadModeloTexto;
