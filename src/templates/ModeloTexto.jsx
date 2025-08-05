import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { useSeleccionModelos } from "../hooks/useSeleccionModelos";
import "@google/model-viewer";
import "../assets/styles/docente/modeloTexto.css";

const ModeloTexto = () => {
  const navigate = useNavigate();
  //const { modelosSeleccionados, setModelosSeleccionados } = useSeleccionModelos();
  
  const [juegoId] = useState(sessionStorage.getItem("juegoId"));
  const [casillaId] = useState(sessionStorage.getItem("casillaId"));
  const { modelosSeleccionados, setModelosSeleccionados } = useSeleccionModelos(juegoId, casillaId);

  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [asignaciones, setAsignaciones] = useState({});

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


const cargarConfiguracion = async () => {
  try {
    // Si ya hay modelos cargados por el hook, no sobrescribas
    if (modelosSeleccionados.length > 0) {
      console.log("✅ Modelos ya estaban en memoria:", modelosSeleccionados);
      const nuevasAsignaciones = {};
      modelosSeleccionados.forEach(modelo => {
        nuevasAsignaciones[modelo.url] = modelo.texto || "";
      });
      setAsignaciones(nuevasAsignaciones);
      return;
    }

    // Si no, buscar en Firestore
    const juegoRef = doc(db, "juegos", juegoId);
    const juegoSnap = await getDoc(juegoRef);

    if (juegoSnap.exists()) {
      const dataJuego = juegoSnap.data();
      const casilla = dataJuego.casillas[casillaId];

      if (casilla?.configuracion?.modelos?.length > 0) {
        const modelos = casilla.configuracion.modelos;
        const nuevasAsignaciones = {};
        const modelosConTexto = modelos.map((modelo) => {
          const texto = modelo.texto || "";
          nuevasAsignaciones[modelo.url] = texto;
          return { ...modelo, texto };
        });

        setModelosSeleccionados(modelosConTexto);
        setAsignaciones(nuevasAsignaciones);
        console.log("📥 Modelos cargados desde Firestore:", modelosConTexto);
      }
    }
  } catch (error) {
    console.error("Error al cargar configuración:", error);
  }
};

  
  const guardarConfiguracion = async () => {
    const faltanTextos = modelosSeleccionados.some(
      (modelo) => !asignaciones[modelo.url]?.trim()
    );
    
    if (faltanTextos) {
      mostrarMensaje("⚠️ Todos los modelos deben tener un concepto escrito.", "error");
      return;
    }
    
    // Construye modelos completos
    const modelosConTexto = modelosSeleccionados.map((modelo) => ({
      ...modelo,
      texto: asignaciones[modelo.url].trim(),
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
  
      console.log("Modelos que se van a guardar:", modelosConTexto);
      console.log("Casillas que se van a actualizar:", casillasActuales);
      console.log("Guardado en casilla:", casillaId);

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

    const eliminarModelo = (urlModelo) => {
    const nuevosModelos = modelosSeleccionados.filter((m) => m.url !== urlModelo);
    setModelosSeleccionados(nuevosModelos);

    const nuevasAsignaciones = { ...asignaciones };
    delete nuevasAsignaciones[urlModelo];
    setAsignaciones(nuevasAsignaciones);
  };


  return (
    <div className="modelo-texto-container">
       <div className="contenido-scrollable">
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
                  <button
                    className="eliminar-modelo-btn"
                   onClick={() => {
                    if (confirm("¿Estás seguro de eliminar este modelo?")) {
                      eliminarModelo(modelo.url);
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
            sessionStorage.setItem("modoVistaPrevia", "true");
            sessionStorage.setItem("paginaAnterior", window.location.pathname);
            sessionStorage.setItem("modelosSeleccionados", JSON.stringify(modelosSeleccionados));
            sessionStorage.setItem("asignacionesTexto", JSON.stringify(asignaciones));
            navigate("/estudiante/vista-previa-modelo-texto");
          }}
        >
          vista previa
        </button>

        <div className="acciones-plantilla">
          <button onClick={guardarConfiguracion}>💾 Guardar</button>
          <button
            onClick={() => {
              sessionStorage.setItem("paginaAnterior", window.location.pathname);
              sessionStorage.setItem("modelosSeleccionados", JSON.stringify(modelosSeleccionados));
              //navigate("/docente/banco-modelos", { state: { desdePlantilla: true } });
              navigate("/docente/banco-modelos", { state: { desdePlantilla: true,juegoId, casillaId, }, });
            }}
          >
            Seleccionar Modelos
          </button>
          <button onClick={() => navigate(`/docente/configurar-casillas/${juegoId}`)}>⬅️ Volver</button>
        </div>
        </div>
    </div>
  );
};

export default ModeloTexto;
