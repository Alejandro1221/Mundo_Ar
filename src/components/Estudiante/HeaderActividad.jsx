import React from "react";
import "./HeaderActividad.css";
import { stopARNow } from "../../hooks/arCleanup";
import { fixViewportOnce } from "../../utils/fixViewportOnce"; // 👈 nuevo
import { useNavigate } from "react-router-dom";

const HeaderActividad = ({ titulo }) => {
  const navigate = useNavigate();

  const volver = () => {
    // 1) Limpieza completa de AR y estilos pegados por A-Frame/AR.js
    try { stopARNow(); } catch {}
    try { fixViewportOnce(); } catch {}     // 👈 IMPORTANTÍSIMO

    // 2) Resolver destino
    const modoVistaPrevia = sessionStorage.getItem("modoVistaPrevia");
    const paginaAnterior  = sessionStorage.getItem("paginaAnterior");
    const juegoId   = sessionStorage.getItem("juegoId");
    const casillaId = sessionStorage.getItem("casillaId");

    // 3) Borrar flags efímeros
    sessionStorage.removeItem("modoVistaPrevia");
    sessionStorage.removeItem("paginaAnterior");

    // 4) Volver reemplazando historial (evita “dos/tres clics atrás”)
    if (modoVistaPrevia && paginaAnterior) {
      navigate(paginaAnterior, { replace: true });
      return;
    }

    // 5) Fallbacks docentes/estudiante
    if (juegoId) {
      navigate(`/docente/configurar-casillas/${juegoId}`, { replace: true });
      return;
    }

    navigate("/estudiante/seleccionar-casilla", { replace: true });
  };

  return (
    <div className="barra-superior">
      <button className="btn-volver" onClick={volver}>⬅</button>
      <h2 className="titulo-actividad">{titulo}</h2>
      <div className="espaciador-derecho"></div>
    </div>
  );
};

export default HeaderActividad;
