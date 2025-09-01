import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import { CELEBRACIONES } from "../../utils/celebraciones";
import { useAR } from "../../hooks/useAR";
import imagenSonido from "../../assets/images/imag_sonido.png";
import "../../assets/styles/estudiante/ActividadModeloSonidos.css";
import "../../aframe/seleccionable";
import "../../aframe/colisionable";
import HeaderActividad from "../../components/Estudiante/HeaderActividad";


const ActividadModeloSonido = ({ vistaPrevia = false }) => {
  useAR();
  const navigate = useNavigate();
  const [modelos, setModelos] = useState([]);
  const [sonido, setSonido] = useState(null);
  const [celebracion, setCelebracion] = useState({ tipo: "mensaje", opciones: {} });
  const [mensaje, setMensaje] = useState("");
  const [mostrarCelebracion, setMostrarCelebracion] = useState(false);
  const audioRef = useRef(null);
  const [modeloActivo, setModeloActivo] = useState(null);
  const [sonando, setSonando] = useState(false);
  const esferaRef = useRef();

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
      <HeaderActividad titulo="Escucha y arrasta el moodelo hasta el sonido correspondiente" />
  
      {sonido?.url && (
       <button
       className={`boton-sonido-esfera ${sonando ? "activo" : ""}`}
          aria-label="Reproducir sonido"
          onClick={() => {
            const audio = audioRef.current;
            if (!audio) return;
          
            if (audio.paused) {
              audio.play().then(() => setSonando(true)).catch(() => {});
              audio.onended = () => setSonando(false);
            } else {
              audio.pause();
              setSonando(false);
            }
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="var(--salmon-resalte)"
          >
            <path d="M3 10v4h4l5 5V5l-5 5H3zm13.54 1.23a3.95 3.95 0 00-2.04-3.41v6.36a3.95 3.95 0 002.04-2.95zm2.14-7.51a9.96 9.96 0 010 16.56 1 1 0 01-1.41-1.41 7.97 7.97 0 000-13.74 1 1 0 111.41-1.41z" />
          </svg>
        </button>
     
      )}

      {/* Escena AR */}
      <a-scene
          arjs="sourceType: webcam; facingMode: environment; debugUIEnabled: false;"
          vr-mode-ui="enabled: false"
          renderer="antialias: true; alpha: true; logarithmicDepthBuffer: true"
          background="transparent: true"
        >
        <a-entity
          id="esfera-sonido"
          ref={esferaRef}
          geometry="primitive: sphere; radius: 0.2"
          material="color: #83B68C"
          position="0.5 0 -3"
          class="objetivo-sonido"
          sonido-emisor
        ></a-entity>
              
        {/*Audio oculto que se reproducirá */}
        <audio 
          id="audio-sonido-principal" 
          ref={audioRef} 
          src={sonido?.url} 
          style={{ display: "none" }} 
        />

          {modelos.map((modelo, index) => {
           const espaciado = 0.5; // Espaciado vertical entre los modelos
           const x = -0.5; // Mantén todos los modelos alineados a la izquierda
           const y = 0.3 - index * espaciado; // Apila los modelos verticalmente
           const z = -3; // Mantén la misma profundidad

            return (
              <a-entity
                key={index}
                gltf-model={modelo.url}
                position={`${x} ${y} ${z}`}
                scale="1 1 1"
                seleccionable
                colisionable
                data-modelo-url={modelo.url}
                animation="property: rotation; to: 0 360 0; loop: true; dur: 5000; easing: linear" // Rotación continua
              ></a-entity>
            );
          })}


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