import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import HeaderActividad from "../../components/Estudiante/HeaderActividad";
import "../../assets/styles/estudiante/ActividadCasillaSorpresa.css";

const ActividadCasillaSorpresa = ({ vistaPrevia = false }) => {
  const navigate = useNavigate();
  const [texto, setTexto] = useState("");

  useEffect(() => {
    const juegoId = sessionStorage.getItem("juegoId");
    const casillaId = sessionStorage.getItem("casillaId");

    if (vistaPrevia || sessionStorage.getItem("modoVistaPrevia") === "true") {
      const t = sessionStorage.getItem("casillaSorpresaTexto");
      setTexto(t ? JSON.parse(t) : "");
      return;
    }

    // Modo normal (jugando): leer de Firestore
    if (!juegoId || casillaId == null) {
      // si no hay contexto, regresa a dashboard o donde corresponda
      navigate("/estudiante/dashboard");
      return;
    }

    const cargar = async () => {
      try {
        const snap = await getDoc(doc(db, "juegos", juegoId));
        if (!snap.exists()) return;
        const data = snap.data();
        const idx = Number(casillaId);
        const casilla = data?.casillas?.[idx];
        const t = casilla?.configuracion?.textos?.[0] || "";
        setTexto(t);
      } catch (err) {
        console.error("❌ Error cargando Casilla Sorpresa:", err);
      }
    };

    cargar();
  }, [vistaPrevia, navigate]);

return (
  <div className="actividad-ra-container">
    <HeaderActividad titulo="Casilla Sorpresa (AR)" />

    {/* Escena AR */}
    <a-scene
      arjs="sourceType: webcam; facingMode: environment; debugUIEnabled: false;"
      vr-mode-ui="enabled: false"
      embedded
      renderer="antialias: true; alpha: true; logarithmicDepthBuffer: true"
      background="transparent: true"
      style={{ width: "100%", height: "70vh" }}
    >
     
      <a-entity position="0 0 -2">
 
        <a-text
          value={(texto || "—").replace(/\r?\n/g, "\n")}
          align="center"
          color="#111111"
          width="2.8"           
          position="0 0 0.1"    
          side="double"         
          font="https://cdn.aframe.io/fonts/Exo2Bold.fnt"
          anchor="center"
          baseline="center"
          letter-spacing="0.05"
          line-height="60"
          wrap-count="30"

        ></a-text>
      </a-entity>

      <a-entity camera="fov: 95" position="0 0 0"></a-entity>
    </a-scene>

    <div style={{ padding: 12, textAlign: "center", fontSize: 14, opacity: 0.8 }}>
      Si no ves la cámara, revisa permisos y que estés en HTTPS/localhost.
    </div>
  </div>
);
};

export default ActividadCasillaSorpresa;
