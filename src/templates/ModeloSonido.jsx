import React, { useEffect, useState } from "react";
import { useSeleccionModelos } from "../hooks/useSeleccionModelos"; // ✅ Importa el hook
import { useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "../services/firebaseConfig";
import "aframe";
import { Entity, Scene } from "aframe-react";
import "../assets/styles/modeloSonido.css";


const ModeloSonido = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Estados
  const { modelosSeleccionados, setModelosSeleccionados } = useSeleccionModelos();
  const [sonidoSeleccionado, setSonidoSeleccionado] = useState(null);
  const [juegoId] = useState(sessionStorage.getItem("juegoId"));
  const [casillaId] = useState(sessionStorage.getItem("casillaId"));

  
  useEffect(() => {
    if (!juegoId || !casillaId) {
      alert("Error: No se encontró el juego o la casilla.");
      navigate("/docente/configurar-casillas");
    } else {
      cargarConfiguracionExistente();
    }
  }, [juegoId, casillaId, navigate, location.pathname]);


  // 🔹 Cargar configuración existente desde Firestore
  const cargarConfiguracionExistente = async () => {
    try {
      let modelosGuardados = sessionStorage.getItem("modelosSeleccionados");
      if (modelosGuardados) {
        try {
          modelosGuardados = JSON.parse(modelosGuardados);
          if (!Array.isArray(modelosGuardados)) {
            console.warn("⚠️ `modelosSeleccionados` no es un array, reinicializando...");
            modelosGuardados = [];
          }
        } catch (err) {
          console.error("❌ Error al parsear `modelosSeleccionados`, reiniciando...", err);
          modelosGuardados = [];
        }
      } else {
        modelosGuardados = [];
      }
      setModelosSeleccionados(modelosGuardados);

      const juegoRef = doc(db, "juegos", juegoId);
      const juegoSnap = await getDoc(juegoRef);
      if (juegoSnap.exists()) {
        const casilla = juegoSnap.data().casillas[casillaId];
        if (casilla?.configuracion) {
          setModelosSeleccionados(casilla.configuracion.modelos || []);
          setSonidoSeleccionado(casilla.configuracion.sonido || null);
        }
      }
    } catch (error) {
      console.error("❌ Error al cargar configuración:", error);
    }
  };

  // 🔹 Sincronizar modelos con Firestore
  const sincronizarModelos = async () => {
    const juegoRef = doc(db, "juegos", juegoId);
    const juegoSnap = await getDoc(juegoRef);

    if (juegoSnap.exists()) {
        const casillasActuales = juegoSnap.data().casillas || Array(30).fill({ configuracion: null });
        casillasActuales[casillaId] = {
            plantilla: "modelo-sonido",
            configuracion: {
                modelos: modelosSeleccionados, // Asegurarse de no eliminar globalmente
                sonido: sonidoSeleccionado,
            },
        };
        await updateDoc(juegoRef, { casillas: casillasActuales });
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

  return (
    <div className="modelo-sonido-container">
      <h2>Configurar Modelo-Sonido</h2>

      <div className="modelos-seleccionados">
        {modelosSeleccionados.length > 0 ? (
          modelosSeleccionados.map((modelo, index) => {
            console.log("🔍 Modelo cargado:", modelo.url); // ✅ Agregar aquí para ver si la URL es válida

            return (
              <div key={index} className="modelo-item">
                <Scene embedded shadow="type: soft" vr-mode-ui="enabled: false" style={{ width: "200px", height: "200px" }}>
                  <Entity light="type: directional; intensity: 0.7" position="1 3 1" castShadow />
                  
                  <Entity
                    gltf-model={modelo.url}
                    position="0 1 -2"  // 🔹 Eleva el modelo
                    scale="1.2 1.2 1.2"
                    rotation="0 45 0"
                    shadow="cast: true"
                    animation="property: rotation; to: 0 405 0; loop: true; dur: 8000"
                  />

                  {/* 🔹 Simulación de suelo con sombra */}
                  <Entity 
                    geometry="primitive: plane; width: 2; height: 2"
                    material="color: #ddd; opacity: 0.6"
                    position="0 -0.01 -2"
                    rotation="-90 0 0"
                    shadow="receive: true"
                  />
                </Scene>


                <p>{modelo.nombre}</p>
                <button onClick={() => eliminarModelo(modelo.url)}>Eliminar</button>
              </div>
            );
          })
        ) : (
          <p>No se han seleccionado modelos.</p>
        )}
      </div>

      <div className="sonido-seleccionado">
        <p>Sonido: {sonidoSeleccionado ? sonidoSeleccionado.nombre : "No se ha seleccionado sonido"}</p>
        {sonidoSeleccionado && <audio controls src={sonidoSeleccionado.url} />}
      </div>


      <div className="acciones">
        <button onClick={() => {
            sessionStorage.setItem("paginaAnterior", window.location.pathname);
            sessionStorage.setItem("modelosSeleccionados", JSON.stringify(modelosSeleccionados));
            navigate("/docente/banco-modelos", { state: { desdePlantilla: true } });
          }}>
            Seleccionar Modelos
          </button>

        <button onClick={() => {
          sessionStorage.setItem("paginaAnterior", window.location.pathname);
          navigate("/docente/banco-sonidos", { state: { desdePlantilla: true } });
        }}>
          Seleccionar Sonido
        </button>

        <button onClick={sincronizarModelos} className="guardar-btn">Guardar Configuración</button>
        <button className="volver-btn" onClick={() => {
          const historial = JSON.parse(sessionStorage.getItem("historialPaginas")) || [];
          historial.pop(); // Elimina la actual
          const paginaAnterior = historial.pop(); // Obtiene la anterior
          sessionStorage.setItem("historialPaginas", JSON.stringify(historial));

          if (paginaAnterior) {
            navigate(paginaAnterior);
          } else {
            navigate(`/docente/configurar-casillas/${juegoId}`);
          }
        }}>
          Volver
        </button>
      </div>
    </div>
  );
};

export default ModeloSonido;
