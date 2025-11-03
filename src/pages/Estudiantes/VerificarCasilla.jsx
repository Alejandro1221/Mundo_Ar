import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAR } from "../../hooks/useAR";
import { stopARNow } from "../../hooks/arCleanup";
import "../../assets/styles/estudiante/verificarCasilla.css";

const VerificarCasilla = () => {
  useAR(); 
  const navigate = useNavigate();
  const casillaId = parseInt(sessionStorage.getItem("casillaId"), 10);
  const juegoId = sessionStorage.getItem("juegoId");

  useEffect(() => {
    if (!juegoId || isNaN(casillaId)) {
      alert("❌ Información incompleta.");
      navigate("/estudiante/dashboard");
      return;
    }

    let cancelled = false;
    let markerEl = null;

    const onFound = () => {
      if (cancelled) return;
      navigate("/estudiante/desde-marcador");
    };

    const tryAttach = () => {
      markerEl = document.querySelector("#marker-arjs");
      if (markerEl) {
        markerEl.addEventListener("markerFound", onFound);
        return true;
      }
      return false;
    };

    // 1) intenta ahora
    if (!tryAttach()) {
      // 2) si aún no existe, espera a que cargue la escena y reintenta
      const scene = document.querySelector("a-scene");
      const onSceneLoaded = () => { tryAttach(); };

      scene?.addEventListener?.("loaded", onSceneLoaded);

      // 3) y además haz un pequeño polling por si el 'loaded' no te llega
      const id = setInterval(() => {
        if (tryAttach()) clearInterval(id);
      }, 150);

      // cleanup
      return () => {
        cancelled = true;
        clearInterval(id);
        scene?.removeEventListener?.("loaded", onSceneLoaded);
        markerEl?.removeEventListener?.("markerFound", onFound);
      };
    }

    // cleanup si enganchó a la primera
    return () => {
      cancelled = true;
      markerEl?.removeEventListener?.("markerFound", onFound);
    };
  }, [navigate, casillaId, juegoId]);
  return (
    <>
      <button
        className="btn-volver-casilla"
        onClick={() => {
          try { stopARNow(); } catch {}
          window.location.replace("/estudiante/seleccionar-casilla");
        }}
      >
        ⬅️ Volver al tablero
      </button>

      <div className="indicador-enfoque">📷 Enfoca el marcador para continuar...</div>

      <a-scene
        arjs="sourceType: webcam; facingMode: environment; debugUIEnabled: false;"
        vr-mode-ui="enabled: false"
        renderer="antialias: true; alpha: true; logarithmicDepthBuffer: true"
        background="transparent: true"
      >
        <a-marker
          type="pattern"
          url={`/marcadores/pattern-${casillaId + 1}.patt`}
          id="marker-arjs"
        >
          <a-box color="blue" position="0 0.5 0"></a-box>
        </a-marker>
        <a-entity camera="fov: 80" position="0 0 0"></a-entity>
      </a-scene>
    </>
  );
};

export default VerificarCasilla;

