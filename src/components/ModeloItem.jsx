import React from "react";
import "../assets/styles/bancoModelos/modeloItem.css";

const ModeloItem = ({ modelo, esPlantilla, manejarSeleccion, manejarEliminacion, seleccionado = false }) => {
  return (
    <div className="modelo-item">
      <img src={modelo.miniatura} alt={modelo.nombre} className="modelo-img" />
      <p><strong>{modelo.nombre}</strong></p>
      <p><strong>Categoría:</strong> {modelo.categoria}</p>

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
    </div>
  );
};

export default ModeloItem;
