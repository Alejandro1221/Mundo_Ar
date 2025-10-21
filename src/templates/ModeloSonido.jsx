import React, { useEffect, useState, useRef } from "react";
import { useSeleccionModelos } from "../hooks/useSeleccionModelos";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import "@google/model-viewer";
import imagenSonido from "../assets/images/imag_sonido.png";
import Breadcrumbs from "../components/Breadcrumbs";
import {normalizarSonido,normalizarModelos,sanitizarSonido,getIdx, asegurarCasillas} from "../utils/normalizarSonido";

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

  useEffect(() => {
    if (!juegoId || !casillaId) {
      alert("Error: No se encontró el juego o la casilla.");
      navigate("/docente/configurar-casillas");
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
    audioRef.current?.load();   
  }, [sonidoSeleccionado?.url]);

  useEffect(() => {
  const rehidratarSonidoDesdeSession = () => {
    const rawSonido = sessionStorage.getItem("sonidoSeleccionado");
    if (!rawSonido) return;

    try {
      const sonido = JSON.parse(rawSonido);
      const modeloAsociado = sessionStorage.getItem("modeloAsociadoParaSonido");
      if (modeloAsociado) sonido.modeloAsociado = modeloAsociado;

      setSonidoSeleccionado(normalizarSonido(sonido));
      sessionStorage.removeItem("sonidoSeleccionado");
      sessionStorage.removeItem("modeloAsociadoParaSonido");
    } catch (e) {
      console.warn("⚠️ No se pudo rehidratar el sonido al volver:", e);
    }
  };

  window.addEventListener("focus", rehidratarSonidoDesdeSession);
  window.addEventListener("popstate", rehidratarSonidoDesdeSession);

  rehidratarSonidoDesdeSession();

  return () => {
    window.removeEventListener("focus", rehidratarSonidoDesdeSession);
    window.removeEventListener("popstate", rehidratarSonidoDesdeSession);
  };
}, []);

  const cargarConfiguracionExistente = async () => {
    try {
      // 1) Sonido desde sessionStorage
      const rawSonido = sessionStorage.getItem("sonidoSeleccionado");
      if (rawSonido) {
        try {
          const sonido = JSON.parse(rawSonido);
          const modeloAsociado = sessionStorage.getItem("modeloAsociadoParaSonido");
          if (modeloAsociado) sonido.modeloAsociado = modeloAsociado;
          setSonidoSeleccionado(normalizarSonido(sonido));
          sessionStorage.removeItem("sonidoSeleccionado");
          sessionStorage.removeItem("modeloAsociadoParaSonido");
          const modelos = leerModelosDesdeSession(juegoId, casillaId);
          if (modelos && modelos.length) {
            setModelosSeleccionados(normalizarModelos(modelos));
}
        } catch (err) {
          console.error("Error al parsear `sonidoSeleccionado`:", err);
        }
      }

      // 2) Modelos desde sessionStorage
      const key = `modelosSeleccionados_${juegoId}_${casillaId}`;
      const rawModelos = sessionStorage.getItem(key);
      if (rawModelos) {
        try {
          const modelos = JSON.parse(rawModelos);
          const modelosOk = normalizarModelos(modelos);
          if (modelosOk.length) {
            setModelosSeleccionados(modelosOk);
            sessionStorage.removeItem(key);
          }
        } catch (err) {
          console.warn("⚠️ Error al parsear modelos desde sessionStorage:", err);
        }
      }

      // 3) Firestore
      const juegoRef = doc(db, "juegos", juegoId);
      const juegoSnap = await getDoc(juegoRef);
      if (juegoSnap.exists()) {
        const data = juegoSnap.data();
        const idx = getIdx(casillaId);
        const casillas = asegurarCasillas(data.casillas, idx);
        const casilla = idx !== null ? casillas[idx] : undefined;
        const cfg = casilla?.configuracion || null;
        if (cfg) {
          setModelosSeleccionados(normalizarModelos(cfg.modelos || []));
          setSonidoSeleccionado(normalizarSonido(cfg.sonido));
          setCelebracion(cfg.celebracion || { tipo: "confeti", opciones: {} });
        }
      }
    } catch (error) {
      console.error("❌ Error al cargar configuración:", error);
    }
  };

  const leerModelosDesdeSession = (juegoId, casillaId) => {
    const keyConSufijo = `modelosSeleccionados_${juegoId}_${casillaId}`;
    const candidates = [keyConSufijo, "modelosSeleccionados"]; 

    for (const k of candidates) {
      const raw = sessionStorage.getItem(k);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        const lista = Array.isArray(parsed) ? parsed : [];
        sessionStorage.removeItem(k);
        return lista;
      } catch {
        // ignora y prueba siguiente
      }
    }
    return null;
  }

   const rehidratarSonidoDesdeSession = () => {
    const rawSonido = sessionStorage.getItem("sonidoSeleccionado");
    if (!rawSonido) return;

    try {
      const sonido = JSON.parse(rawSonido);
      const modeloAsociado = sessionStorage.getItem("modeloAsociadoParaSonido");
      if (modeloAsociado) sonido.modeloAsociado = modeloAsociado;

      setSonidoSeleccionado(normalizarSonido(sonido));
      sessionStorage.removeItem("sonidoSeleccionado");
      sessionStorage.removeItem("modeloAsociadoParaSonido");
    } catch (e) {
      console.warn("⚠️ No se pudo rehidratar el sonido al volver:", e);
    }

   const modelos = leerModelosDesdeSession(juegoId, casillaId);
   if (modelos) setModelosSeleccionados(normalizarModelos(modelos));
  };

  const sincronizarModelos = async () => {
    const sonidoOk = sanitizarSonido(sonidoSeleccionado);
    if (!sonidoOk?.url) {
      mostrarMensaje("⚠️ Debes asignar un sonido antes de guardar.", "error");
      return;
    }

    try {
      const juegoRef = doc(db, "juegos", juegoId);
      const juegoSnap = await getDoc(juegoRef);
      if (juegoSnap.exists()) {
        const data = juegoSnap.data();
        const idx = getIdx(casillaId);
        if (idx === null) throw new Error("casillaId inválido");
      const casillasActuales = asegurarCasillas(data.casillas, idx);
      casillasActuales[idx] = {
        plantilla: "modelo-sonido",
        configuracion: {
          modelos: normalizarModelos(modelosSeleccionados),
          sonido: sonidoOk || null,
          celebracion,
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
    const estabaAsociado = sonidoSeleccionado?.modeloAsociado === urlModelo;
    const nuevoSonido = estabaAsociado ? null : sanitizarSonido(sonidoSeleccionado);
    const nuevosModelos = modelosSeleccionados.filter(m => m.url !== urlModelo);

    if (sonidoSeleccionado?.modeloAsociado === urlModelo) {
      setSonidoSeleccionado(null);
      sessionStorage.removeItem("sonidoSeleccionado");
      sessionStorage.removeItem("modeloAsociadoParaSonido");
    }

    setModelosSeleccionados([...nuevosModelos]);

    try {
      const juegoRef = doc(db, "juegos", juegoId);
      const juegoSnap = await getDoc(juegoRef);
      if (juegoSnap.exists()) {
        const data = juegoSnap.data();
        const idx = getIdx(casillaId);
        if (idx === null) throw new Error("casillaId inválido");
        const casillasActuales = asegurarCasillas(data.casillas, idx);
        casillasActuales[idx] = {
          plantilla: "modelo-sonido",
          configuracion: {
            modelos: normalizarModelos(nuevosModelos),
            sonido: nuevoSonido,
            celebracion,
          },
        };
        await updateDoc(juegoRef, { casillas: casillasActuales });
      }
    } catch (error) {
      console.error("❌ Error al actualizar Firestore:", error);
    }
  };

  const timeoutRef = useRef(null);
  const mostrarMensaje = (texto, tipo = "info", pos = "inline") => {
    setMensaje({ texto, tipo, pos });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setMensaje({ texto: "", tipo: "", pos: "inline" }), 3000);
  };
  useEffect(() => () => timeoutRef.current && clearTimeout(timeoutRef.current), []);

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

  const quitarSonidoAsignado = async () => {
    try {
      setSonidoSeleccionado(null);
      sessionStorage.removeItem("sonidoSeleccionado");
      sessionStorage.removeItem("modeloAsociadoParaSonido");

      const juegoRef = doc(db, "juegos", juegoId);
      const juegoSnap = await getDoc(juegoRef);
      if (juegoSnap.exists()) {
        const data = juegoSnap.data();
        const idx = getIdx(casillaId);
        const casillasActuales = asegurarCasillas(data.casillas, idx);
        const cfg = casillasActuales[idx]?.configuracion || {};
        casillasActuales[idx] = {
          plantilla: "modelo-sonido",
          configuracion: {
            ...cfg,
            sonido: null,
          },
        };
        await updateDoc(juegoRef, { casillas: casillasActuales });
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
            <audio
              ref={audioRef}
              src={sonidoSeleccionado.url}
              preload="auto"
              style={{ display: "none" }}
            />
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
            aria-describedby="limite-modelos-ayuda"
            onClick={() => {
              if (modelosSeleccionados.length >= 3) return;
              sessionStorage.setItem("paginaAnterior", window.location.pathname);
              navigate("/docente/banco-modelos", { 
                state: { desdePlantilla: true, juegoId, casillaId, selectionLimit: 3 } 
              });
            }}
          >
            Agregar modelos
          </button>
        </div>

        {modelosSeleccionados.length >= 3 && (
          <p id="limite-modelos-ayuda" className="ayuda-limite" aria-live="polite">
            Has alcanzado el máximo de 3 modelos para esta plantilla. Elimina uno para agregar otro.
          </p>
        )}

        {modelosSeleccionados.length > 0 ? (
          <div className="modelos-grid">
            {modelosSeleccionados.map((modelo) => {
              const isAsociado = sonidoSeleccionado?.modeloAsociado === modelo.url;
              return (
                <div key={modelo.id || modelo.url} className="modelo-card">
                  <div
                    className="modelo-preview"
                    onClick={isAsociado && sonidoSeleccionado?.url ? manejarReproduccion : undefined}
                    style={{ cursor: isAsociado && sonidoSeleccionado?.url ? "pointer" : "default" }}
                  >
                    {modelo.url ? (
                      <model-viewer
                        key={modelo.url}
                        src={modelo.url}
                        alt={modelo.nombre}
                        camera-controls
                        auto-rotate
                        shadow-intensity="1"
                        style={{ width: "100%", height: "180px" }}
                      />
                    ) : (
                  <div style={{ width: "100%", height: 180, background: "#f3f6ff", borderRadius: 8 }} />
                )}
              </div>

                  <div className="modelo-detalles">
                    <h4>{modelo.nombre}</h4>

                    <div className="acciones-modelo">
                      <button className="btn btn--danger" onClick={() => eliminarModelo(modelo.url)}>
                        🗑️ Eliminar
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
                    </div>

                    {isAsociado ? (
                      <div className="sonido-asignado">
                        <p>🔊 {sonidoSeleccionado.nombre}</p>
                        <audio key={sonidoSeleccionado.url} controls>
                          <source src={sonidoSeleccionado.url} type="audio/mpeg" />
                        </audio>
                        <button className="btn btn--secondary" style={{ marginTop: 8 }} onClick={quitarSonidoAsignado}>
                          Quitar sonido
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
              sessionStorage.setItem("modoVistaPrevia", "true");
              sessionStorage.setItem("modelosSeleccionados", JSON.stringify(modelosSeleccionados)); 
              sessionStorage.setItem("sonidoSeleccionado", JSON.stringify(sonidoSeleccionado));
              sessionStorage.setItem("celebracionSeleccionada", JSON.stringify(celebracion));
              navigate("/estudiante/vista-previa-modelo-sonido");
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
