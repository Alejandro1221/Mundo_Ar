import React from "react";
import "./HeaderActividad.css";

const HeaderActividad = ({ titulo }) => {

  const volver = () => {
    const modoVistaPrevia = sessionStorage.getItem("modoVistaPrevia");
    const paginaAnterior = sessionStorage.getItem("paginaAnterior");

    if (modoVistaPrevia && paginaAnterior) {
      sessionStorage.removeItem("modoVistaPrevia");
      sessionStorage.removeItem("paginaAnterior");

      window.location.href = paginaAnterior;
    } else {
      window.location.href = "/estudiante/seleccionar-casilla";
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
