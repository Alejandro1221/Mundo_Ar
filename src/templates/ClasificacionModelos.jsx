import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSeleccionModelos } from "../hooks/useSeleccionModelos";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import "../assets/styles/docente/clasificacionModelos.css";
import Breadcrumbs from "../components/Breadcrumbs";

const ClasificacionModelos = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [juegoId] = useState(sessionStorage.getItem("juegoId"));
  const [casillaId] = useState(sessionStorage.getItem("casillaId"));
  const { modelosSeleccionados, setModelosSeleccionados } = useSeleccionModelos(juegoId, casillaId);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [celebracion, setCelebracion] = useState({ tipo: "confeti", opciones: {} });
  const [grupos, setGrupos] = useState(null);
  const [asignaciones, setAsignaciones] = useState({});
  const [edits, setEdits] = useState({});
  const MAX_GRUPOS = 3;
  const MIN_GRUPOS = 2;
  const MAX_MODELOS = 6;

const normalizarGrupos = (grs) => {
  const base = Array.isArray(grs) && grs.length ? grs.slice(0, MAX_GRUPOS) : ["Grupo 1", "Grupo 2"];
  const clean = [];
  base.forEach((g, i) => {
    const n = String(g || "").trim() || `Grupo ${i + 1}`;
    if (!clean.includes(n)) clean.push(n);
  });
  while (clean.length < MIN_GRUPOS) clean.push(`Grupo ${clean.length + 1}`);
  return clean.slice(0, MAX_GRUPOS);
};



const clampAsignaciones = (grs, asigs) => {
  const set = new Set(grs || []);
  const out = {};
  Object.entries(asigs || {}).forEach(([k, v]) => {
    if (set.has(v)) out[k] = v;
  });
  return out;
};


useEffect(() => {
  let alive = true;

  (async () => {
    const idJuego = juegoId || sessionStorage.getItem("juegoId");
    const idCasilla = casillaId || sessionStorage.getItem("casillaId");

    if (!idJuego || !idCasilla) {
      setMensaje({ texto: "Error: No se encontró el juego o la casilla.", tipo: "error" });
      navigate(`/docente/configurar-casillas/${idJuego ?? ""}`, { replace: true });
      return;
    }

    await cargarConfiguracion(() => alive);
  })();

  return () => { alive = false; };
}, []);

useEffect(() => {
  if (Array.isArray(modelosSeleccionados) && modelosSeleccionados.length > 0 && grupos === null) {
    setGrupos(normalizarGrupos(["Grupo 1", "Grupo 2"]));
  }
}, [modelosSeleccionados, grupos]);


useEffect(() => {
  if (!mensaje.texto) return;
  const t = setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  return () => clearTimeout(t);
}, [mensaje]);

useEffect(() => {
  if (!Array.isArray(modelosSeleccionados)) return;
  if (modelosSeleccionados.length > MAX_MODELOS) {
    setModelosSeleccionados(modelosSeleccionados.slice(0, MAX_MODELOS));
    setMensaje({ texto: `Máximo ${MAX_MODELOS} modelos. Se recortó la lista.`, tipo: "error" });
  }
}, [modelosSeleccionados, MAX_MODELOS]);


const cargarConfiguracion = async (isAlive = () => true) => {
  try {
    const juegoRef = doc(db, "juegos", juegoId);
    const juegoSnap = await getDoc(juegoRef);

    if (!isAlive()) return; // por si tarda la red

    if (juegoSnap.exists()) {
      const idx = Number(casillaId);
      if (!Number.isInteger(idx) || idx < 0 || idx >= 30) {
        if (isAlive()) setGrupos(normalizarGrupos(["Grupo 1", "Grupo 2"]));
        return;
      }

      const casilla = (juegoSnap.data().casillas || [])[idx];
      if (casilla?.configuracion) {
        const {
          modelos: modelosGuardados = [],
          grupos: gruposGuardados,
          celebracion: celebracionGuardada,
          asignaciones: asignacionesGuardadas
        } = casilla.configuracion;

        if (!isAlive()) return;

        setModelosSeleccionados(prev => {
        const mapa = new Map(prev.map(m => [m.id || m.url, m]));
        modelosGuardados.forEach(m => {
          if (!m?.url) return;
          mapa.set(m.id || m.url, m);
        });

        const combinados = Array.from(mapa.values());

        if (combinados.length > MAX_MODELOS) {
          setMensaje({
            texto: `Se permiten máximo ${MAX_MODELOS} modelos. Se usaron los primeros ${MAX_MODELOS}.`,
            tipo: "error",
          });
        }

        return combinados.slice(0, MAX_MODELOS);
      });

        const topados = normalizarGrupos(gruposGuardados ?? ["Grupo 1", "Grupo 2"]);
        if (isAlive()) setGrupos(topados);
        if (isAlive()) setCelebracion(celebracionGuardada || { tipo: "confeti", opciones: {} });
        if (isAlive()) setAsignaciones(clampAsignaciones(topados, asignacionesGuardadas || {}));
        return;
      }
    }

    if (isAlive()) setGrupos(normalizarGrupos(["Grupo 1", "Grupo 2"]));
  } catch (error) {
    console.error("Error cargarConfiguracion:", error);
    if (isAlive()) setGrupos(normalizarGrupos(["Grupo 1", "Grupo 2"]));
  }
};

  const guardarConfiguracion = async () => {
    if (modelosSeleccionados.length > MAX_MODELOS) {
      mostrarMensaje(`❌ Máximo ${MAX_MODELOS} modelos. Elimina algunos antes de guardar.`, "error");
      return;
    }
    if (!Array.isArray(grupos) || grupos.length < MIN_GRUPOS) {
      mostrarMensaje(`❌ Debes tener al menos ${MIN_GRUPOS} grupos.`, "error");
      return;
    }
    const topados = normalizarGrupos(grupos);
    const asigsOk = clampAsignaciones(topados, asignaciones);

    const modelosValidos = modelosSeleccionados.filter(m => !!m?.url);
    const modelosConGrupo = modelosValidos.map(m => ({...m,grupo: asigsOk[m.url] ?? asigsOk[m.id] ?? m.grupo ?? null,}));
    const modelosSinGrupo = modelosConGrupo.filter(m => !m.grupo);

    if (modelosValidos.length !== modelosSeleccionados.length) {
      mostrarMensaje("❌ Hay modelos sin URL válida.", "error");
      return;
    }
    if (modelosSinGrupo.length > 0) {
      mostrarMensaje("❌ Todos los modelos deben tener un grupo asignado.", "error");
      return;
    }

    try {
      const juegoRef = doc(db, "juegos", juegoId);
      const juegoSnap = await getDoc(juegoRef);
      if (!juegoSnap.exists()) {
        mostrarMensaje("❌ Juego no encontrado.", "error");
        return;
      }
      const idx = Number(casillaId);
      if (!Number.isInteger(idx) || idx < 0 || idx >= 30) {
        mostrarMensaje("❌ Casilla inválida.", "error");
        return;
      }
      const existentes = Array.isArray(juegoSnap.data().casillas) ? juegoSnap.data().casillas : [];
      const casillasActuales = Array.from({ length: 30 }, (_, i) => (existentes[i] ? { ...existentes[i] } : { configuracion: null }));

      casillasActuales[idx] = {
        ...(casillasActuales[idx] || {}),
        plantilla: "clasificacion-modelos",
        configuracion: {
          modelos: modelosConGrupo,
          grupos: topados,
          celebracion,
          asignaciones: asigsOk
        },
      };

      await updateDoc(juegoRef, { casillas: casillasActuales });
      mostrarMensaje("✅ Plantilla guardada correctamente.", "success");
    } catch (error) {
      console.error("Error guardarConfiguracion:", error);
      mostrarMensaje("❌ Error al guardar la plantilla.", "error");
    }
  };


  const mostrarMensaje = (texto, tipo = "info") => {
    setMensaje({ texto, tipo });
  };

  const agregarGrupo = () => {
    if (!Array.isArray(grupos) || grupos.length < MIN_GRUPOS) {
      setGrupos(normalizarGrupos(grupos));
      return;
    }
    if (grupos.length >= MAX_GRUPOS) {
      mostrarMensaje(`Solo se permiten hasta ${MAX_GRUPOS} grupos.`, "error");
      return;
    }
    const base = `Grupo ${grupos.length + 1}`;
    let nombre = base;
    let n = 1;
    const lower = s => s.toLowerCase();
    const has = s => grupos.some(g => lower(g) === lower(s));
    while (has(nombre)) {
      nombre = `${base} (${n++})`;
    }
    setGrupos(prev => [...prev, nombre]);
  };


  const eliminarModelo = (urlModelo) => {
    const nuevosModelos = modelosSeleccionados.filter(m => m.url !== urlModelo);
    setModelosSeleccionados(nuevosModelos);
    const nuevasAsignaciones = { ...asignaciones };
    delete nuevasAsignaciones[urlModelo];
    const m = modelosSeleccionados.find(mm => mm.url === urlModelo);
    if (m?.id) delete nuevasAsignaciones[m.id];
    setAsignaciones(nuevasAsignaciones);
  };

  const cambiarGrupo = (url, grupo, id) => {
    setAsignaciones(prev => {
      const next = { ...prev };
      if (!grupo) {
        delete next[url];
        if (id) delete next[id];
      } else {
        next[url] = grupo;     
        if (id) delete next[id];
      }
      return next;
    });
  };

  const eliminarGrupo = (nombreGrupo) => {
    if (!Array.isArray(grupos) || grupos.length <= MIN_GRUPOS) {
      mostrarMensaje(`Debe existir al menos ${MIN_GRUPOS} grupos.`, "error");
      return;
    }
    const nuevos = grupos.filter(g => g !== nombreGrupo).slice(0, MAX_GRUPOS);
    const normalizados = normalizarGrupos(nuevos);
    setGrupos(normalizados);

    const asignacionesFiltradas = {};
    Object.entries(asignaciones).forEach(([url, g]) => {
      if (normalizados.includes(g)) asignacionesFiltradas[url] = g;
    });
    setAsignaciones(asignacionesFiltradas);
  };

  const renombrarGrupo = (index, nuevoNombre) => {
    const nombre = String(nuevoNombre).trim();
    if (!nombre) { mostrarMensaje("El nombre no puede estar vacío.", "error"); return; }
    if (grupos.some((g, i) => i !== index && g.toLowerCase() === nombre.toLowerCase())) {
      mostrarMensaje("Ya existe un grupo con ese nombre.", "error"); return;
    }
    const nuevosGrupos = [...grupos];
    const antiguo = nuevosGrupos[index];
    nuevosGrupos[index] = nombre;
    const topados = nuevosGrupos.slice(0, MAX_GRUPOS);
    setGrupos(topados);
    const nuevas = {};
    Object.entries(asignaciones).forEach(([url, g]) => {
      const ng = g === antiguo ? nombre : g;
      if (topados.includes(ng)) nuevas[url] = ng;
    });
    setAsignaciones(nuevas);
  };

  const irAVistaPrevia = () => {
  sessionStorage.setItem("modoVistaPrevia", "true");
  sessionStorage.setItem("paginaAnterior", location.pathname);
  navigate("/estudiante/vista-previa-clasificacion-modelos", {
    state: { from: location.pathname },
    replace: false,
  });
};

  return (
    <div className="docente-clasificacion-container">
      <Breadcrumbs/>
        <h2>Clasificación de Modelos</h2>
        <p className="leyenda-clasificacion">
          Esta actividad permite organizar modelos 3D en grupos según sus características. 
          El objetivo es que los estudiantes aprendan a identificar, comparar y clasificar 
          los modelos, reforzando el aprendizaje activo y la comprensión de los conceptos.
        </p>
          
      {mensaje.texto && <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}

      <div className="grupos-config">
      <h3>Grupos</h3>
      {grupos === null ? (
        <p>Cargando grupos...</p>
      ) : (
        <>
          <ul>
            {grupos.map((g, i) => (
              <li key={i}>
                <input
                  value={edits[i] ?? g}
                  onChange={(e) =>
                    setEdits(prev => ({ ...prev, [i]: e.target.value }))
                  }
                  onBlur={(e) => {
                    const nuevo = e.target.value.trim();

                    if (!nuevo) {
                      setEdits(prev => {
                        const { [i]: _, ...rest } = prev; 
                        return rest;
                      });
                      mostrarMensaje("El nombre no puede quedar vacío.", "error");
                      return;
                    }
                    if (grupos.some((gg, j) => j !== i && gg.toLowerCase() === nuevo.toLowerCase())) {
                      setEdits(prev => {
                        const { [i]: _, ...rest } = prev; 
                        return rest;
                      });
                      mostrarMensaje("Ya existe un grupo con ese nombre.", "error");
                      return;
                    }
                    renombrarGrupo(i, nuevo);
                  
                    setEdits(prev => {
                      const { [i]: _, ...rest } = prev; 
                      return rest;
                    });
                  }}
                  placeholder={`Grupo ${i + 1}`}
                />
                <button className="btn btn--danger btn--sm" onClick={() => eliminarGrupo(g)}>❌</button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={agregarGrupo}
            disabled={Array.isArray(grupos) && grupos.length >= MAX_GRUPOS}
            title={Array.isArray(grupos) && grupos.length >= MAX_GRUPOS ? `Máximo ${MAX_GRUPOS} grupos` : undefined}
          >Agregar grupo</button>
        </>
      )}
    </div>
      <div className="modelos-config">
        <div className="modelos-config__bar">
          <h3>Modelos seleccionados</h3>

          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => {
              sessionStorage.setItem("juegoId", juegoId);
              sessionStorage.setItem("casillaId", casillaId);
              //sessionStorage.setItem("paginaAnterior", window.location.pathname);
              sessionStorage.setItem("paginaAnterior", location.pathname);

              // Guardar estado actual si se vuelve desde banxco de modelos
              sessionStorage.setItem(`modelosSeleccionados_${juegoId}_${casillaId}`, JSON.stringify(modelosSeleccionados));
              sessionStorage.setItem("modelosSeleccionados", JSON.stringify(modelosSeleccionados));
              sessionStorage.setItem("gruposSeleccionados", JSON.stringify(grupos));
              sessionStorage.setItem("asignacionesModelos", JSON.stringify(asignaciones));
              sessionStorage.setItem("celebracionSeleccionada", JSON.stringify(celebracion));
              sessionStorage.setItem("seleccionandoModelos", "1");

              navigate("/docente/banco-modelos", {
                state: { desdePlantilla: true, juegoId, casillaId },
              });
            }}
            disabled={modelosSeleccionados.length >= MAX_MODELOS}              
            title={
              modelosSeleccionados.length >= MAX_MODELOS
                ? `Límite alcanzado (${MAX_MODELOS})`
                : undefined
            }                                                                  
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
            modelosSeleccionados.map((modelo, i) => (
               <div key={modelo.id || modelo.url} className="modelo-card">
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

                  {grupos === null ? (
                    <p>Cargando asignaciones...</p>
                  ) : (
                    <select
                      value={asignaciones[modelo.url] ?? asignaciones[modelo.id] ?? ""}
                      onChange={(e) => cambiarGrupo(modelo.url, e.target.value, modelo.id)}
                    >
                      <option value="">Selecciona grupo</option>
                      {grupos.map((g, idx) => (
                        <option key={idx} value={g}>{g}</option>
                      ))}
                    </select>
                  )}

                  <button
                    className="btn btn--danger"
                    onClick={() => eliminarModelo(modelo.url)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No hay modelos seleccionados aún. Haz clic en <strong>+ Agregar modelos</strong> para elegir los modelos 3D que deseas clasificar en esta actividad.</p>
          )}
        </div>
      </div>


      <div className="seccion-celebracion">
        <h3>Celebración</h3>
        <select value={celebracion.tipo} onChange={(e) => setCelebracion({ tipo: e.target.value, opciones: {} })}>
          <option value="confeti">🎉 Confeti</option>
          <option value="mensaje">✅ Mensaje</option>
        </select>

        {celebracion.tipo === "mensaje" && (
          <textarea
            placeholder="Mensaje personalizado"
            value={celebracion.opciones.mensaje || ""}
            onChange={(e) =>
              setCelebracion({
                ...celebracion,
                opciones: { mensaje: e.target.value }
              })
            }
            rows={3}
            style={{ width: "100%", resize: "vertical" }}
          />
        )}
      </div>

      <div className="acciones-plantilla">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => {
              sessionStorage.setItem("paginaAnterior", window.location.pathname);
              const gruposNorm = normalizarGrupos(grupos);
              const modelosConGrupo = modelosSeleccionados.map((m) => ({
                ...m,
                grupo: asignaciones[m.url] ?? asignaciones[m.id] ?? m.grupo ?? null,
              }));

              sessionStorage.setItem("modoVistaPrevia", "true");
              sessionStorage.setItem(`modelosSeleccionados_${juegoId}_${casillaId}`, JSON.stringify(modelosConGrupo));
              sessionStorage.setItem("modelosSeleccionados", JSON.stringify(modelosConGrupo));
              sessionStorage.setItem("gruposSeleccionados", JSON.stringify(gruposNorm));
              sessionStorage.setItem("asignacionesModelos", JSON.stringify(asignaciones));
              sessionStorage.setItem("celebracionSeleccionada", JSON.stringify(celebracion));

              navigate("/estudiante/vista-previa-clasificacion-modelos", {
                state: { from: location.pathname, juegoId, casillaId },
              });
            }}
          >
            Vista previa como estudiante
          </button>

          <button
              type="button"
              className="btn btn--primary"
              onClick={guardarConfiguracion}
              disabled={
                !Array.isArray(grupos) ||
                grupos.length < MIN_GRUPOS ||
                modelosSeleccionados.length === 0 ||
                modelosSeleccionados.length > MAX_MODELOS ||
                modelosSeleccionados.some(m =>!(asignaciones[m.url] ?? asignaciones[m.id] ?? m.grupo))
              }
            >
              Guardar configuración
          </button>

      </div>


    </div>
  );
};

export default ClasificacionModelos;
