import "./HeaderActividad.css";

const HeaderActividad = ({ titulo, onBack }) => {
  const volver = () => {
    if (onBack) {
      onBack();
      return;
    }

    const modoVistaPrevia = sessionStorage.getItem("modoVistaPrevia");
    const paginaAnterior = sessionStorage.getItem("paginaAnterior");

    if (modoVistaPrevia && paginaAnterior) {
      // Limpia datos temporales
      sessionStorage.removeItem("modoVistaPrevia");
      sessionStorage.removeItem("paginaAnterior");

      window.location.href = paginaAnterior;
      return;
    }

    window.location.href = "/estudiante/seleccionar-casilla";
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
