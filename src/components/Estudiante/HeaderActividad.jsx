import React from "react";
import "./HeaderActividad.css";
import { stopARNow } from "../../hooks/arCleanup";
import { useNavigate } from "react-router-dom";

const HeaderActividad = ({ titulo }) => {
  const navigate = useNavigate();

  const volver = () => {
    const modoVistaPrevia = sessionStorage.getItem("modoVistaPrevia");
    const paginaAnterior = sessionStorage.getItem("paginaAnterior");

    // 1. LIMPIAR AR PRIMERO
    stopARNow();

    if (modoVistaPrevia && paginaAnterior) {
      sessionStorage.removeItem("modoVistaPrevia");
      sessionStorage.removeItem("paginaAnterior");

      // 2. VOLVER SIN RECARGAR
      navigate(paginaAnterior, { replace: true });
    } else {
      navigate("/estudiante/seleccionar-casilla", { replace: true });
    }
  };
  return (
    <div className="barra-superior">
      <button className="btn-volver" onClick={volver}>
        ⬅
      </button>
      <h2 className="titulo-actividad">{titulo}</h2>
      <div className="espaciador-derecho"></div>
    </div>
  );
};

export default HeaderActividad;