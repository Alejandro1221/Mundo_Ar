import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { uploadFile } from "../services/storageService";
import "../assets/styles/docente/RompecabezasModelo.css";

const RompecabezasModelo = () => {
  const navigate = useNavigate();
  const [juegoId] = useState(sessionStorage.getItem("juegoId"));
  const [casillaId] = useState(sessionStorage.getItem("casillaId"));
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [guardando, setGuardando] = useState(false);


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
      navigate("/docente/configurar-casillas");
    }
  }, [juegoId, casillaId, navigate]);

  const mostrarMensaje = (texto, tipo = "info") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  };

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
          celebracion
        }
      };
  
      await updateDoc(juegoRef, { casillas: casillasActuales });
  
      mostrarMensaje("✅ Plantilla guardada correctamente.", "exito");
    } catch (error) {
      console.error("❌ Error al guardar configuración:", error);
      mostrarMensaje("❌ Error al guardar la plantilla.", "error");
    }finally {
      setGuardando(false);
    }
  };
  

  return (
    <div className="docente-modelo-container">
      {mensaje.texto && (
        <div className={`mensaje ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="docente-modelos-seleccionados">
        <div className="docente-modelo-item">
          <p className="nombre-modelo">📷 Imagen del rompecabezas</p>

          <input type="file" accept="image/*" onChange={handleFileChange} />
          {previewUrl && (
  <>
    {/*Imagen completa */}
    <div className="imagen-completa-preview">
      <p className="nombre-modelo">🖼 Vista completa</p>
      <img src={previewUrl} alt="Imagen completa" className="imagen-preview-completa" />
      <button className="btn-rojo" onClick={() => {
        setImagen(null);
        setPreviewUrl(null);
        mostrarMensaje("🗑 Imagen eliminada.", "info");
      }}>
        🗑 Eliminar Imagen
      </button>
    </div>

    {/*Vista en cubos */}
    <div className="preview-cubos-3d">
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const row = Math.floor(i / 2);
              const col = i % 2;
              const position = `${col * 50}% ${row * 33.33}%`;
              return (
                <div className="cubo-3d" key={i}>
                  <div className="cara cara-front" style={{ backgroundImage: `url(${previewUrl})`, backgroundPosition: position }} />
                  <div className="cara cara-back" style={{ backgroundImage: `url(${previewUrl})`, backgroundPosition: position }} />
                  <div className="cara cara-right" style={{ backgroundImage: `url(${previewUrl})`, backgroundPosition: position }} />
                  <div className="cara cara-left" style={{ backgroundImage: `url(${previewUrl})`, backgroundPosition: position }} />
                  <div className="cara cara-top" style={{ backgroundImage: `url(${previewUrl})`, backgroundPosition: position }} />
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
                opciones: { gifUrl: e.target.value }
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
                opciones: { mensaje: e.target.value }
              })
            }
          />
        )}
      </section>

      <button
        className="vista-previa-btn"
        onClick={() => {
          sessionStorage.setItem("modoVistaPrevia", "true");
          sessionStorage.setItem("paginaAnterior", window.location.pathname);
          sessionStorage.setItem("imagenRompecabezas", previewUrl);
          sessionStorage.setItem("celebracionSeleccionada", JSON.stringify(celebracion));
          navigate("/estudiante/vista-previa-rompecabezas");
        }}
      >
        Vista previa como estudiante
      </button>

      <div className="acciones-finales">
        <button className="guardar-btn" onClick={guardarConfiguracion} disabled={guardando}>
          {guardando ? "💾 Guardando..." : "💾 Guardar Configuración"}
        </button>

        <button
          className="volver-btn"
          onClick={() => navigate(`/docente/configurar-casillas/${juegoId}`)}
        >
          ⬅️ Volver
        </button>
      </div>
    </div>
  );
};

export default RompecabezasModelo;
