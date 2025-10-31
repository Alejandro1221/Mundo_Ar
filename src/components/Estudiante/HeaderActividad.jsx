import React from "react";
import "./HeaderActividad.css";
import { stopARNow } from "../../hooks/arCleanup";

const HeaderActividad = ({ titulo }) => {
 const volver = () => {
  try { stopARNow(); } catch {}

  const rol = sessionStorage.getItem("rolActivo") || "estudiante";
  const modoVistaPrevia = sessionStorage.getItem("modoVistaPrevia");
  const paginaAnterior  = sessionStorage.getItem("paginaAnterior");
  const juegoId   = sessionStorage.getItem("juegoId");

  const hardGo = (path) => setTimeout(() => window.location.replace(path), 80);

  if (modoVistaPrevia && paginaAnterior) {
    sessionStorage.removeItem("modoVistaPrevia");
    sessionStorage.removeItem("paginaAnterior");
    hardGo(paginaAnterior);
    return;
  }

  if (rol === "docente") {
    hardGo(juegoId ? `/docente/configurar-casillas/${juegoId}` : `/docente/dashboard`);
    return;
  }

  if (rol === "estudiante") {
    hardGo("/estudiante/seleccionar-casilla");
    return;
  }

  // fallback final
  hardGo("/");
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
