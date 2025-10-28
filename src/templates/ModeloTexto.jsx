import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { useSeleccionModelos } from "../hooks/useSeleccionModelos";
import "@google/model-viewer";
import Breadcrumbs from "../components/Breadcrumbs";
import "../assets/styles/docente/modeloTexto.css";

const ModeloTexto = () => {
  const navigate = useNavigate();
  
  const [juegoId] = useState(sessionStorage.getItem("juegoId"));
  const [casillaId] = useState(sessionStorage.getItem("casillaId"));
  const { modelosSeleccionados, setModelosSeleccionados } = useSeleccionModelos(juegoId, casillaId);

  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [celebracion, setCelebracion] = useState({ tipo: "confeti", opciones: {} });
  const cargadoDesdeSession = useRef(false);

  const modelosKey = `modelosSeleccionados_${juegoId}_${casillaId}`;
  const celebracionKey = `celebracion_${juegoId}_${casillaId}`;
  const MAX_MODELOS = 2;


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

  useEffect(() => {
  if (Array.isArray(modelosSeleccionados) && modelosSeleccionados.length > MAX_MODELOS) {
    const recortados = modelosSeleccionados.slice(0, MAX_MODELOS);
    setModelosSeleccionados(recortados);
    sessionStorage.setItem(`modelosSeleccionados_${juegoId}_${casillaId}`, JSON.stringify(recortados));
    sessionStorage.setItem("modelosSeleccionados", JSON.stringify(recortados));
    mostrarMensaje(`Se recortó la lista a ${MAX_MODELOS} modelos.`, "info");
  }
}, [modelosSeleccionados.length]);


const cargarConfiguracion = async () => {
  try {
    const key = `modelosSeleccionados_${juegoId}_${casillaId}`;
    const modelosGuardados = sessionStorage.getItem(key);
    const celebracionGuardada = sessionStorage.getItem("celebracionSeleccionada");
    const celebracionPorCasilla = sessionStorage.getItem(`celebracion_${juegoId}_${casillaId}`);

    const aplicarLimite = (arr = []) => {
      if (!Array.isArray(arr)) return [];
      if (arr.length > MAX_MODELOS) {
        mostrarMensaje(`Solo se permiten ${MAX_MODELOS} modelos. Se tomaron los primeros ${MAX_MODELOS}.`, "info");
      }
      return arr.slice(0, MAX_MODELOS);
    };

    if (modelosGuardados) {
      const nuevos = aplicarLimite(JSON.parse(modelosGuardados));
      setModelosSeleccionados(nuevos.map((m) => ({ ...m, texto: m.texto || "" })));

      const origenCelebracion = celebracionPorCasilla || celebracionGuardada;
      if (origenCelebracion) {
        try { setCelebracion(JSON.parse(origenCelebracion)); } catch {}
      }

      // Persistimos el recorte si se aplicó
      sessionStorage.setItem(key, JSON.stringify(nuevos));
      cargadoDesdeSession.current = true;
      return;
    }

    if (cargadoDesdeSession.current) return;
    const juegoRef = doc(db, "juegos", juegoId);
    const juegoSnap = await getDoc(juegoRef);

    if (juegoSnap.exists()) {
      const dataJuego = juegoSnap.data();
      const casilla = dataJuego.casillas?.[casillaId];

      if (casilla?.configuracion?.modelos?.length > 0) {
        const modelosConTexto = casilla.configuracion.modelos.map((modelo) => ({
          ...modelo,
          texto: modelo.texto || "",
        }));
        const limitados = aplicarLimite(modelosConTexto);
        setModelosSeleccionados(limitados);
        sessionStorage.setItem(key, JSON.stringify(limitados));
      }

      if (casilla?.configuracion?.celebracion) {
        setCelebracion(casilla.configuracion.celebracion);
        sessionStorage.setItem(`celebracion_${juegoId}_${casillaId}`, JSON.stringify(casilla.configuracion.celebracion));
        sessionStorage.setItem("celebracionSeleccionada", JSON.stringify(casilla.configuracion.celebracion));
      }
    }
  } catch (error) {
    console.error("❌ Error al cargar configuración:", error);
  }
};

  // Guardar configuración en Firestore
  const guardarConfiguracion = async () => {
    if (modelosSeleccionados.length > MAX_MODELOS) {
      mostrarMensaje(`Máximo ${MAX_MODELOS} modelos. Elimina alguno para continuar.`, "error");
      return;
    }
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
            celebracion,
          },
        };

        await updateDoc(juegoRef, { casillas: casillasActuales });
        sessionStorage.setItem(modelosKey, JSON.stringify(modelosSeleccionados));
        sessionStorage.setItem(celebracionKey, JSON.stringify(celebracion));
        mostrarMensaje("Plantilla guardada correctamente.", "success");
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
  const eliminarModelo = (idOrUrl) => {
    const nuevos = modelosSeleccionados.filter(m => (m.id ?? m.url) !== idOrUrl);
    setModelosSeleccionados(nuevos);
    sessionStorage.setItem(`modelosSeleccionados_${juegoId}_${casillaId}`, JSON.stringify(nuevos));
    sessionStorage.setItem("modelosSeleccionados", JSON.stringify(nuevos));
  };

return (
  <div className="modelo-texto-container">
    <Breadcrumbs/>
    <h2>Modelo con Texto</h2>
    <p className="leyenda-modelo-texto">
      En esta plantilla puedes seleccionar modelos 3D y escribir un concepto breve para cada uno.
      Sirve para reforzar ideas clave asociadas a cada modelo y evaluar la comprensión.
    </p>

    {mensaje.texto && <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}

    <div className="modelos-config__bar">
      <h3>Modelos seleccionados</h3>

      <span style={{ marginLeft: "auto", marginRight: 12, opacity: .8 }}>
        {modelosSeleccionados.length}/{MAX_MODELOS}
      </span>

      <button
        className="btn btn--secondary"
        disabled={modelosSeleccionados.length >= MAX_MODELOS}
        title={modelosSeleccionados.length >= MAX_MODELOS ? `Límite alcanzado (${MAX_MODELOS})` : ""}
        onClick={() => {
          sessionStorage.setItem("paginaAnterior", window.location.pathname);
          sessionStorage.setItem("modelosSeleccionados", JSON.stringify(modelosSeleccionados));
          // 👇 pasa el límite al banco para que no deje elegir más de 2
          sessionStorage.setItem("maxModelosPermitidos", String(MAX_MODELOS));
          navigate("/docente/banco-modelos", {
            state: { desdePlantilla: true, juegoId, casillaId },
          });
        }}
      >
        Agregar modelos
      </button>
    </div>

    {modelosSeleccionados.length >= MAX_MODELOS && (
          <p style={{ color: "red", fontWeight: "bold" }}>
            Límite alcanzado — no puedes agregar más modelos.
          </p>
        )}


    <div className="modelos-grid">
      {modelosSeleccionados.length > 0 ? (
        modelosSeleccionados.map((modelo) => (
          <div key={modelo.id} className="modelo-card">
            <div className="modelo-preview">
              <model-viewer
                src={modelo.url}
                alt={modelo.nombre}
                camera-controls
                auto-rotate
                shadow-intensity="1"
                style={{ width: "100%", height: "180px" }}
              ></model-viewer>
            </div>

            <div className="modelo-detalles">
              <h4>{modelo.nombre}</h4>
              <textarea
                placeholder="Escribe aquí el concepto del modelo"
                value={modelo.texto || ""}
                onChange={(e) => asignarTexto(modelo.url, e.target.value)}
              />
              <button
                className="btn btn--danger"
                onClick={() => eliminarModelo(modelo.id ?? modelo.url)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No hay modelos seleccionados.</p>
      )}
    </div>

    <section className="seccion-celebracion" style={{ marginTop: 16 }}>
      <h3>Celebración</h3>
      <select
        value={celebracion.tipo}
        onChange={(e) => setCelebracion({ tipo: e.target.value, opciones: {} })}
      >
        <option value="confeti">🎉 Confeti</option>
        <option value="mensaje">✅ Mensaje</option>
      </select>

      {celebracion.tipo === "gif" && (
        <input
          type="text"
          placeholder="URL del GIF"
          value={celebracion.opciones.gifUrl || ""}
          onChange={(e) =>
            setCelebracion({ ...celebracion, opciones: { gifUrl: e.target.value } })
          }
          style={{ marginTop: 8, width: "100%" }}
        />
      )}

      {celebracion.tipo === "mensaje" && (
        <textarea
          placeholder="Mensaje personalizado"
          rows={3}
          style={{ width: "100%", resize: "vertical", marginTop: 8 }}
          value={celebracion.opciones.mensaje || ""}
          onChange={(e) =>
            setCelebracion({ ...celebracion, opciones: { mensaje: e.target.value } })
          }
        />
      )}
    </section>

    <div className="acciones-plantilla">
      <button
        className="btn btn--secondary"
        onClick={() => {
          const modelosConTexto = modelosSeleccionados.map((m) => ({
            ...m,
            texto: m.texto || "",
          }));
          sessionStorage.setItem("modoVistaPrevia", "true");
          sessionStorage.setItem("paginaAnterior", window.location.pathname);
          sessionStorage.setItem("modelosSeleccionados", JSON.stringify(modelosConTexto));
          sessionStorage.setItem("celebracionSeleccionada", JSON.stringify(celebracion));
          navigate("/estudiante/vista-previa-modelo-texto");
        }}
      >
        Vista previa como estudiante
      </button>

      <button
        className="btn btn--primary"
        onClick={guardarConfiguracion}
        disabled={
          modelosSeleccionados.length === 0 ||
          modelosSeleccionados.length > MAX_MODELOS ||
          modelosSeleccionados.some(m => !(m.texto ?? "").trim())
        }
      >
        Guardar configuración
      </button>
    </div>
  </div>
);
};export default ModeloTexto;