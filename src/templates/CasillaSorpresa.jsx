import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import "../assets/styles/docente/CasillaSorpresa.css";
import Breadcrumbs from "../components/Breadcrumbs";

const CasillaSorpresa = () => {
  const navigate = useNavigate();
  const [juegoId] = useState(sessionStorage.getItem("juegoId"));
  const [casillaId] = useState(sessionStorage.getItem("casillaId"));
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [texto, setTexto] = useState("");
  const palabras = texto.trim() ? texto.trim().split(/\s+/).length : 0;
  const restante = 10 - palabras;

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

    const idx = parseInt(casillaId, 10);
    if (Number.isNaN(idx)) { mostrarMensaje("ID de casilla inválido", "error"); return; }
    const casillas = Array.isArray(juegoSnap.data().casillas)
      ? juegoSnap.data().casillas
      : [];

    const casilla = casillas[idx] ?? null;

    const cfg = casilla?.configuracion || {};
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
      const origen = Array.isArray(juegoSnap.data().casillas)
   ? juegoSnap.data().casillas
        : [];
      const casillasActuales = [...origen];
      while (casillasActuales.length <= idx) casillasActuales.push(null);

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
        <Breadcrumbs />
        <h2>Casilla Sorpresa</h2>
        <p className="leyenda-casilla">
          En esta plantilla puedes configurar un texto sorpresa que los estudiantes verán al caer en la casilla. Escribe un mensaje breve y motivador para personalizar la experiencia de juego.
        </p>

        {mensaje.texto && (
          <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>
        )}

        <div className="modelo-item">
          <label htmlFor="texto-sorpresa">Texto:</label>
          <textarea
            id="texto-sorpresa"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe aquí el texto sorpresa (máximo 50 palabras)"
          />
          <div className="ayuda-texto" aria-live="polite">
            {restante} palabra{restante === 1 ? "" : "s"} restantes
          </div>
          {texto.trim().length > 0 && (
            <button
              type="button"
              className="btn btn--warning"
              onClick={() => setTexto("")}
              aria-label="Limpiar texto"
            >
              Limpiar texto
            </button>
          )}
        </div>

        <div className="acciones-plantilla">
          <button
            className="btn btn--secondary"
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
            Vista previa como estudiante
          </button>

          <button className="btn btn--primary" onClick={guardarConfiguracion}>
            Guardar configuración
          </button>
        </div>
      </div>
  );
};

export default CasillaSorpresa;
