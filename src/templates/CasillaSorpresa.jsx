import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import "../assets/styles/docente/CasillaSorpresa.css";

const CasillaSorpresa = () => {
  const navigate = useNavigate();
  const [juegoId] = useState(sessionStorage.getItem("juegoId"));
  const [casillaId] = useState(sessionStorage.getItem("casillaId"));
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [texto, setTexto] = useState("");

  useEffect(() => {
    if (!juegoId || !casillaId) {
      alert("Error: No se encontró el juego o la casilla.");
      navigate("/docente/dashboard");
    } else {
      cargarConfiguracion();
    }
  }, [juegoId, casillaId]);

const cargarConfiguracion = async () => {
  try {
    const juegoRef = doc(db, "juegos", juegoId);
    const juegoSnap = await getDoc(juegoRef);
    if (!juegoSnap.exists()) return;

    const idx = Number(casillaId); // usar índice numérico
    const casillas = juegoSnap.data().casillas || [];
    const casilla = Array.isArray(casillas) ? casillas[idx] : casillas?.[idx];

    const cfg = casilla?.configuracion || {};
    // Acepta ambos formatos: textos (array) o texto (string)
    const textos = Array.isArray(cfg.textos)
      ? cfg.textos
      : (cfg.texto ? [cfg.texto] : []);

    setTexto(textos[0] || "");
  } catch (error) {
    console.error("❌ Error al cargar la configuración:", error);
  }
};

  const guardarConfiguracion = async () => {
    const textoLimpio = texto.trim();
    const palabras = textoLimpio.split(/\s+/);

    if (!textoLimpio) {
      mostrarMensaje("⚠️ Debes escribir un texto.", "error");
      return;
    }
    if (palabras.length > 50) {
      mostrarMensaje("⚠️ El texto no debe exceder las 50 palabras.", "error");
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
      const origen = juegoSnap.data().casillas;
      const casillasActuales = Array.isArray(origen) ? [...origen] : [];

      if (casillasActuales.length <= idx) {
        casillasActuales.length = idx + 1;                 
      }

      casillasActuales[idx] = {
        plantilla: "casilla-sorpresa",
        configuracion: { textos: [textoLimpio] },
      };

      await updateDoc(juegoRef, { casillas: casillasActuales });
      mostrarMensaje("✅ Texto guardado correctamente.", "success");
    } catch (error) {
      console.error("❌ Error al guardar la configuración:", error);
      mostrarMensaje("❌ Error al guardar.", "error");
    }
  };

  const mostrarMensaje = (texto, tipo = "info") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  };

  return (
    <div className="modelo-texto-container">
      <div className="contenido-scrollable">
        <h2>Plantilla: Casilla Sorpresa</h2>

        {mensaje.texto && (
          <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>
        )}

        <div className="modelo-item">
          <label>Texto:</label>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe aquí el texto sorpresa (máximo 50 palabras)"
          />
          {texto.trim().length > 0 && (
            <button
              type="button"
              className="limpiar-btn"
              onClick={() => setTexto("")}
            >
              🧹 Limpiar texto
            </button>
          )}
        </div>

        <div className="acciones-plantilla">
          <button
            className="vista-previa-btn"
            onClick={() => {
              sessionStorage.setItem(
                "casillaSorpresaTexto",
                JSON.stringify(texto)
              );
              sessionStorage.setItem("modoVistaPrevia", "true");
              sessionStorage.setItem("paginaAnterior", window.location.pathname);
              navigate("/estudiante/vista-previa-casilla-sorpresa");
            }}
          >
            Vista previa
          </button>

          <button onClick={guardarConfiguracion}>💾 Guardar</button>
          <button
            onClick={() => navigate(`/docente/configurar-casillas/${juegoId}`)}
          >
            ⬅️ Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default CasillaSorpresa;
