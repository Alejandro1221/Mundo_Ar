import React, { useState } from "react";
import "@google/model-viewer";
import "../assets/styles/bancoModelos/modeloItem.css";

const ModeloItem = ({ modelo, esPlantilla, manejarSeleccion, manejarEliminacion, seleccionado = false }) => {
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);

  return (
    <div className="modelo-item">
      <img src={modelo.miniatura} alt={modelo.nombre} className="modelo-img" />
      <p><strong>{modelo.nombre}</strong></p>
      <p><strong>Categoría:</strong> {modelo.categoria}</p>

      <button
        className="btn-ver" onClick={() => setMostrarVistaPrevia(true)}>
          Ver modelo
      </button>

      {esPlantilla ? (
        <input 
          type="checkbox" 
          checked={seleccionado} 
          onChange={() => manejarSeleccion(modelo)} 
        />
      ) : (
        <button className="btn-eliminar" onClick={() => manejarEliminacion(modelo)}>
          🗑️ Eliminar
        </button>
      )}

      {/* Modal de vista previa */}
      {mostrarVistaPrevia && (
        <div className="modal-vista-previa">
          <div className="modal-contenido">
            <button className="btn-cerrar" onClick={() => setMostrarVistaPrevia(false)}>✖</button>
            <model-viewer
              src={modelo.url || modelo.modelo_url}
              scale="0.01 0.01 0.01"
              auto-rotate
              camera-controls
              style={{ width: "300px", height: "300px" }}
            />
            <p>{modelo.nombre}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeloItem;
