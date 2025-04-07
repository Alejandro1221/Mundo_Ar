import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import { CELEBRACIONES } from "../../utils/celebraciones";
import imagenSonido from "../../assets/images/imag_sonido.png";
import "../../assets/styles/estudiante/ActividadModeloSonidos.css";
import "../../aframe/seleccionable";
import "../../aframe/colisionable";

const ActividadModeloSonido = ({ vistaPrevia = false }) => {
  const navigate = useNavigate();
  const [modelos, setModelos] = useState([]);
  const [sonido, setSonido] = useState(null);
  const [celebracion, setCelebracion] = useState({ tipo: "mensaje", opciones: {} });
  const [mensaje, setMensaje] = useState("");
  const [mostrarCelebracion, setMostrarCelebracion] = useState(false);
  const audioRef = useRef(null);
  const [modeloActivo, setModeloActivo] = useState(null);

  const juegoId = sessionStorage.getItem("juegoId");
  const casillaId = sessionStorage.getItem("casillaId");

  useEffect(() => {
    window.manejarSeleccionGlobal = manejarSeleccion;
    return () => { window.manejarSeleccionGlobal = null; };
  }, [celebracion, sonido]);

  useEffect(() => {
    window.modeloActivoUrl = modeloActivo;
  }, [modeloActivo]);

  useEffect(() => {
    if (vistaPrevia) {
      const modelosPrevios = JSON.parse(sessionStorage.getItem("modelosSeleccionados")) || [];
      const sonidoPrevio = JSON.parse(sessionStorage.getItem("sonidoSeleccionado")) || null;
      const celebracionPrev = JSON.parse(sessionStorage.getItem("celebracionSeleccionada")) || { tipo: "mensaje", opciones: {} };

      setModelos(modelosPrevios);
      setSonido(sonidoPrevio);
      setCelebracion(celebracionPrev);
      return;
    }

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
          setSonido(casilla.configuracion.sonido || null);
          setCelebracion(casilla.configuracion.celebracion || { tipo: "mensaje", opciones: {} });
        } else {
          alert("⚠️ Esta casilla no tiene configuración.");
        }
      }
    };

    cargarConfiguracion();
  }, [vistaPrevia, juegoId, casillaId, navigate]);

  const manejarSeleccion = (modelo) => {
    if (!modelo || !modelo.url) {
      console.warn("❌ Modelo inválido:", modelo);
      return;
    }
  
    const seleccionada = modelo.url.trim().toLowerCase();
    const asociada = sonido?.modeloAsociado?.trim().toLowerCase();
    setModeloActivo(modelo.url);
  
    const esCorrecto = seleccionada === asociada;
  
    if (esCorrecto) {
      setMensaje("🎉 ¡Correcto!");
      setMostrarCelebracion(true);
  
      if (celebracion && CELEBRACIONES[celebracion.tipo]) {
        CELEBRACIONES[celebracion.tipo].render(celebracion.opciones);
      }
    } else {
      setMensaje("❌ Intenta de nuevo.");
      setMostrarCelebracion(false);
    }
  };
  

  return (
    <div className="actividad-ra-container">
      <div className="barra-superior">
        <button className="btn-volver" onClick={() => navigate("/estudiante/seleccionar-casilla")}>⬅</button>
        <h2 className="titulo-actividad">Actividad: Escucha y selecciona</h2>
        <div className="espaciador-derecho"></div>
      </div>
     
      {sonido?.url && (
        <img
          src={imagenSonido}
          alt="Reproducir sonido"
          className="boton-sonido"
          onClick={() => {
            if (audioRef.current) {
              if (audioRef.current.paused) {
                audioRef.current.play().catch(() => {});
              } else {
                audioRef.current.pause();
              }
            }
          }}
        />
      )}

      {/* 🎮 Escena AR */}
      <a-scene
         
          arjs="sourceType: webcam; facingMode: environment; debugUIEnabled: false;"
          vr-mode-ui="enabled: false"
          renderer="antialias: true; alpha: true; logarithmicDepthBuffer: true"
          background="transparent: true"
        >
        <a-entity
          id="esfera-sonido"
          geometry="primitive: sphere; radius: 0.2"
          material="color: #83B68C"
          position="0.5 0 -3"
          class="objetivo-sonido"
          sonido-emisor
        ></a-entity>
              
        {/* 🎧 Audio oculto que se reproducirá */}
        <audio 
          id="audio-sonido-principal" 
          ref={audioRef} 
          src={sonido?.url} 
          style={{ display: "none" }} 
        />

        {modelos.map((modelo, index) => (
          <a-entity
            key={index}
            gltf-model={modelo.url}
            position={`-0.5 ${(index - (modelos.length - 1) / 2) * -1.2} -3`}

            scale="0.25 0.25 0.25"
            //scale="0.35 0.35 0.35"
            seleccionable
            colisionable
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

      {/* 🎉 Feedback visual */}
      {mensaje && <p className="mensaje-feedback">{mensaje}</p>}

      {mostrarCelebracion && celebracion?.tipo === "mensaje" && (
        <div className="celebracion-mensaje">
          {celebracion.opciones?.mensaje || "¡Muy bien!"}
        </div>
      )}

    </div>
  );
};

export default ActividadModeloSonido;