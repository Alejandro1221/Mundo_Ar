import React from "react";
import "./HeaderActividad.css"; 
const HeaderActividad = ({ titulo }) => {
  return (
    <div className="barra-superior">
      <button
        className="btn-volver"
        onClick={() => (window.location.href = "/estudiante/seleccionar-casilla")}
      >
        ⬅
      </button>
      <h2 className="titulo-actividad">{titulo}</h2>
      <div className="espaciador-derecho"></div>
    </div>
  );
};

export default HeaderActividad;
