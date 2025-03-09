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

  console.log("🔎 Verificando sessionStorage en ModeloSonido.jsx:", JSON.parse(sessionStorage.getItem("modelosSeleccionados")));


  // ✅ Verificar IDs
  useEffect(() => {
    if (!juegoId || !casillaId) {
      alert("Error: No se encontró el juego o la casilla.");
      navigate("/docente/configurar-casillas");
    } else {
      cargarConfiguracionExistente();
    }

    // ✅ Asegurar que la página se agregue correctamente al historial
    const historial = JSON.parse(sessionStorage.getItem("historialPaginas")) || [];
    if (historial.length === 0 || historial[historial.length - 1] !== location.pathname) {
      historial.push(location.pathname);
      sessionStorage.setItem("historialPaginas", JSON.stringify(historial));
    }

  }, [juegoId, casillaId, navigate, location.pathname]);


  // 🔹 Cargar configuración existente desde Firestore
  const cargarConfiguracionExistente = async () => {
    try {
        console.log("🔎 Antes de cargar sessionStorage en ModeloSonido.jsx, contenido actual:", JSON.stringify(sessionStorage));

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

        console.log("📌 Modelos obtenidos de sessionStorage después de parsear:", modelosGuardados);

        if (modelosGuardados.length > 0) {
            setModelosSeleccionados(modelosGuardados);
        } else {
            // 🔄 Si no hay modelos en sessionStorage, buscar en Firestore
            const juegoRef = doc(db, "juegos", juegoId);
            const juegoSnap = await getDoc(juegoRef);

            if (juegoSnap.exists()) {
                const casilla = juegoSnap.data().casillas[casillaId];

                if (casilla?.configuracion) {
                    setModelosSeleccionados(casilla.configuracion.modelos || []);
                    console.log("✅ Modelos obtenidos de Firestore:", casilla.configuracion.modelos);
                }
            }
        }
    } catch (error) {
        console.error("❌ Error al cargar configuración:", error);
    }
};


  // 🔹 Sincronizar modelos con Firestore
  const sincronizarModelos = async () => {
    console.log("📌 Modelos guardados en Firestore:", modelosSeleccionados);
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
        console.log("✅ Firestore actualizado con modelos:", casillasActuales[casillaId].configuracion.modelos);
    }
};


  // 🔹 Eliminar modelo seleccionado
  const eliminarModelo = async (urlModelo) => {
    console.log("📌 Modelos antes de eliminar:", modelosSeleccionados);

    const nuevosModelos = modelosSeleccionados.filter((modelo) => modelo.url !== urlModelo);
    
    // 🔄 Asegurar que sessionStorage se actualiza antes de actualizar el estado
    sessionStorage.setItem("modelosSeleccionados", JSON.stringify(nuevosModelos));

    // 🔄 Actualizar el estado asegurando un nuevo array para forzar el re-render
    setModelosSeleccionados([...nuevosModelos]);

    console.log("✅ Modelos después de eliminar:", nuevosModelos);

    // 🔄 Esperar a que el estado se actualice antes de sincronizar con Firestore
    setTimeout(() => {
        sincronizarModelos();
    }, 100);
};
  return (
    <div className="modelo-sonido-container">
      <h2>Configurar Modelo-Sonido</h2>

      {/* Modelos seleccionados */}
      <div className="modelos-seleccionados">
        {modelosSeleccionados.length > 0 ? (
          modelosSeleccionados.map((modelo, index) => {
            console.log("🔍 Modelo cargado:", modelo.url); // ✅ Agregar aquí para ver si la URL es válida

            return (
              <div key={index} className="modelo-item">
                <Scene embedded style={{ width: "200px", height: "200px" }}>
                  <Entity
                    gltf-model={modelo.url}  // 🔹 Aquí se usa la URL
                    position="0 1.5 -3"
                    scale="0.5 0.5 0.5"
                    rotation="0 45 0"
                    animation="property: rotation; to: 0 405 0; loop: true; dur: 10000"
                  />
                </Scene>
                <p>{modelo.nombre}</p>
                <button onClick={() => eliminarModelo(modelo.url)}>❌ Eliminar</button>
              </div>
            );
          })
        ) : (
          <p>No se han seleccionado modelos.</p>
        )}
      </div>

      {/* Sonido seleccionado */}
      <div className="sonido-seleccionado">
        <p>Sonido: {sonidoSeleccionado || "No se ha seleccionado sonido"}</p>
      </div>

      {/* Botones */}
      <div className="acciones">
        
       <button onClick={() => {
          sessionStorage.setItem("paginaAnterior", window.location.pathname);
          sessionStorage.setItem("modelosSeleccionados", JSON.stringify(modelosSeleccionados));
          navigate("/docente/banco-modelos", { state: { desdePlantilla: true } });
        }}>
          Seleccionar Modelos
        </button>

        <button onClick={() => navigate("/banco-sonidos")}>Seleccionar Sonido</button>
        <button onClick={sincronizarModelos} className="guardar-btn">Guardar Configuración</button>

        {/* 🔥 Botón "Volver" mejorado para regresar correctamente */}
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
