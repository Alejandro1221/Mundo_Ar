import "@google/model-viewer";
import "../assets/styles/bancoModelos/modeloItem.css";

const ModeloItem = ({ modelo, esPlantilla, manejarSeleccion, manejarEliminacion, manejarEditar, seleccionado = false }) => {
  
 const urlSrc = modelo?.modelo_url ?? modelo?.url ?? "";

  return (
    <div className="modelo-item">
      <model-viewer
        className="modelo-viewer"
        src={urlSrc}
        camera-controls
        auto-rotate
        shadow-intensity="1"
        interaction-policy="allow-when-focused"
        disable-zoom
      />

      <p><strong>{modelo?.nombre || "Sin nombre"}</strong></p>
      <p><strong>Categoría:</strong> {modelo?.categoria || "—"}</p>

      {esPlantilla ? (
        <input
          type="checkbox"
          checked={seleccionado}
          onChange={() => manejarSeleccion(modelo)}
        />
      ) : (
        <div className="acciones-modelo-item">
          <button
            className="btn btn--secondary btn--sm"
            onClick={() => manejarEditar(modelo)}
            aria-label="Editar modelo"
            title="Editar"
          >
            ✏️ 
          </button>

          <button
            className="btn btn--danger btn--sm"
            onClick={() => manejarEliminacion(modelo)}
            aria-label="Eliminar modelo"
            title="Eliminar"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
};

export default ModeloItem;