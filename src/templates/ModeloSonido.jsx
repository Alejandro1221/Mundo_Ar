import React, { useEffect, useState, useRef } from "react";
import { useSeleccionModelos } from "../hooks/useSeleccionModelos"; // ✅ Importa el hook
import { useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "../services/firebaseConfig";
import "aframe";
import { Entity, Scene } from "aframe-react";
import imagenSonido from "../assets/images/imag_sonido.png";

import "../assets/styles/modeloSonido.css";


const ModeloSonido = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Estados
   const { modelosSeleccionados, setModelosSeleccionados } = useSeleccionModelos();
   const [sonidoSeleccionado, setSonidoSeleccionado] = useState(null);
   const [juegoId] = useState(sessionStorage.getItem("juegoId"));
   const [casillaId] = useState(sessionStorage.getItem("casillaId"));
   const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

   const [reproduciendo, setReproduciendo] = useState(false);
   const audioRef = useRef(null);

  useEffect(() => {
    if (!juegoId || !casillaId) {
      alert("Error: No se encontró el juego o la casilla.");
      navigate("/docente/configurar-casillas");
    } else {
      cargarConfiguracionExistente();
    }
  }, [juegoId, casillaId, navigate]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        setReproduciendo(false);
      }
    };
  }, []);

  const cargarConfiguracionExistente = async () => {
    try {
      let modelosGuardados = sessionStorage.getItem("modelosSeleccionados");
      let sonidoGuardado = sessionStorage.getItem("sonidoSeleccionado"); // 🔹 Recuperar sonido
  
      if (sonidoGuardado) {
        try {
          sonidoGuardado = JSON.parse(sonidoGuardado);
  
          // 🔹 Agregar modeloAsociado desde sessionStorage si existe
          const modeloAsociado = sessionStorage.getItem("modeloAsociadoParaSonido");
          if (modeloAsociado) {
            sonidoGuardado.modeloAsociado = modeloAsociado;
          }
  
          console.log("🔊 Sonido recuperado desde sessionStorage:", sonidoGuardado);
          setSonidoSeleccionado(sonidoGuardado); // ✅ Asignar sonido
        } catch (err) {
          console.error("❌ Error al parsear `sonidoSeleccionado`, reiniciando...", err);
          sonidoGuardado = null;
        }
      }
  
      if (modelosGuardados) {
        try {
          modelosGuardados = JSON.parse(modelosGuardados);
          if (Array.isArray(modelosGuardados) && modelosGuardados.length > 0) {
            setModelosSeleccionados(modelosGuardados);
            console.log("✅ Modelos cargados desde sessionStorage:", modelosGuardados);
            return; // ⚠️ Evita sobrescribir con Firestore
          }
        } catch (err) {
          console.error("❌ Error al parsear `modelosSeleccionados`, reiniciando...", err);
          modelosGuardados = [];
        }
      }
  
      // 🔄 Si no hay datos en sessionStorage, buscar en Firestore
      const juegoRef = doc(db, "juegos", juegoId);
      const juegoSnap = await getDoc(juegoRef);
  
      if (juegoSnap.exists()) {
        const casilla = juegoSnap.data().casillas[casillaId];
        if (casilla?.configuracion) {
          setModelosSeleccionados(casilla.configuracion.modelos || []);
          setSonidoSeleccionado(casilla.configuracion.sonido || null);
          console.log("📥 Datos obtenidos de Firestore:", casilla.configuracion);
        }
      }
    } catch (error) {
      console.error("❌ Error al cargar configuración:", error);
    }
  };
  
  const sincronizarModelos = async () => {
    try {
      const juegoRef = doc(db, "juegos", juegoId);
      const juegoSnap = await getDoc(juegoRef);
  
      if (juegoSnap.exists()) {
        const casillasActuales = juegoSnap.data().casillas || Array(30).fill({ configuracion: null });
  
        casillasActuales[casillaId] = {
          plantilla: "modelo-sonido",
          configuracion: {
            modelos: modelosSeleccionados,
            sonido: sonidoSeleccionado,
          },
        };
  
        await updateDoc(juegoRef, { casillas: casillasActuales });
  
        mostrarMensaje("✅ Plantilla guardada correctamente.", "success");
      }
    } catch (error) {
      console.error("❌ Error al guardar en Firestore:", error);
      mostrarMensaje("❌ Error al guardar la plantilla.", "error");
    }
  };

// 🔹 Eliminar modelo solo de la plantilla 
const eliminarModelo = async (urlModelo) => {
  console.log("📌 Modelos antes de eliminar:", modelosSeleccionados);
  const nuevosModelos = modelosSeleccionados.filter((modelo) => modelo.url !== urlModelo);
  
  // 🔄 Actualizar sessionStorage antes de actualizar Firestore
  sessionStorage.setItem("modelosSeleccionados", JSON.stringify(nuevosModelos));

  // 🔄 Actualizar el estado asegurando un nuevo array para forzar el re-render
  setModelosSeleccionados([...nuevosModelos]);

  console.log("✅ Modelos después de eliminar:", nuevosModelos);

  // 🔄 Guardar la nueva configuración de la casilla en Firestore
  try {
    const juegoRef = doc(db, "juegos", juegoId);
    const juegoSnap = await getDoc(juegoRef);

    if (juegoSnap.exists()) {
      const casillasActuales = juegoSnap.data().casillas || Array(30).fill({ configuracion: null });

      // 🔥 Solo actualizamos la configuración de la casilla, sin eliminar el modelo de la BD
      casillasActuales[casillaId] = {
        plantilla: "modelo-sonido",
        configuracion: {
          modelos: nuevosModelos, // Actualizamos solo esta casilla, sin tocar los modelos en Firestore
          sonido: sonidoSeleccionado,
        },
      };

      await updateDoc(juegoRef, { casillas: casillasActuales });
      console.log("✅ Firestore actualizado: Modelo eliminado solo de la plantilla.");
    }
  } catch (error) {
    console.error("❌ Error al actualizar Firestore:", error);
  }
};

const mostrarMensaje = (texto, tipo = "info") => {
  setMensaje({ texto, tipo });
  setTimeout(() => {
    setMensaje({ texto: "", tipo: "" }); // Oculta el mensaje después de 3 segundos
  }, 3000);
};
const manejarReproduccion = () => {
  if (!sonidoSeleccionado || !sonidoSeleccionado.url) {
    mostrarMensaje("⚠️ No hay sonido asignado.", "warning");
    return;
  }

  if (audioRef.current) {
    const audio = audioRef.current;
    
    if (audio.paused) {
      audio.play().catch((error) => {
        console.error("⚠️ No se pudo reproducir el audio:", error);
        mostrarMensaje("⚠️ No se pudo reproducir el audio. Interacción requerida.", "warning");
      });
      setReproduciendo(true);
    } else {
      audio.pause();
      setReproduciendo(false);
    }
  }
};
  return (
  <div className="docente-modelo-container">
     {mensaje.texto && (
        <div className={`mensaje ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}
  <h2>Configurar Modelo-Sonido</h2>

  <div className="docente-modelos-seleccionados">
    {modelosSeleccionados.length > 0 ? (
      modelosSeleccionados.map((modelo, index) => (
        <div key={index} className="docente-modelo-item">
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

          {/* Botón para eliminar modelo */}
          <button onClick={() => eliminarModelo(modelo.url)}>Eliminar</button>

          {/* Nuevo botón para asignar sonido */}
          <button 
            className="asignar-sonido-btn"
            onClick={() => {
              sessionStorage.setItem("modeloSeleccionadoParaSonido", JSON.stringify(modelo));
              sessionStorage.setItem("modeloAsociadoParaSonido", modelo.url);
              sessionStorage.setItem("paginaAnterior", window.location.pathname);
              navigate("/docente/banco-sonidos", { state: { desdePlantilla: true } });
            }}
          >
            🎵 Asignar Sonido
          </button>
          
          {modelo.sonido && modelo.sonido.url ? (
              <div className="sonido-asignado">
                <p>🔊 {modelo.sonido.nombre}</p>
                <audio controls>
                  <source src={modelo.sonido.url} type="audio/mp3" />
                </audio>
              </div>
            ) : (
              <p className="sin-sonido">❌ Sin sonido asignado</p>
            )}
        </div>
      ))
    ) : (
      <p>No se han seleccionado modelos.</p>
    )}
  </div>

  <div className="acciones">
    <button onClick={() => {
        sessionStorage.setItem("paginaAnterior", window.location.pathname);
        sessionStorage.setItem("modelosSeleccionados", JSON.stringify(modelosSeleccionados));
        navigate("/docente/banco-modelos", { state: { desdePlantilla: true } });
      }}>
        Seleccionar Modelos
      </button>

    <button onClick={sincronizarModelos} className="guardar-btn">Guardar Configuración</button>
    <button className="volver-btn" onClick={() => {
      const historial = JSON.parse(sessionStorage.getItem("historialPaginas")) || [];
      historial.pop(); 
      const paginaAnterior = historial.pop(); 
      sessionStorage.setItem("historialPaginas", JSON.stringify(historial));

      if (paginaAnterior) {
        navigate(paginaAnterior);
      } else {
        navigate(`/docente/configurar-casillas/${juegoId}`);
      }
    }}>
      Volver
    </button>

    <div className="boton-sonido-container">
      <img 
        src={imagenSonido} 
        alt="Reproducir sonido" 
        className="boton-sonido" 
        onClick={manejarReproduccion} 
      />
      <audio ref={audioRef} src={sonidoSeleccionado?.url} style={{ display: "none" }} />
    </div>
    
  </div>
</div>

  );
};

export default ModeloSonido;
