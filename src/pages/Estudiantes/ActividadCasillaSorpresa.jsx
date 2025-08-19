// src/pages/Estudiantes/ActividadCasillaSorpresa.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import "../../assets/styles/estudiante/ActividadCasillaSorpresa.css";
import HeaderActividad from "../../components/Estudiante/HeaderActividad";

const ActividadCasillaSorpresa = ({ vistaPrevia = false }) => {
  const navigate = useNavigate();
  const [juegoId] = useState(sessionStorage.getItem("juegoId"));
  const [casillaId] = useState(sessionStorage.getItem("casillaId"));
  const [texto, setTexto] = useState("");

  useEffect(() => {
    if (vistaPrevia) {
      // Recuperar de sessionStorage
      const textoPrevio = sessionStorage.getItem("casillaSorpresaTexto");
      if (textoPrevio) {
        setTexto(JSON.parse(textoPrevio));
      }
    } else {
      cargarTexto();
    }
  }, [vistaPrevia, juegoId, casillaId]);

  const cargarTexto = async () => {
    try {
      const juegoRef = doc(db, "juegos", juegoId);
      const juegoSnap = await getDoc(juegoRef);

      if (juegoSnap.exists()) {
        const casilla = juegoSnap.data().casillas?.[casillaId];
        const textoGuardado = casilla?.configuracion?.textos?.[0] || "";
        setTexto(textoGuardado);
      }
    } catch (error) {
      console.error("❌ Error cargando Casilla Sorpresa:", error);
    }
  };

  return (
    <div className="actividad-sorpresa-container">
      {/* 👇 Header con botón de volver */}
      <HeaderActividad titulo="Casilla Sorpresa" />

      <div className="actividad-sorpresa-card">
        <h2>🎁 ¡Sorpresa!</h2>
        <p>{texto || "No hay texto configurado para esta casilla."}</p>
      </div>

      {/* Banner de vista previa solo si viene desde docente */}
      {vistaPrevia && (
        <div className="vista-previa-banner">
        </div>
      )}
    </div>
  );
};

export default ActividadCasillaSorpresa;
