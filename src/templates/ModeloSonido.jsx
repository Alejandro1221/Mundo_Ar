import React, { useEffect, useState, useRef } from "react";
import { useSeleccionModelos } from "../hooks/useSeleccionModelos";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import "@google/model-viewer";
import imagenSonido from "../assets/images/imag_sonido.png";
import "../assets/styles/docente/modeloSonido.css";

const ModeloSonido = () => {
  const navigate = useNavigate();

  const [juegoId] = useState(sessionStorage.getItem("juegoId"));
  const [casillaId] = useState(sessionStorage.getItem("casillaId"));
  const { modelosSeleccionados, setModelosSeleccionados } = useSeleccionModelos(juegoId, casillaId);

  const [sonidoSeleccionado, setSonidoSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
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

  const cargarConfiguracionExistente = async () => {
  try {
    // 🔊 Cargar sonido desde sessionStorage si existe
    const rawSonido = sessionStorage.getItem("sonidoSeleccionado");
    if (rawSonido) {
      try {
        const sonido = JSON.parse(rawSonido);
        const modeloAsociado = sessionStorage.getItem("modeloAsociadoParaSonido");
        if (modeloAsociado) {
          sonido.modeloAsociado = modeloAsociado;
        }
        setSonidoSeleccionado(sonido);
      } catch (err) {
        console.error("❌ Error al parsear `sonidoSeleccionado`:", err);
      }
    }

    // ✅ Intentar cargar modelos desde sessionStorage
    const key = `modelosSeleccionados_${juegoId}_${casillaId}`;
    const rawModelos = sessionStorage.getItem(key);
    if (rawModelos) {
      try {
        const modelos = JSON.parse(rawModelos);
        if (Array.isArray(modelos)) {
           console.log("🔑 Clave usada:", key);
            console.log("📦 Datos recuperados:", modelos);
          console.log("✅ Modelos recuperados desde sessionStorage:", modelos);
          setModelosSeleccionados(modelos);
          return; // ⛔ No seguir a Firestore si ya cargamos
        }
      } catch (err) {
        console.warn("⚠️ Error al parsear modelos desde sessionStorage:", err);
      }
    }

  

    // 🔄 Si no se cargó desde sessionStorage, ir a Firestore
    const juegoRef = doc(db, "juegos", juegoId);
    const juegoSnap = await getDoc(juegoRef);

    if (juegoSnap.exists()) {
      const casilla = juegoSnap.data().casillas[casillaId];
      if (casilla?.configuracion) {
        setModelosSeleccionados(casilla.configuracion.modelos || []);
        setSonidoSeleccionado(casilla.configuracion.sonido || null);
        setCelebracion(casilla.configuracion.celebracion || { tipo: "confeti", opciones: {} });
      }
    }
  } catch (error) {
    console.error("❌ Error al cargar configuración:", error);
  }
};


  const sincronizarModelos = async () => {
    if (!sonidoSeleccionado || !sonidoSeleccionado.url) {
      mostrarMensaje("⚠️ Debes asignar un sonido antes de guardar.", "error");
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
        mostrarMensaje("✅ Plantilla guardada correctamente.", "success");
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

  const mostrarMensaje = (texto, tipo = "info") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
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

  return (
    <div className="docente-modelo-container">
      <div className="contenido-scrollable">
        {mensaje.texto && (
          <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>
        )}

        <div className="titulo-con-icono">
          <h2 className="titulo-vista">Configurar Modelo-Sonido</h2>
          <img
            src={imagenSonido}
            alt="Reproducir sonido"
            className="icono-titulo-sonido"
            onClick={manejarReproduccion}
          />
        </div>

        <div className="docente-modelos-seleccionados">
          {modelosSeleccionados.length > 0 ? (
            modelosSeleccionados.map((modelo, index) => (
              <div key={index} className="docente-modelo-item">
                <model-viewer
                  src={modelo.url}
                  alt={`Modelo ${modelo.nombre}`}
                  camera-controls
                  auto-rotate
                  shadow-intensity="1"
                  style={{ width: "100px", height: "100px" }}
                ></model-viewer>

                <p className="nombre-modelo">{modelo.nombre}</p>

                <button className="btn-rojo" onClick={() => eliminarModelo(modelo.url)}>
                  🗑️ Eliminar
                </button>

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

                {modelo.sonido?.url ? (
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
            <p className="mensaje-vacio">⚠️ No se han seleccionado modelos.</p>
          )}
        </div>

        <section className="seccion-celebracion">
          <label htmlFor="tipoCelebracion">🎈 Tipo de Celebración:</label>
          <select
            id="tipoCelebracion"
            value={celebracion.tipo}
            onChange={(e) => setCelebracion({ tipo: e.target.value, opciones: {} })}
          >
            <option value="confeti">🎉 Confeti (visual)</option>
            <option value="gif">🎥 GIF animado</option>
            <option value="mensaje">✅ Mensaje de texto</option>
            <option value="animacion">🌈 Animación suave</option>
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
            <input
              type="text"
              placeholder="Mensaje personalizado"
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

        <div className="acciones-finales">
          <button
            className="btn-secundario"
            onClick={() => {
              sessionStorage.setItem("paginaAnterior", window.location.pathname);
              navigate("/docente/banco-modelos", { state: { desdePlantilla: true, juegoId, casillaId } });
            }}
          >
            ➕ Seleccionar Modelos
          </button>

          <button
            className="vista-previa-btn"
            onClick={() => {
              sessionStorage.setItem("modoVistaPrevia", "true");
              sessionStorage.setItem("sonidoSeleccionado", JSON.stringify(sonidoSeleccionado));
              sessionStorage.setItem("celebracionSeleccionada", JSON.stringify(celebracion));
              navigate("/estudiante/vista-previa-modelo-sonido");
            }}
          >
            Vista previa como estudiante
          </button>

          <button className="guardar-btn" onClick={sincronizarModelos}>
            💾 Guardar Configuración
          </button>

          <button
            className="volver-btn"
            onClick={() => {
              const historial = JSON.parse(sessionStorage.getItem("historialPaginas")) || [];
              historial.pop();
              const paginaAnterior = historial.pop();
              sessionStorage.setItem("historialPaginas", JSON.stringify(historial));
              if (paginaAnterior) {
                navigate(paginaAnterior);
              } else {
                navigate(`/docente/configurar-casillas/${juegoId}`);
              }
            }}
          >
            ⬅️ Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModeloSonido;
