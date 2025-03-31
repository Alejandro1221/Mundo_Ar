import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCasillas } from "../../hooks/useCasillas";
import "../../assets/styles/docente/configurarCasillas.css";

const ConfigurarCasillas = () => {
  const { juegoId } = useParams(); 
  const navigate = useNavigate();
  const { casillas, cargarCasillas, abrirModal, guardarCambios, modalVisible, setModalVisible, plantillaSeleccionada, setPlantillaSeleccionada } = useCasillas(juegoId);

  useEffect(() => {
    if (!juegoId) return navigate("/docente/dashboard");
    cargarCasillas();
  }, [juegoId, cargarCasillas, navigate]);

  return (
    <div className="configurar-casillas-container">
      <h2>Configurar Casillas del Juego</h2>

      <div className="tablero">
        {casillas.map((casilla, index) => (
          <div 
            key={index} 
            className={`casilla ${casilla.plantilla ? "configurada" : ""}`} 
            onClick={() => abrirModal(index, casilla.plantilla)}
          >
            <span>{index + 1}</span>
            {casilla.plantilla && <span className="nombre-plantilla">{casilla.plantilla}</span>}
          </div>
        ))}
      </div>

      {modalVisible && (
        <div className="modal">
          <div className="modal-content">
            <h3>Seleccionar Plantilla</h3>
            <select value={plantillaSeleccionada} onChange={(e) => setPlantillaSeleccionada(e.target.value)}>
              <option value="">Seleccione una plantilla</option>
              <option value="modelo-sonido">Modelo-Sonido</option>
              <option value="clasificacion-modelos">Clasificar Modelos</option>
            </select>
            <div className="modal-buttons">
              <button onClick={() => setModalVisible(false)}>Cancelar</button>
              <button onClick={guardarCambios}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      <button className="volver-btn" onClick={() => navigate("/docente/dashboard")}>
        Volver
      </button>
    </div>
  );
};

export default ConfigurarCasillas;
