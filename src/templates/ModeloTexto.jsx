import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { useSeleccionModelos } from "../hooks/useSeleccionModelos";
import "@google/model-viewer";
import "../assets/styles/docente/modeloTexto.css";

const ModeloTexto = () => {
  const navigate = useNavigate();
  
  const [juegoId] = useState(sessionStorage.getItem("juegoId"));
  const [casillaId] = useState(sessionStorage.getItem("casillaId"));
  const { modelosSeleccionados, setModelosSeleccionados } = useSeleccionModelos(juegoId, casillaId);

  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const cargadoDesdeSession = useRef(false);

  // Verificar IDs de juego y casilla
  useEffect(() => {
    if (!juegoId || !casillaId) {
      alert("Error: No se encontró el juego o la casilla.");
      navigate("/docente/dashboard");
    } else {
      sessionStorage.setItem("juegoId", juegoId);
      sessionStorage.setItem("casillaId", casillaId);
      cargarConfiguracion();
    }
  }, [juegoId, casillaId]);

  // Cargar configuración de modelos
  const cargarConfiguracion = async () => {
    try {
      // Primero intenta cargar desde sessionStorage
      const key = `modelosSeleccionados_${juegoId}_${casillaId}`;
      const modelosGuardados = sessionStorage.getItem(key);

      if (modelosGuardados) {
        const nuevos = JSON.parse(modelosGuardados);
        console.log("📥 Modelos recuperados desde sessionStorage:", nuevos);

        setModelosSeleccionados(
          nuevos.map((m) => ({ ...m, texto: m.texto || "" }))
        );

        cargadoDesdeSession.current = true;
        return;
      }

      // Si no, cargar desde Firestore
      if (cargadoDesdeSession.current) return; 
      const juegoRef = doc(db, "juegos", juegoId);
      const juegoSnap = await getDoc(juegoRef);

      if (juegoSnap.exists()) {
        const dataJuego = juegoSnap.data();
        const casilla = dataJuego.casillas[casillaId];

        if (casilla?.configuracion?.modelos?.length > 0) {
          const modelosConTexto = casilla.configuracion.modelos.map((modelo) => ({
            ...modelo,
            texto: modelo.texto || "",
          }));

          setModelosSeleccionados(modelosConTexto);
          console.log("✅ Modelos cargados desde Firestore:", modelosConTexto);
        }
      }
    } catch (error) {
      console.error("❌ Error al cargar configuración:", error);
    }
  };

  // Guardar configuración en Firestore
  const guardarConfiguracion = async () => {
    const faltanTextos = modelosSeleccionados.some(
      (modelo) => !modelo.texto?.trim()
    );

    if (faltanTextos) {
      mostrarMensaje("⚠️ Todos los modelos deben tener un concepto escrito.", "error");
      return;
    }

    try {
      const juegoRef = doc(db, "juegos", juegoId);
      const juegoSnap = await getDoc(juegoRef);

      if (juegoSnap.exists()) {
        const casillasActuales =
          juegoSnap.data().casillas || Array(30).fill({ configuracion: null });

        casillasActuales[casillaId] = {
          plantilla: "modelo-texto",
          configuracion: {
            modelos: modelosSeleccionados,
          },
        };

        await updateDoc(juegoRef, { casillas: casillasActuales });
        mostrarMensaje("✅ Plantilla guardada correctamente.", "success");
      }
    } catch (error) {
      console.error("❌ Error al guardar configuración:", error);
    }
  };

  // Mostrar mensajes
  const mostrarMensaje = (texto, tipo = "info") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  };

  // Editar texto dentro de modelosSeleccionados
  const asignarTexto = (modeloUrl, texto) => {
    setModelosSeleccionados((prev) =>
      prev.map((m) => (m.url === modeloUrl ? { ...m, texto } : m))
    );
  };

  // Eliminar modelo
  const eliminarModelo = (idModelo) => {
  const nuevosModelos = modelosSeleccionados.filter((m) => m.id !== idModelo);
  setModelosSeleccionados(nuevosModelos);

  sessionStorage.setItem(
    `modelosSeleccionados_${juegoId}_${casillaId}`,
    JSON.stringify(nuevosModelos)
  );
};

  return (
    <div className="modelo-texto-container">
      <div className="contenido-scrollable">
        <h2>Plantilla: Modelo con Texto</h2>

        {mensaje.texto && <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}

        <div className="modelos-lista">
          {modelosSeleccionados.length > 0 ? (
            modelosSeleccionados.map((modelo) => (
              <div key={modelo.id} className="modelo-item">
                <model-viewer
                  src={modelo.url}
                  alt={modelo.nombre}
                  camera-controls
                  auto-rotate
                  shadow-intensity="1"
                  style={{ width: "200px", height: "200px" }}
                ></model-viewer>
                <p>{modelo.nombre}</p>
                <textarea
                  placeholder="Escribe aquí el concepto del modelo"
                  value={modelo.texto || ""}
                  onChange={(e) => asignarTexto(modelo.url, e.target.value)}
                ></textarea>
                <button
                  className="eliminar-modelo-btn"
                  onClick={() => {
                    if (confirm("¿Estás seguro de eliminar este modelo?")) {
                      eliminarModelo(modelo.id);   // 👈 usar id
                    }
                  }}
                >
                  Eliminar
                </button>
              </div>
            ))

          ) : (
            <p>No hay modelos seleccionados.</p>
          )}
        </div>

        <button
          className="vista-previa-btn"
          onClick={() => {
            const modelosConTexto = modelosSeleccionados.map((m) => ({
              ...m,
              texto: m.texto || "",
            }));
            sessionStorage.setItem("modoVistaPrevia", "true");
            sessionStorage.setItem("paginaAnterior", window.location.pathname);
            //sessionStorage.setItem("modelosSeleccionados", JSON.stringify(modelosSeleccionados));
            sessionStorage.setItem("modelosSeleccionados", JSON.stringify(modelosConTexto));
            navigate("/estudiante/vista-previa-modelo-texto");
          }}
        >
          Vista previa
        </button>

        <div className="acciones-plantilla">
          <button onClick={guardarConfiguracion}>💾 Guardar</button>
          <button
            onClick={() => {
              sessionStorage.setItem("paginaAnterior", window.location.pathname);
              sessionStorage.setItem("modelosSeleccionados", JSON.stringify(modelosSeleccionados));
              navigate("/docente/banco-modelos", {
                state: { desdePlantilla: true, juegoId, casillaId },
              });
            }}
          >
            Seleccionar Modelos
          </button>
          <button onClick={() => navigate(`/docente/configurar-casillas/${juegoId}`)}>
            ⬅️ Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModeloTexto;
