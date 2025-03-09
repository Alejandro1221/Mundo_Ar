import React from "react";
import "../../assets/styles/modeloItem.css";

const ModeloItem = ({ modelo, esPlantilla, manejarSeleccion, manejarEliminacion, seleccionado = false }) => {
  return (
    <div className="modelo-item">
      <img src={modelo.miniatura} alt={modelo.nombre} className="modelo-img" />
      <p><strong>{modelo.nombre}</strong></p>
      <p><strong>Categoría:</strong> {modelo.categoria}</p>

      {/* ✅ Checkbox solo aparece en modo plantilla y muestra el estado actual */}
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
