import React, { useEffect, useState, useRef } from "react";
import { useSeleccionModelos } from "../hooks/useSeleccionModelos";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import "@google/model-viewer";
import imagenSonido from "../assets/images/imag_sonido.png";
import Breadcrumbs from "../components/Breadcrumbs";

import "../assets/styles/docente/modeloSonido.css";

const ModeloSonido = () => {
  const navigate = useNavigate();

  const [juegoId] = useState(sessionStorage.getItem("juegoId"));
  const [casillaId] = useState(sessionStorage.getItem("casillaId"));
  const { modelosSeleccionados, setModelosSeleccionados } = useSeleccionModelos(juegoId, casillaId);
  const [sonidoSeleccionado, setSonidoSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "", pos: "inline" });
  const [celebracion, setCelebracion] = useState({ tipo: "confeti", opciones: {} });
  const [reproduciendo, setReproduciendo] = useState(false);

  const audioRef = useRef(null);

  const LIMITE_MODELOS = 3;

  
  const normalizarModelos = (lista = []) => {
    const out = [];
    const seen = new Set();
    for (const m of Array.isArray(lista) ? lista : []) {
      const key = m?.url || m?.id;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(m);
      if (out.length === LIMITE_MODELOS) break;
    }
    return out;
  };

  useEffect(() => {
    if (!juegoId || !casillaId) {
      alert("Error: No se encontró el juego o la casilla.");
      navigate(`/docente/configurar-casillas/${juegoId || ""}`, { replace: true });
    } else {
      cargarConfiguracionExistente();
    }
  }, [juegoId, casillaId]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        setReproduciendo(false);
      }
    };
  }, []);

  useEffect(() => {
    if (modelosSeleccionados.length === 3) {
      mostrarMensaje("Has alcanzado el máximo de 3 modelos para esta plantilla.", "warning", "center");
    }
  }, [modelosSeleccionados.length]);

  const cargarConfiguracionExistente = async () => {
  try {
    // Cargar sonido desde sessionStorage si existe
    const rawSonido = sessionStorage.getItem("sonidoSeleccionado");
    if (rawSonido) {
      try {
        const sonido = JSON.parse(rawSonido);
        const modeloAsociado = 
        sessionStorage.getItem("modeloAsociadoParaSonido") ||
        JSON.parse(sessionStorage.getItem("modeloSeleccionadoParaSonido") || "{}")?.url;
        if (modeloAsociado) sonido.modeloAsociado = modeloAsociado;
        setSonidoSeleccionado(sonido);
      } catch (err) {
        console.error("Error al parsear `sonidoSeleccionado`:", err);
      }
    }

    const key = `modelosSeleccionados_${juegoId}_${casillaId}`;
    const rawModelos = sessionStorage.getItem(key);
    if (rawModelos) {
      try {
        const modelos = JSON.parse(rawModelos);
        const modelosOk = normalizarModelos(modelos);
        if (modelosOk.length) {
          setModelosSeleccionados(modelosOk);
          return; // ya quedó cargado desde session
        }
      } catch (err) {
        console.warn("⚠️ Error al parsear modelos desde sessionStorage:", err);
      }
    }

    // Si no se cargó desde sessionStorage, ir a Firestore
    const juegoRef = doc(db, "juegos", juegoId);
    const juegoSnap = await getDoc(juegoRef);
    if (juegoSnap.exists()) {
      const idx = Number(casillaId);
      const casilla = Number.isInteger(idx)
        ? juegoSnap.data().casillas?.[idx]
        : juegoSnap.data().casillas?.[casillaId];
      if (casilla?.configuracion) {
        const modelosOk = normalizarModelos(casilla.configuracion.modelos || []);
        setModelosSeleccionados(modelosOk);
        setSonidoSeleccionado(casilla.configuracion.sonido || null);
        setCelebracion(casilla.configuracion.celebracion || { tipo: "confeti", opciones: {} });
      }
    }
  } catch (error) {
    console.error("❌ Error al cargar configuración:", error);
  }
};


  const sincronizarModelos = async () => {
    if (!sonidoSeleccionado.modeloAsociado) {
      mostrarMensaje("⚠️ El sonido no tiene modelo asociado.", "error");
      return;
    }

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
            celebracion: celebracion,
          },
        };

        await updateDoc(juegoRef, { casillas: casillasActuales });
        mostrarMensaje("✅ Plantilla guardada correctamente.", "success", "center");
      }
    } catch (error) {
      console.error("❌ Error al guardar en Firestore:", error);
      mostrarMensaje("❌ Error al guardar la plantilla.", "error");
    }
  };

  const eliminarModelo = async (urlModelo) => {
    const nuevosModelos = modelosSeleccionados.filter((modelo) => modelo.url !== urlModelo);

    if (sonidoSeleccionado?.modeloAsociado === urlModelo) {
      setSonidoSeleccionado(null);
      sessionStorage.removeItem("sonidoSeleccionado");
      sessionStorage.removeItem("modeloAsociadoParaSonido");
      sessionStorage.removeItem("modeloSeleccionadoParaSonido");
    }

    setModelosSeleccionados([...nuevosModelos]);

    try {
      const juegoRef = doc(db, "juegos", juegoId);
      const juegoSnap = await getDoc(juegoRef);

      if (juegoSnap.exists()) {
        const casillasActuales = juegoSnap.data().casillas || Array(30).fill({ configuracion: null });

        casillasActuales[casillaId] = {
          plantilla: "modelo-sonido",
          configuracion: {
            modelos: nuevosModelos,
            sonido: sonidoSeleccionado,
            celebracion: celebracion,
          },
        };

        await updateDoc(juegoRef, { casillas: casillasActuales });
      }
    } catch (error) {
      console.error("❌ Error al actualizar Firestore:", error);
    }
  };

  const mostrarMensaje = (texto, tipo = "info", pos = "inline") => {
    setMensaje({ texto, tipo, pos });
    setTimeout(() => setMensaje({ texto: "", tipo: "", pos: "inline" }), 3000);
  };

  const manejarReproduccion = () => {
    if (!sonidoSeleccionado?.url) {
      mostrarMensaje("⚠️ No hay sonido asignado.", "warning");
      return;
    }

    const audio = audioRef.current;
    if (audio) {
      if (audio.paused) {
        audio.play().catch((error) => {
          console.error("⚠️ Error al reproducir:", error);
          mostrarMensaje("⚠️ No se pudo reproducir el audio.", "warning");
        });
        setReproduciendo(true);
      } else {
        audio.pause();
        setReproduciendo(false);
      }
    }
  };

  const cambiarAsignacionDeSonido = (modelo) => {
    if (!sonidoSeleccionado) return;

    // Pausar si estaba reproduciendo
    if (audioRef.current) { audioRef.current.pause(); setReproduciendo(false); }

    const nuevo = {
      ...sonidoSeleccionado,
      modeloAsociado: modelo.url,   
    };

    setSonidoSeleccionado(nuevo);

    sessionStorage.setItem("sonidoSeleccionado", JSON.stringify(nuevo));
    sessionStorage.setItem("modeloAsociadoParaSonido", modelo.url);
    sessionStorage.setItem("modeloSeleccionadoParaSonido", JSON.stringify(modelo));

    mostrarMensaje(`Sonido reasignado a "${modelo.nombre}".`, "success");
  };

  const quitarSonidoAsignado = async () => {
    try {
      if (audioRef.current) { audioRef.current.pause(); }
      setSonidoSeleccionado(null);
      sessionStorage.removeItem("sonidoSeleccionado");
      sessionStorage.removeItem("modeloAsociadoParaSonido");
      sessionStorage.removeItem("modeloSeleccionadoParaSonido");

      const juegoRef = doc(db, "juegos", juegoId);
      const juegoSnap = await getDoc(juegoRef);
      if (juegoSnap.exists()) {
        const casillasActuales = juegoSnap.data().casillas || Array(30).fill({ configuracion: null });
        const cfg = casillasActuales[casillaId]?.configuracion || {};
        casillasActuales[casillaId] = {
          plantilla: "modelo-sonido",
          configuracion: {
            ...cfg,
            sonido: null,
          },
        };
        await updateDoc(juegoRef, { casillas: casillasActuales });
        // Limpia sessionStorage solo cuando ya se guardó
        sessionStorage.removeItem("sonidoSeleccionado");
        sessionStorage.removeItem("modeloAsociadoParaSonido");
        sessionStorage.removeItem("modeloSeleccionadoParaSonido");
      }
      mostrarMensaje("Sonido eliminado.", "success");
    } catch (e) {
      console.error(e);
      mostrarMensaje("No se pudo eliminar el sonido.", "error");
    }
  };


return (
    <div className="modelo-sonido-container">
      <Breadcrumbs />
        {mensaje.texto && (
          mensaje.pos === "center" ? (
            <div className="mensaje-overlay" role="status" aria-live="polite">
              <div className={`mensaje mensaje--center ${mensaje.tipo}`}>
                {mensaje.texto}
              </div>
            </div>
          ) : (
            <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>
          )
        )}

        <div className="titulo-con-icono">
          <h2 className="titulo-vista">Modelo-Sonido</h2>
          <img
            src={imagenSonido}
            alt="Reproducir sonido"
            className="icono-titulo-sonido"
            onClick={manejarReproduccion}
          />
          {sonidoSeleccionado?.url && (
            <audio ref={audioRef} src={sonidoSeleccionado.url} preload="auto" style={{ display: "none" }} />
          )}
        </div>
        <p className="leyenda-modelo-sonido">
          En esta plantilla puedes seleccionar modelos 3D y asignarles sonidos. 
          El objetivo es crear una experiencia interactiva y multisensorial, permitiendo que los estudiantes 
          exploren los modelos y escuchen el sonido asociado al interactuar con cada uno.
        </p>

        <div className="modelos-config__bar">
          <h3>
            Modelos seleccionados{" "}
            <span className={`pill ${modelosSeleccionados.length >= 3 ? "pill--full" : ""}`}>
              {modelosSeleccionados.length}/3
            </span>
          </h3>

          <button
            className="btn btn--secondary"
            disabled={modelosSeleccionados.length >= 3}
            title={
              modelosSeleccionados.length >= 3
                ? "Has alcanzado el máximo (3/3)"
                : `Puedes agregar hasta 3 (van ${modelosSeleccionados.length}/3)`
            }
            onClick={() => {
              if (modelosSeleccionados.length >= 3) {
                mostrarMensaje("Has alcanzado el máximo de 3 modelos para esta plantilla.", "warning", "center");
                return;
              }
             navigate("/docente/banco-modelos", {
              state: { desdePlantilla: true, juegoId, casillaId, selectionLimit: 3 },
              replace: true, 
            });
            }}
          >
            Agregar modelos
          </button>
        </div>

        {modelosSeleccionados.length > 0 ? (
          <div className="modelos-grid">
            {modelosSeleccionados.map((modelo) => {
              const isAsociado = sonidoSeleccionado?.modeloAsociado === modelo.url;
              return (
                <div key={modelo.id || modelo.url} className="modelo-card">
                  <div className="modelo-preview">
                    <model-viewer
                      src={modelo.url}
                      alt={modelo.nombre}
                      camera-controls
                      auto-rotate
                      shadow-intensity="1"
                    />
                  </div>

                  <div className="modelo-detalles">
                    <h4>{modelo.nombre}</h4>

                    <div className="acciones-modelo">
                      <button className="btn btn--danger" onClick={() => eliminarModelo(modelo.url)}>
                        Eliminar
                      </button>

                      {!sonidoSeleccionado && (
                        <button
                          className="btn btn--secondary"
                          onClick={() => {
                            sessionStorage.setItem("modeloSeleccionadoParaSonido", JSON.stringify(modelo));
                            sessionStorage.setItem("modeloAsociadoParaSonido", modelo.url);
                            sessionStorage.setItem("paginaAnterior", window.location.pathname);
                            navigate("/docente/banco-sonidos", { state: { desdePlantilla: true } });
                          }}
                        >
                          Asignar 🎵
                        </button>
                      )}

                      {sonidoSeleccionado && sonidoSeleccionado.modeloAsociado !== modelo.url && (
                        <button
                          className="btn btn--secondary"
                          onClick={() => cambiarAsignacionDeSonido(modelo)}
                          title="Mover el sonido a este modelo"
                        >
                          Cambiar asignación
                        </button>
                      )}
                    </div>

                    {isAsociado ? (
                      <div className="sonido-asignado">
                        <button
                          type="button"
                          className="btn-sound-chip"
                          onClick={manejarReproduccion}
                          aria-pressed={reproduciendo}
                          aria-label={`${reproduciendo ? "Pausar" : "Reproducir"} ${sonidoSeleccionado?.nombre || "sonido"}`}
                          title="Reproducir / Pausar"
                        >
                          <span className="icon">🔊</span>
                          <span className="label">{sonidoSeleccionado?.nombre}</span>
                          <span className="state">{reproduciendo ? "⏸" : "▶︎"}</span>
                        </button>

                        {/* Opcional: quita esta línea si no quieres mostrar “Quitar” */}
                        <button type="button" className="link-remove" onClick={quitarSonidoAsignado}>
                          🗑️ 
                        </button>
                      </div>
                    ) : (
                      !sonidoSeleccionado && <p className="sin-sonido">❌ Sin sonido asignado</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mensaje-vacio">No se han seleccionado modelos. Haz clic en <strong>Agregar modelos</strong> para elegir los modelos 3D.</p>
        )}

        <section className="seccion-celebracion">
          <label htmlFor="tipoCelebracion">Celebración:</label>
          <select
            id="tipoCelebracion"
            value={celebracion.tipo}
            onChange={(e) => setCelebracion({ tipo: e.target.value, opciones: {} })}
          >
            <option value="confeti">🎉 Confeti (visual)</option>
            <option value="mensaje">✅ Mensaje de texto</option>
          </select>

          {celebracion.tipo === "gif" && (
            <input
              type="text"
              placeholder="URL del GIF"
              value={celebracion.opciones.gifUrl || ""}
              onChange={(e) =>
                setCelebracion({
                  ...celebracion,
                  opciones: { gifUrl: e.target.value },
                })
              }
            />
          )}

          {celebracion.tipo === "mensaje" && (
            <textarea
              placeholder="Mensaje personalizado"
              rows={3}
              style={{ width: "100%", resize: "vertical" }}
              value={celebracion.opciones.mensaje || ""}
              onChange={(e) =>
                setCelebracion({
                  ...celebracion,
                  opciones: { mensaje: e.target.value },
                })
              }
            />
          )}
        </section>

        <div className="acciones-plantilla">

          <button
            className="btn btn--secondary"
            onClick={() => {
              sessionStorage.setItem("paginaAnterior", window.location.pathname);
              sessionStorage.setItem("modoVistaPrevia", "true");
              sessionStorage.setItem("modelosSeleccionados", JSON.stringify(modelosSeleccionados)); 
              sessionStorage.setItem("sonidoSeleccionado", JSON.stringify(sonidoSeleccionado));
              sessionStorage.setItem("celebracionSeleccionada", JSON.stringify(celebracion));
              navigate("/estudiante/vista-previa-modelo-sonido", {
                state: { from: window.location.pathname, juegoId, casillaId },
                replace: true,
              });
            }}
          >
            Vista previa como estudiante
          </button>

          <button className="btn btn--primary" onClick={sincronizarModelos}>
            Guardar Configuración
          </button>

        
        </div>
      </div>
  );
};

export default ModeloSonido;
