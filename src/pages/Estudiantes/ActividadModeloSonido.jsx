import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import "aframe";
import { Entity, Scene } from "aframe-react";
import "../../assets/styles/estudiante/ActividadModeloSonidos.css";
import imagenSonido from "../../assets/images/imag_sonido.png";


const ActividadModeloSonido = () => {
  const navigate = useNavigate();
  const [modelos, setModelos] = useState([]);
  const [sonido, setSonido] = useState(null);
  const juegoId = sessionStorage.getItem("juegoId");
  const casillaId = sessionStorage.getItem("casillaId");

  const [seleccion, setSeleccion] = useState(null); // Modelo seleccionado por el niño
  const [mensaje, setMensaje] = useState(""); // Mensaje de feedback
  const audioRef = useRef(null);

  useEffect(() => {
    console.log("➡️ Entrando a ActividadModeloSonido.jsx");
    console.log("🔹 Juego ID:", juegoId, "Casilla ID:", casillaId);

    if (!juegoId || !casillaId) {
        alert("Error: No se encontró el juego o la casilla.");
        navigate("/estudiante/dashboard");
        return;
    }

    console.log("➡️ Entrando a ActividadModeloSonido.jsx");
    console.log("📌 Juego ID desde sessionStorage:", sessionStorage.getItem("juegoId"));
    console.log("📌 Casilla ID desde sessionStorage:", sessionStorage.getItem("casillaId"));

    const cargarConfiguracion = async () => {
      try {
          const juegoRef = doc(db, "juegos", juegoId);
          const juegoSnap = await getDoc(juegoRef);
  
          if (juegoSnap.exists()) {
              const casilla = juegoSnap.data().casillas[casillaId];
  
              console.log("📌 Datos obtenidos de la casilla:", casilla);
  
              if (casilla?.configuracion) {
                  setModelos(casilla.configuracion.modelos || []);
                  setSonido(casilla.configuracion.sonido || null);
                  console.log("✅ Modelos asignados:", casilla.configuracion.modelos);
                  console.log("✅ Sonido asignado:", casilla.configuracion.sonido);
              } else {
                  console.warn("⚠️ La casilla tiene plantilla, pero sin configuración. Mostrando mensaje de error.");
                  setModelos([]);  // Se asegura de que no haya modelos en el estado
                  setSonido(null);
                  alert("⚠️ Esta casilla tiene una plantilla asignada pero no ha sido configurada por el docente.");
              }
          } else {
              console.warn("⚠️ No se encontró el juego en Firestore.");
          }
      } catch (error) {
          console.error("❌ Error al cargar configuración:", error);
      }
  };
    cargarConfiguracion();
}, [juegoId, casillaId, navigate]);


const manejarSeleccion = (modelo) => {
  setSeleccion(modelo);
  
  if (modelo.url === sonido.modeloAsociado) { 
    setMensaje("🎉 ¡Correcto! Este es el sonido del modelo.");
  } else {
    setMensaje("❌ Incorrecto. Intenta de nuevo.");
  }
};

const manejarReproduccion = () => {
  if (audioRef.current) {
    if (audioRef.current.paused) {
      audioRef.current.play().catch((error) => {
        console.error("⚠️ No se pudo reproducir el audio:", error);
      });
    } else {
      audioRef.current.pause();
    }
  }
};
  return (
    <div className="estudiante-modelo-sonido-container">
      <h2>Actividad: Explora el Modelo y Escucha el Sonido</h2>

      <div className="estudiante-modelos-seleccionados">
        {modelos.length > 0 ? (
          modelos.map((modelo, index) => (
            <div 
              key={index} 
              className={`estudiante-modelo-item ${seleccion?.url === modelo.url ? "seleccionado" : ""}`} 
              onClick={() => manejarSeleccion(modelo)}
            >
              <Scene embedded shadow="type: soft" vr-mode-ui="enabled: false" style={{ width: "200px", height: "200px" }}>
                <Entity light="type: directional; intensity: 0.7" position="1 3 1" castShadow />
                
                <Entity
                  gltf-model={modelo.url}
                  position="0 1 -2"
                  scale="1.2 1.2 1.2"
                  rotation="0 45 0"
                  shadow="cast: true"
                  animation="property: rotation; to: 0 405 0; loop: true; dur: 8000"
                />

                <Entity 
                  geometry="primitive: plane; width: 2; height: 2"
                  material="color: #ddd; opacity: 0.6"
                  position="0 -0.01 -2"
                  rotation="-90 0 0"
                  shadow="receive: true"
                />
              </Scene>

              <p>{modelo.nombre}</p>
            </div>
          ))
        ) : (
          <p>No hay modelos asignados a esta casilla.</p>
        )}
      </div>

          {sonido && sonido.url && (
        <div className="estudiante-sonido-asignado">
          <p>🔊 Escucha el sonido:</p>
          <img 
            src={imagenSonido}  
            alt="Reproducir sonido" 
            className="boton-sonido"
            onClick={manejarReproduccion}
          />
          <audio ref={audioRef} src={sonido.url} style={{ display: "none" }} />
        </div>
      )}
      {mensaje && <p className="mensaje-feedback">{mensaje}</p>}

      <button className="estudiante-volver-btn" onClick={() => navigate("/estudiante/seleccionar-casilla")}>
        Volver
      </button>
    </div>
  );
};

export default ActividadModeloSonido;
