import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSeleccionModelos } from "../hooks/useSeleccionModelos";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import "@google/model-viewer";
import "../assets/styles/docente/clasificacionModelos.css";

const ClasificacionModelos = () => {
  const navigate = useNavigate();
  const [juegoId] = useState(sessionStorage.getItem("juegoId"));
  const [casillaId] = useState(sessionStorage.getItem("casillaId"));
  const { modelosSeleccionados, setModelosSeleccionados } = useSeleccionModelos(juegoId, casillaId);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [celebracion, setCelebracion] = useState({ tipo: "confeti", opciones: {} });
  const [grupos, setGrupos] = useState(null);
  const [asignaciones, setAsignaciones] = useState({});
  const [cargadoDesdeHook, setCargadoDesdeHook] = useState(false);

useEffect(() => {
  if (modelosSeleccionados.length > 0) {
    console.log("🧠 Modelos disponibles desde el hook:", modelosSeleccionados);
    setCargadoDesdeHook(true);
  }
}, [modelosSeleccionados]);

useEffect(() => {
  if (!juegoId || !casillaId) {
    alert("Error: No se encontró el juego o la casilla.");
    navigate("/docente/configurar-casillas");
  } else {
    if (!cargadoDesdeHook) {
      cargarConfiguracion(); // Firestore solo si el hook no tuvo éxito
    } else {
      console.log("✅ Hook ya cargó modelos, no sobreescribimos");
    }
  }
}, [juegoId, casillaId, navigate, cargadoDesdeHook]);

const cargarConfiguracion = async () => {
  try {
    const juegoRef = doc(db, "juegos", juegoId);
    const juegoSnap = await getDoc(juegoRef);

    if (juegoSnap.exists()) {
      const casilla = juegoSnap.data().casillas[casillaId];

      if (casilla?.configuracion) {
        const { modelos, grupos, celebracion, asignaciones: asignacionesGuardadas } = casilla.configuracion;

        setModelosSeleccionados(modelos || []);
        setGrupos(grupos ?? ["Grupo 1", "Grupo 2"]); // usa grupos guardados o crea por defecto
        setCelebracion(celebracion || { tipo: "confeti", opciones: {} });
        setAsignaciones(asignacionesGuardadas || {});
        return;
      }
    }

    // Si no hay casilla o configuración, es primera vez
    setGrupos(["Grupo 1", "Grupo 2"]);
  } catch (error) {
    console.error("Error al cargar configuración:", error);
    setGrupos(["Grupo 1", "Grupo 2"]); // fallback si algo falla
  }
};


  const guardarConfiguracion = async () => {
    const modelosConGrupo = modelosSeleccionados.map((modelo) => ({
      ...modelo,
      grupo: asignaciones[modelo.url] || null,
    }));
    
    const modelosSinGrupo = modelosConGrupo.filter(m => !m.grupo);
    if (modelosSinGrupo.length > 0) {
      mostrarMensaje("❌ Todos los modelos deben tener un grupo asignado.", "error");
      return;
    }

    try {
      const juegoRef = doc(db, "juegos", juegoId);
      const juegoSnap = await getDoc(juegoRef);

      if (juegoSnap.exists()) {
        const casillasActuales = juegoSnap.data().casillas || Array(30).fill({ configuracion: null });

        casillasActuales[casillaId] = {
          plantilla: "clasificacion-modelos",
          configuracion: {
            modelos: modelosConGrupo,
            grupos,
            celebracion,
            asignaciones
          },
        };

        await updateDoc(juegoRef, { casillas: casillasActuales });
        mostrarMensaje("✅ Plantilla guardada correctamente.", "success");
      }
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      mostrarMensaje("❌ Error al guardar la plantilla.", "error");
    }
  };

  const mostrarMensaje = (texto, tipo = "info") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  };

  const agregarGrupo = () => setGrupos([...grupos, `Grupo ${grupos.length + 1}`]);

  const cambiarGrupo = (modeloUrl, grupo) => {
    setAsignaciones((prev) => ({ ...prev, [modeloUrl]: grupo }));
  };

  const eliminarModelo = (urlModelo) => {
    const nuevosModelos = modelosSeleccionados.filter(m => m.url !== urlModelo);
    setModelosSeleccionados(nuevosModelos);
    const nuevasAsignaciones = { ...asignaciones };
    delete nuevasAsignaciones[urlModelo];
    setAsignaciones(nuevasAsignaciones);
  };

  const eliminarGrupo = (nombreGrupo) => {
    setGrupos(grupos.filter((g) => g !== nombreGrupo));
    const nuevasAsignaciones = { ...asignaciones };
    Object.keys(nuevasAsignaciones).forEach((modeloUrl) => {
      if (nuevasAsignaciones[modeloUrl] === nombreGrupo) {
        delete nuevasAsignaciones[modeloUrl];
      }
    });
    setAsignaciones(nuevasAsignaciones);
  };

  const renombrarGrupo = (index, nuevoNombre) => {
    const nuevosGrupos = [...grupos];
    const antiguo = nuevosGrupos[index];
    nuevosGrupos[index] = nuevoNombre;
    setGrupos(nuevosGrupos);

    const nuevasAsignaciones = {};
    Object.entries(asignaciones).forEach(([url, grupo]) => {
      nuevasAsignaciones[url] = grupo === antiguo ? nuevoNombre : grupo;
    });
    setAsignaciones(nuevasAsignaciones);
  };

  return (
    <div className="docente-clasificacion-container">
      <h2>Plantilla: Clasificación de Modelos</h2>
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
                <input value={g} onChange={(e) => renombrarGrupo(i, e.target.value)} />
                <button onClick={() => eliminarGrupo(g)}>❌</button>
              </li>
            ))}
          </ul>
          <button onClick={agregarGrupo}>➕ Agregar grupo</button>
        </>
      )}
    </div>

      <div className="modelos-config">
        <h3>Modelos seleccionados</h3>
        {modelosSeleccionados.length > 0 ? (
          modelosSeleccionados.map((modelo, i) => (
            <div key={i} className="modelo-item">
              <model-viewer
                src={modelo.url}
                alt={modelo.nombre}
                camera-controls
                auto-rotate
                shadow-intensity="1"
                style={{ width: "200px", height: "200px" }}
              ></model-viewer>
              <p>{modelo.nombre}</p>
              <div className="modelo-info">
                {grupos === null ? (
                <p>Cargando asignaciones...</p>
                ) : (
                  <select value={asignaciones[modelo.url] || ""} onChange={(e) => cambiarGrupo(modelo.url, e.target.value)}>
                    <option value="">Selecciona grupo</option>
                    {grupos.map((g, idx) => <option key={idx} value={g}>{g}</option>)}
                  </select>
                )}
  
                <button className="eliminar-modelo-btn" onClick={() => eliminarModelo(modelo.url)}>❌ Eliminar</button>
              </div>
            </div>
          ))
        ) : (
          <p>No hay modelos seleccionados.</p>
        )}
      </div>

      <div className="seccion-celebracion">
        <h3>🎉 Celebración</h3>
        <select value={celebracion.tipo} onChange={(e) => setCelebracion({ tipo: e.target.value, opciones: {} })}>
          <option value="confeti">🎉 Confeti</option>
          <option value="gif">🎥 GIF animado</option>
          <option value="mensaje">✅ Mensaje</option>
        </select>

        {celebracion.tipo === "gif" && (
          <input type="text" placeholder="URL del GIF" value={celebracion.opciones.gifUrl || ""} onChange={(e) => setCelebracion({ ...celebracion, opciones: { gifUrl: e.target.value } })} />
        )}

        {celebracion.tipo === "mensaje" && (
          <input type="text" placeholder="Mensaje personalizado" value={celebracion.opciones.mensaje || ""} onChange={(e) => setCelebracion({ ...celebracion, opciones: { mensaje: e.target.value } })} />
        )}
      </div>

      <button
        className="vista-previa-btn"
        onClick={() => {
          sessionStorage.setItem("modoVistaPrevia", "true");
          sessionStorage.setItem(`modelosSeleccionados_${juegoId}_${casillaId}`, JSON.stringify(modelosSeleccionados));
          sessionStorage.setItem("modelosSeleccionados", JSON.stringify(modelosSeleccionados));
          sessionStorage.setItem("gruposSeleccionados", JSON.stringify(grupos));
          sessionStorage.setItem("asignacionesModelos", JSON.stringify(asignaciones));
          sessionStorage.setItem("celebracionSeleccionada", JSON.stringify(celebracion));

          navigate("/estudiante/vista-previa-clasificacion-modelos");
        }}
      >
        Vista previa como estudiante
      </button>

      <div className="acciones-plantilla">
        <button onClick={guardarConfiguracion}>💾 Guardar configuración</button>
        <button onClick={() => {
          sessionStorage.setItem("paginaAnterior", window.location.pathname);
          sessionStorage.setItem(`modelosSeleccionados_${juegoId}_${casillaId}`, JSON.stringify(modelosSeleccionados));
          navigate("/docente/banco-modelos", {
            state: {
              desdePlantilla: true,
              juegoId,
              casillaId,
            },
          });
        }}>Seleccionar más modelos</button>
        <button onClick={() => navigate(`/docente/configurar-casillas/${juegoId}`)}>Volver</button>
      </div>
    </div>
  );
};

export default ClasificacionModelos;
