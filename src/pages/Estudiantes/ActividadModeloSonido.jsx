import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import { Entity, Scene } from "aframe-react";
import "../../assets/styles/estudiante/ActividadModeloSonidos.css";
import imagenSonido from "../../assets/images/imag_sonido.png";
import { CELEBRACIONES } from "../../utils/celebraciones";
import ModeloInteractivo from "../../components/ModeloInteractivo";


const ActividadModeloSonido = () => {
  const navigate = useNavigate();
  const [modelos, setModelos] = useState([]);
  const [sonido, setSonido] = useState(null);
  const juegoId = sessionStorage.getItem("juegoId");
  const casillaId = sessionStorage.getItem("casillaId");

  const [seleccion, setSeleccion] = useState(null); // Modelo seleccionado por el niño
  const [mensaje, setMensaje] = useState(""); // Mensaje de feedback
  const audioRef = useRef(null);
  const [celebracion, setCelebracion] = useState("mensaje");
  const [mostrarCelebracion, setMostrarCelebracion] = useState(false);



  useEffect(() => {
    console.log("➡️ Entrando a ActividadModeloSonido.jsx");
    console.log("🔹 Juego ID:", juegoId, "Casilla ID:", casillaId);

    if (!juegoId || !casillaId) {
        alert("Error: No se encontró el juego o la casilla.");
        navigate("/estudiante/dashboard");
        return;
    }

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
                  setCelebracion(casilla.configuracion.celebracion || "mensaje");
            
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
    setMostrarCelebracion(true);

    if (celebracion && CELEBRACIONES[celebracion.tipo]) {
      CELEBRACIONES[celebracion.tipo].render(celebracion.opciones);
    }
  } else {
    setMensaje("❌ Incorrecto. Intenta de nuevo.");
    setMostrarCelebracion(false);
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
              <ModeloInteractivo
                key={index}
                modelo={modelo}
                seleccionado={seleccion}
                onSeleccionar={manejarSeleccion}
              />
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

      {mostrarCelebracion && celebracion?.tipo === "mensaje" && celebracion?.opciones?.mensaje && (
        <div className="celebracion-mensaje">
          {celebracion.opciones.mensaje}
        </div>
      )}
    
      <button className="estudiante-volver-btn" onClick={() => navigate("/estudiante/seleccionar-casilla")}>
        Volver
      </button>
    </div>
  );
};

export default ActividadModeloSonido;
