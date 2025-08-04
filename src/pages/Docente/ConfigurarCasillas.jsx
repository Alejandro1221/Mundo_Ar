import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCasillas } from "../../hooks/useCasillas";
import { FiArrowLeft } from "react-icons/fi";
import "../../assets/styles/docente/configurarCasillas.css";

const ConfigurarCasillas = () => {
  const { juegoId } = useParams(); 
  const navigate = useNavigate();

  const {
    casillas,
    cargarCasillas,
    abrirModal,
    guardarCambios,
    modalVisible,
    setModalVisible,
    plantillaSeleccionada,
    setPlantillaSeleccionada,
    casillaSeleccionada,
    eliminarPlantilla
  } = useCasillas(juegoId);

  const rutasPlantillas = {
    "modelo-sonido": "/docente/plantilla-sonido-modelo",
    "clasificacion-modelos": "/docente/clasificacion-modelos",
    "rompecabezas-modelo": "/docente/rompecabezas-modelo",
    "modelo-texto": "/docente/modelo-texto",
    "casilla-sorpresa": "/docente/casilla-sorpresa"
  };

  useEffect(() => {
    if (!juegoId) return navigate("/docente/dashboard");
    cargarCasillas();
  }, [juegoId, cargarCasillas, navigate]);

  return (
    <div className="configurar-casillas-container">
      <div className="encabezado-horizontal">
        <button
          className="configurar-casillas-container__btn-volver"
          onClick={() => navigate("/docente/dashboard")}
          aria-label="Volver al dashboard"
        >
          <FiArrowLeft />
        </button>

        <h2 className="configurar-casillas-container__titulo">
          Configurar Casillas del Juego
        </h2>
      </div>
      {/* Tablero de casillas */}
      <div className="configurar-casillas-container__tablero">
        {casillas.map((casilla, index) => (
          <div
            key={index}
            //className={`configurar-casillas-container__casilla ${casilla.plantilla ? "configurada" : ""}`}
            className={`configurar-casillas-container__casilla ${casilla.plantilla ? `configurada plantilla-${casilla.plantilla}` : ""}`}
            onClick={() => abrirModal(index, casilla.plantilla)}
          >
            <span>{index + 1}</span>
            {casilla.plantilla && (
              <span className="configurar-casillas-container__plantilla">{casilla.plantilla}</span>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalVisible && (
        <div className="configurar-casillas-container__modal">
          <div className="configurar-casillas-container__modal-content">
            {casillas[casillaSeleccionada]?.plantilla ? (
              <>
                <h3>Plantilla asignada:</h3>
                <p><strong>{casillas[casillaSeleccionada]?.plantilla}</strong></p>
                <div className="configurar-casillas-container__modal-buttons">
                  <button
                  className="editar-btn"
                    onClick={() => {
                      setModalVisible(false);
                      const plantilla = casillas[casillaSeleccionada]?.plantilla;
                      const ruta = rutasPlantillas[plantilla];
                      if (ruta) {
                        sessionStorage.setItem("paginaAnterior", window.location.pathname);
                        sessionStorage.setItem("juegoId", juegoId);
                        sessionStorage.setItem("casillaId", casillaSeleccionada);
                        navigate(ruta);
                      }
                    }}
                  >
                    ✏️ Editar Plantilla
                  </button>

                  <button
                  className="eliminar-btn"
                    onClick={async () => {
                      const confirmar = window.confirm("¿Eliminar esta plantilla?");
                      if (!confirmar) return;

                      await eliminarPlantilla(juegoId, casillaSeleccionada);
                      setModalVisible(false);
                      cargarCasillas();
                    }}
                  >
                    🗑️ Eliminar Plantilla
                  </button>

                  <button className="cancelar-btn" onClick={() => setModalVisible(false)}>Cancelar</button>
                </div>
              </>
            ) : (
              <>
                <h3>Seleccionar Plantilla</h3>
                <select
                  value={plantillaSeleccionada}
                  onChange={(e) => setPlantillaSeleccionada(e.target.value)}
                >
                  <option value="">Seleccione una plantilla</option>
                  <option value="modelo-sonido">Modelo-Sonido</option>
                  <option value="clasificacion-modelos">Clasificar Modelos</option>
                  <option value="rompecabezas-modelo">Rompecabezas Modelo</option>
                  <option value="modelo-texto">Modelo texto</option>
                  <option value="casilla-sorpresa">Casilla Sorpresa</option>
                </select>
                <div className="configurar-casillas-container__modal-buttons">
                  <button className="cancelar-btn"  onClick={() => setModalVisible(false)}>Cancelar</button>
                  <button className="guardar-btn" onClick={() => {
                    sessionStorage.removeItem("modelosSeleccionados");
                    sessionStorage.removeItem("sonidoSeleccionado");
                    sessionStorage.removeItem("modeloAsociadoParaSonido");
                    sessionStorage.removeItem(`modelosSeleccionados_${juegoId}_${casillaSeleccionada}`);
                    sessionStorage.removeItem("gruposSeleccionados");
                    sessionStorage.removeItem("asignacionesModelos");
                    sessionStorage.removeItem("celebracionSeleccionada");
                    guardarCambios();
                  }}>
                    Guardar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurarCasillas;
