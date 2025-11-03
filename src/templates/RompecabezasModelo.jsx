import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { uploadFile } from "../services/storageService";
import "../assets/styles/docente/RompecabezasModelo.css";
import Breadcrumbs from "../components/Breadcrumbs";

const RompecabezasModelo = () => {
  const navigate = useNavigate();
  const [juegoId] = useState(sessionStorage.getItem("juegoId"));
  const [casillaId] = useState(sessionStorage.getItem("casillaId"));
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [guardando, setGuardando] = useState(false);
  const [grid, setGrid] = useState({ cols: 2, rows: 3 }); 


  const [imagen, setImagen] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [celebracion, setCelebracion] = useState({
    tipo: "confeti",
    opciones: {}
  });

  useEffect(() => {
    const cargarConfiguracion = async () => {
      try {
        const juegoRef = doc(db, "juegos", juegoId);
        const juegoSnap = await getDoc(juegoRef);
  
        if (juegoSnap.exists()) {
          const casilla = juegoSnap.data().casillas?.[casillaId];
          if (casilla?.configuracion) {
            if (casilla.configuracion.imagen) {
              setPreviewUrl(casilla.configuracion.imagen);
            }
            if (casilla.configuracion.celebracion) {
              setCelebracion(casilla.configuracion.celebracion);
            }
            if (casilla.configuracion.grid) {
              setGrid(casilla.configuracion.grid);
            }
          }
        }
      } catch (error) {
        console.error("❌ Error al cargar configuración existente:", error);
      }
    };
  
    if (juegoId && casillaId) {
      cargarConfiguracion();
    }
  }, [juegoId, casillaId]);
  

  useEffect(() => {
    if (!juegoId || !casillaId) {
      alert("Error: No se encontró el juego o la casilla.");
      navigate(`/docente/configurar-casillas/${juegoId || ""}`, { replace: true });
    }
  }, [juegoId, casillaId, navigate]);

  const mostrarMensaje = (texto, tipo = "info") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  };

  useEffect(() => {
    if (!previewUrl) return;
    const img = new Image();
    img.onload = () => {
      const isLandscape = img.naturalWidth >= img.naturalHeight; 
      setGrid(isLandscape ? { cols: 3, rows: 2 } : { cols: 2, rows: 3 });
    };
    img.src = previewUrl;
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  const guardarConfiguracion = async () => {
    if (!imagen && !previewUrl) {
      mostrarMensaje("❌ Debes subir una imagen.", "error");
      return;
    }
    setGuardando(true);
  
    try {
      let urlImagen = previewUrl;
  
      if (imagen) {
        const nombreArchivo = `rompecabezas_${juegoId}_${casillaId}_${Date.now()}`;
        urlImagen = await uploadFile(imagen, `rompecabezas/${nombreArchivo}`);
      }
  
      const juegoRef = doc(db, "juegos", juegoId);
      const juegoSnap = await getDoc(juegoRef);
      const casillasActuales = juegoSnap.data().casillas || Array(30).fill({ configuracion: null });
  
      casillasActuales[casillaId] = {
        plantilla: "rompecabezas-modelo",
        configuracion: {
          imagen: urlImagen,
          celebracion,
          grid 
        }
      };
  
      await updateDoc(juegoRef, { casillas: casillasActuales });
  
      mostrarMensaje("Plantilla guardada correctamente.", "success");
    } catch (error) {
      console.error("❌ Error al guardar configuración:", error);
      mostrarMensaje("❌ Error al guardar la plantilla.", "error");
    }finally {
      setGuardando(false);
    }
  };
  

return (
  <div className="docente-modelo-container">
    <Breadcrumbs/>
      
    {mensaje.texto && (
      <div className={`mensaje ${mensaje.tipo}`}>
        {mensaje.texto}
        </div>
      )}

      <h2>Arma el rompecabezas</h2>
        <p className="leyenda-rompecabezas">
          Sube una imagen para convertirla en rompecabezas. La vista previa te mostrará
          la imagen completa y cómo se verán las piezas. Luego selecciona la celebración
          y guarda la configuración.
        </p>

      <div className="docente-modelos-seleccionados">
        <div className="docente-modelo-item">
          <p className="nombre-modelo">Imagen del rompecabezas</p>

          <input
              type="file"
              id="imagenRompecabezas"
              accept="image/*"
              onChange={handleFileChange}
              className="input-archivo"
            />
            <label htmlFor="imagenRompecabezas" className="btn-archivo">
              📂 Seleccionar imagen
            </label>
            <span className="nombre-archivo">
              {imagen ? imagen.name : "Ningún archivo seleccionado"}
            </span>
  {previewUrl && (
  <>
    {/*Imagen completa */}
    <div className="imagen-completa-preview">
      <p className="nombre-modelo">vista completa</p>
      <img src={previewUrl} alt="Imagen completa" className="imagen-preview-completa" />
      <button className="btn btn--danger btn--sm" onClick={() => {
        setImagen(null);
        setPreviewUrl(null);
        mostrarMensaje("🗑 Imagen eliminada.", "info");
      }}>
        🗑 Eliminar Imagen
      </button>
    </div>

    {/*Vista en cubos */}
    <div
        className="preview-cubos-3d"
        style={{
          '--cols': String(grid.cols),
          '--rows': String(grid.rows),
          '--bgw': `${grid.cols * 100}%`,
          '--bgh': `${grid.rows * 100}%`,
        }}
      >
        {Array.from({ length: grid.cols * grid.rows }).map((_, i) => {
          const row = Math.floor(i / grid.cols);
          const col = i % grid.cols;

          const posX = grid.cols === 1 ? 0 : (col / (grid.cols - 1)) * 100;
          const posY = grid.rows === 1 ? 0 : (row / (grid.rows - 1)) * 100;
          const position = `${posX}% ${posY}%`;

          return (
            <div className="cubo-3d" key={i}>
              <div className="cara cara-front"  style={{ backgroundImage: `url(${previewUrl})`, backgroundPosition: position }} />
              <div className="cara cara-back"   style={{ backgroundImage: `url(${previewUrl})`, backgroundPosition: position }} />
              <div className="cara cara-right"  style={{ backgroundImage: `url(${previewUrl})`, backgroundPosition: position }} />
              <div className="cara cara-left"   style={{ backgroundImage: `url(${previewUrl})`, backgroundPosition: position }} />
              <div className="cara cara-top"    style={{ backgroundImage: `url(${previewUrl})`, backgroundPosition: position }} />
              <div className="cara cara-bottom" style={{ backgroundImage: `url(${previewUrl})`, backgroundPosition: position }} />
            </div>
          );
        })}
      </div>
        </>
      )}
       </div>
      </div>

      <section className="seccion-celebracion">
        <label htmlFor="tipoCelebracion">Tipo de Celebración:</label>
        <select
          id="tipoCelebracion"
          value={celebracion.tipo}
          onChange={(e) =>
            setCelebracion({ tipo: e.target.value, opciones: {} })
          }
        >
          <option value="confeti">🎉 Confeti (visual)</option>
          <option value="mensaje">✅ Mensaje de texto</option>
    
        </select>

        {celebracion.tipo === "mensaje" && (
            <textarea
              placeholder="Mensaje personalizado"
              rows={3}
              style={{ width: "100%", resize: "vertical" }}
              value={celebracion.opciones.mensaje || ""}
              onChange={(e) =>
                setCelebracion({
                  ...celebracion,
                  opciones: { mensaje: e.target.value }
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
            sessionStorage.setItem("paginaAnterior", window.location.pathname);
            sessionStorage.setItem("imagenRompecabezas", previewUrl);
            sessionStorage.setItem("celebracionSeleccionada", JSON.stringify(celebracion));
            sessionStorage.setItem("gridRompecabezas", JSON.stringify(grid));

            navigate("/estudiante/vista-previa-rompecabezas", {
              state: { from: window.location.pathname, juegoId, casillaId },
              replace: true,
            });
          }}
        >
          Vista previa como estudiante
        </button>

        <button
          className="btn btn--primary"
          onClick={guardarConfiguracion}
          disabled={guardando}
        >
          {guardando ? "Guardando..." : "Guardar configuración"}
        </button>
      </div>

    </div>
  );
};

export default RompecabezasModelo;
