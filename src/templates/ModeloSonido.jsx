import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { db, storage } from "../services/firebaseConfig";

const ModeloSonido = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Estados
  const [modelosSeleccionados, setModelosSeleccionados] = useState([]);
  const [sonidoSeleccionado, setSonidoSeleccionado] = useState(null);
  const [juegoId] = useState(sessionStorage.getItem("juegoId"));
  const [casillaId] = useState(sessionStorage.getItem("casillaId"));

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

  // 🔹 Función para obtener la URL del modelo desde Firebase Storage
  const obtenerURLModelo = async (rutaModelo) => {
    try {
      if (rutaModelo.startsWith("https://firebasestorage.googleapis.com")) {
        return rutaModelo;
      } else {
        const storageRef = ref(storage, rutaModelo);
        return await getDownloadURL(storageRef);
      }
    } catch (error) {
      console.error("❌ Error al obtener la URL:", error);
      return null;
    }
  };

  // 🔹 Cargar configuración existente desde Firestore
  const cargarConfiguracionExistente = async () => {
    try {
      const juegoRef = doc(db, "juegos", juegoId);
      const juegoSnap = await getDoc(juegoRef);

      if (juegoSnap.exists()) {
        const casilla = juegoSnap.data().casillas[casillaId];
        if (casilla?.configuracion) {
          setModelosSeleccionados(casilla.configuracion.modelos || []);
          setSonidoSeleccionado(casilla.configuracion.sonido || null);
        }
      }
    } catch (error) {
      console.error("❌ Error al cargar configuración:", error);
    }
  };

  // 🔹 Sincronizar modelos con Firestore
  const sincronizarModelos = async () => {
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
          },
        };

        await updateDoc(juegoRef, { casillas: casillasActuales });
        console.log("✅ Firestore sincronizado correctamente.");
      }
    } catch (error) {
      console.error("❌ Error al sincronizar en Firestore:", error);
    }
  };

  // 🔹 Eliminar modelo seleccionado
  const eliminarModelo = async (urlModelo) => {
    setModelosSeleccionados((prevModelos) =>
      prevModelos.filter((modelo) => modelo.url !== urlModelo)
    );
    await sincronizarModelos();
  };

  return (
    <div className="modelo-sonido-container">
      <h2>Configurar Modelo-Sonido</h2>

      {/* Modelos seleccionados */}
      <div className="modelos-seleccionados">
        {modelosSeleccionados.length > 0 ? (
          modelosSeleccionados.map((modelo, index) => (
            <div key={index} className="modelo-item">
              <iframe
                title={modelo.nombre}
                src={modelo.url}
                width="200"
                height="200"
              ></iframe>
              <p>{modelo.nombre}</p>
              <button onClick={() => eliminarModelo(modelo.url)}>❌ Eliminar</button>
            </div>
          ))
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
              sessionStorage.setItem("paginaAnterior", window.location.pathname); // 🔥 Guarda la plantilla antes de salir
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
