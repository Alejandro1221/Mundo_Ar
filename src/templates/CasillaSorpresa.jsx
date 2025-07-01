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
      if (juegoSnap.exists()) {
        const casilla = juegoSnap.data().casillas?.[casillaId];
        const textoGuardado = casilla?.configuracion?.textos?.[0] || "";
        setTexto(textoGuardado);
      }
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

    const juegoRef = doc(db, "juegos", juegoId);
    const juegoSnap = await getDoc(juegoRef);

    if (juegoSnap.exists()) {
      const casillasActuales = juegoSnap.data().casillas || Array(30).fill({ configuracion: null });
      casillasActuales[casillaId] = {
        plantilla: "casilla-sorpresa",
        configuracion: { textos: [textoLimpio] },
      };

      await updateDoc(juegoRef, { casillas: casillasActuales });
      mostrarMensaje("✅ Texto guardado correctamente.", "success");
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

        {mensaje.texto && <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}

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
          <button onClick={guardarConfiguracion}>💾 Guardar</button>
          <button onClick={() => navigate(`/docente/configurar-casillas/${juegoId}`)}>⬅️ Volver</button>
        </div>
      </div>
    </div>
  );
};

export default CasillaSorpresa;
