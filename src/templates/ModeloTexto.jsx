import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { useSeleccionModelos } from "../hooks/useSeleccionModelos";
import "../assets/styles/docente/modeloTexto.css";

const ModeloTexto = () => {
  const navigate = useNavigate();
  const { modelosSeleccionados, setModelosSeleccionados } = useSeleccionModelos();

  const [juegoId] = useState(sessionStorage.getItem("juegoId"));
  const [casillaId] = useState(sessionStorage.getItem("casillaId"));
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [asignaciones, setAsignaciones] = useState({});

  useEffect(() => {
    if (!juegoId || !casillaId) {
      alert("Error: No se encontró el juego o la casilla.");
      navigate("/docente/dashboard");
    } else {
      cargarConfiguracion();
    }
  }, [juegoId, casillaId]);

  const cargarConfiguracion = async () => {
    try {
      const modelosGuardados = sessionStorage.getItem("modelosSeleccionados");
      if (modelosGuardados) {
        const modelos = JSON.parse(modelosGuardados);
        setModelosSeleccionados(modelos);
        return;
      }

      const juegoRef = doc(db, "juegos", juegoId);
      const juegoSnap = await getDoc(juegoRef);
      if (juegoSnap.exists()) {
        const casilla = juegoSnap.data().casillas[casillaId];
        if (casilla?.configuracion) {
          setModelosSeleccionados(casilla.configuracion.modelos || []);
          setAsignaciones(casilla.configuracion.asignaciones || {});
        }
      }
    } catch (error) {
      console.error("Error al cargar configuración:", error);
    }
  };

  const guardarConfiguracion = async () => {
    const modelosConTexto = modelosSeleccionados.map((modelo) => ({
      ...modelo,
      texto: asignaciones[modelo.url] || "",
    }));

    const juegoRef = doc(db, "juegos", juegoId);
    const juegoSnap = await getDoc(juegoRef);

    if (juegoSnap.exists()) {
      const casillasActuales = juegoSnap.data().casillas || Array(30).fill({ configuracion: null });

      casillasActuales[casillaId] = {
        plantilla: "modelo-texto",
        configuracion: {
          modelos: modelosConTexto,
        },
      };

      await updateDoc(juegoRef, { casillas: casillasActuales });
      mostrarMensaje("✅ Plantilla guardada correctamente.", "success");
    }
  };

  const mostrarMensaje = (texto, tipo = "info") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  };

  const asignarTexto = (modeloUrl, texto) => {
    setAsignaciones((prev) => ({ ...prev, [modeloUrl]: texto }));
  };

  return (
    <div className="modelo-texto-container">
      <h2>Plantilla: Modelo con Texto</h2>

      {mensaje.texto && <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}

      <div className="modelos-lista">
        {modelosSeleccionados.length > 0 ? (
          modelosSeleccionados.map((modelo, index) => (
            <div key={index} className="modelo-item">
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
                value={asignaciones[modelo.url] || ""}
                onChange={(e) => asignarTexto(modelo.url, e.target.value)}
              ></textarea>
            </div>
          ))
        ) : (
          <p>No hay modelos seleccionados.</p>
        )}
      </div>

      <div className="acciones-plantilla">
        <button onClick={guardarConfiguracion}>💾 Guardar</button>
        <button
          onClick={() => {
            sessionStorage.setItem("paginaAnterior", window.location.pathname);
            sessionStorage.setItem("modelosSeleccionados", JSON.stringify(modelosSeleccionados));
            navigate("/docente/banco-modelos", { state: { desdePlantilla: true } });
          }}
        >
          ➕ Agregar Modelos
        </button>
        <button onClick={() => navigate(`/docente/configurar-casillas/${juegoId}`)}>⬅️ Volver</button>
      </div>
    </div>
  );
};

export default ModeloTexto;
