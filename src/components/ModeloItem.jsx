import React from "react";
import "@google/model-viewer";
import "../assets/styles/bancoModelos/modeloItem.css";

const ModeloItem = ({ modelo, esPlantilla, manejarSeleccion, manejarEliminacion, seleccionado = false }) => {
  

  return (
    <>
      <div className="modelo-item">
        <model-viewer
          className="modelo-viewer"
          src={modelo.url || modelo.modelo_url}
          camera-controls
          auto-rotate
          shadow-intensity="1"
          interaction-policy="allow-when-focused"
          disable-zoom
          loading="lazy"
          reveal="interaction"
        ></model-viewer>
        <p><strong>{modelo.nombre}</strong></p>
        <p><strong>Categoría:</strong> {modelo.categoria}</p>

        {esPlantilla ? (
          <input type="checkbox" checked={seleccionado} onChange={() => manejarSeleccion(modelo)} />
        ) : (
          <button className="btn btn--danger btn--sm" onClick={() => manejarEliminacion(modelo)}>
            🗑️ Eliminar
          </button>
        )}

      </div>
    </>
  );
};

export default ModeloItem;
