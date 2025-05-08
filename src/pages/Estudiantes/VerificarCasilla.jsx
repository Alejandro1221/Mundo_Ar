import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/estudiante/verificarCasilla.css";

const VerificarCasilla = () => {
  const navigate = useNavigate();
  const casillaId = parseInt(sessionStorage.getItem("casillaId"));
  const juegoId = sessionStorage.getItem("juegoId");

  useEffect(() => {
    if (!juegoId || isNaN(casillaId)) {
      alert("❌ Información incompleta.");
      navigate("/estudiante/dashboard");
      return;
    }

    const marker = document.querySelector("#marker-arjs");
    let redirigido = false;

    if (!marker) return;

    marker.addEventListener("markerFound", () => {
      if (redirigido) return;
      redirigido = true;
      navigate("/estudiante/desde-marcador");
    });
  }, [navigate, casillaId, juegoId]);

  return (
    <>
    <button
        className="btn-volver-casilla"
        onClick={() => navigate("/estudiante/seleccionar-casilla")}
      >
        ⬅️ Volver al tablero
      </button>

      <div className="indicador-enfoque">
        📷 Enfoca el marcador para continuar...
      </div>


      <a-scene
        embedded
        arjs="sourceType: webcam; debugUIEnabled: false"
        vr-mode-ui="enabled: false"
      >
        <a-marker
          type="pattern"
          url={`/marcadores/pattern${casillaId + 1}.patt`}
          id="marker-arjs"
        >
          <a-box color="blue" position="0 0.5 0"></a-box>
        </a-marker>
        <a-entity camera></a-entity>
      </a-scene>
    </>
  );
};

export default VerificarCasilla;
