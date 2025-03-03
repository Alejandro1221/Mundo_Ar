import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCasillas } from "../../hooks/useCasillas";
import "../../assets/styles/configurarCasillas.css";

const ConfigurarCasillas = () => {
  const { juegoId } = useParams(); 
  const navigate = useNavigate();
  const { casillas, cargarCasillas, abrirModal, guardarCambios, modalVisible, setModalVisible, plantillaSeleccionada, setPlantillaSeleccionada } = useCasillas(juegoId);

  useEffect(() => {
    if (!juegoId) {
      alert("Error: No se encontró el juego.");
      navigate("/docente/gestionar-juegos");
    } else {
      cargarCasillas();
    }
  }, [juegoId, cargarCasillas, navigate]);

  return (
    <div className="configurar-casillas-container">
      <h2>Configurar Casillas del Juego</h2>

      <div className="tablero">
        {casillas.map((casilla, index) => (
          <div key={index} className={`casilla ${casilla.plantilla ? "configurada" : ""}`} onClick={() => abrirModal(index, casilla.plantilla)}>
            {index + 1}
            {casilla.plantilla && <small>{casilla.plantilla}</small>}
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
            </select>
            <div className="modal-buttons">
              <button onClick={() => setModalVisible(false)}>Cancelar</button>
              <button onClick={guardarCambios}>Guardar</button>
            </div>
          </div>
        </div>
      )}

        <button className="volver-btn" onClick={() => navigate(-1)}>Volver</button>

    </div>
  );
};

export default ConfigurarCasillas;
