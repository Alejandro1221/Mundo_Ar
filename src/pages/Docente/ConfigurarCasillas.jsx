import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCasillas } from "../../hooks/useCasillas";
import { FiArrowLeft } from "react-icons/fi";
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
      {/* 🔙 Botón Volver con ícono */}
      <button
        className="configurar-casillas-container__btn-volver"
        onClick={() => navigate("/docente/dashboard")}
        aria-label="Volver al dashboard"
      >
        <FiArrowLeft />
      </button>
  
      <h2 className="configurar-casillas-container__titulo">Configurar Casillas del Juego</h2>
  
      {/* 🔲 Tablero de casillas */}
      <div className="configurar-casillas-container__tablero">
        {casillas.map((casilla, index) => (
          <div
            key={index}
            className={`configurar-casillas-container__casilla ${casilla.plantilla ? "configurada" : ""}`}
            onClick={() => abrirModal(index, casilla.plantilla)}
          >
            <span>{index + 1}</span>
            {casilla.plantilla && (
              <span className="configurar-casillas-container__plantilla">{casilla.plantilla}</span>
            )}
          </div>
        ))}
      </div>
  
      {/* 📦 Modal */}
      {modalVisible && (
        <div className="configurar-casillas-container__modal">
          <div className="configurar-casillas-container__modal-content">
            <h3>Seleccionar Plantilla</h3>
            <select
              value={plantillaSeleccionada}
              onChange={(e) => setPlantillaSeleccionada(e.target.value)}
            >
              <option value="">Seleccione una plantilla</option>
              <option value="modelo-sonido">Modelo-Sonido</option>
              <option value="clasificacion-modelos">Clasificar Modelos</option>
            </select>
            <div className="configurar-casillas-container__modal-buttons">
              <button onClick={() => setModalVisible(false)}>Cancelar</button>
              <button onClick={guardarCambios}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ConfigurarCasillas;  