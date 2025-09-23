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

    if (!juegoId || casillaId == null) {
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

  useEffect(() => {
    const textEl = document.getElementById("troikaText");
    const bgEl   = document.getElementById("bgPanel");
    if (!textEl || !bgEl) return;

    const updateBG = () => {
      const mesh = textEl.getObject3D("mesh");
      if (!mesh || !mesh.geometry) return;
      if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();

      const bb = mesh.geometry.boundingBox;
      const w  = bb.max.x - bb.min.x;
      const h  = bb.max.y - bb.min.y;

      // padding basado en el font-size (m)
      const fs = parseFloat(textEl.getAttribute("font-size") || "0.16");
      const PAD_X = fs * 2.0;  // margen lateral
      const PAD_Y = fs * 1.4;  // margen arriba/abajo

      bgEl.setAttribute("width",  (w + PAD_X).toFixed(3));
      bgEl.setAttribute("height", (h + PAD_Y).toFixed(3));
      bgEl.setAttribute("position", "0 0 0");
    };

    textEl.addEventListener("textlayoutcomplete", updateBG);
    const t = setTimeout(updateBG, 0); 

    return () => {
      clearTimeout(t);
      textEl.removeEventListener("textlayoutcomplete", updateBG);
    };
  }, [texto]);

  return (
    <div className="actividad-ra-container">
      <HeaderActividad titulo="Casilla Sorpresa (AR)" />

      {/* Escena AR */}
      <a-scene
        arjs="sourceType: webcam; facingMode: environment; debugUIEnabled: false;"
        vr-mode-ui="enabled: false"
        renderer="antialias: true; alpha: true; logarithmicDepthBuffer: true"
        background="transparent: true"
      >
        <a-entity position="0 0 -2">
          <a-plane
            id="bgPanel"
            width="1" height="0.5"
            position="0 0 0"
            material="color: #ffffff; opacity: 0.85; shader: flat"
            side="double"
          ></a-plane>
                    
          <a-troika-text
            value={(texto || "—").replace(/\r?\n/g, "\n")}
            color="#111111"
            font="/fonts/NotoSans-Regular.ttf" 
            font-size="0.1"                   
            depth="0.5"
            max-width="0.8"   
            line-height="1.15"
            letter-spacing="0.01"
            overflow-wrap="break-word"
            text-align="center"
            anchor="center"
            position="0 0 0.01"
            outline-width="0.012"
            outline-color="#ffffff"
            outline-blur="0.004"
          ></a-troika-text>
        </a-entity>

        <a-entity camera="fov: 95" position="0 0 0"></a-entity>
      </a-scene>

      <div
        style={{
          padding: 12,
          textAlign: "center",
          fontSize: 14,
          opacity: 0.8,
        }}
      >
      </div>
    </div>
  );
};

export default ActividadCasillaSorpresa;
