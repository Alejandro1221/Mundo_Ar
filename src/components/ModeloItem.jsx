import React, { useState, useEffect } from "react";
import "@google/model-viewer";
import "../assets/styles/bancoModelos/modeloItem.css";

const ModeloItem = ({ modelo, esPlantilla, manejarSeleccion, manejarEliminacion, seleccionado = false }) => {
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);
  const [cerrando, setCerrando] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") cerrarModal(); };
    if (mostrarVistaPrevia) {
      document.body.classList.add("modal-open");
      window.addEventListener("keydown", onKey);
    }
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [mostrarVistaPrevia]);
  

  const cerrarModal = () => {
    setCerrando(true);
    setTimeout(() => {
      setMostrarVistaPrevia(false);
      setCerrando(false);
    }, 200);
  };

  return (
    <>
      <div className="modelo-item">
        <img src={modelo.miniatura} alt={modelo.nombre} className="modelo-img" />
        <p><strong>{modelo.nombre}</strong></p>
        <p><strong>Categoría:</strong> {modelo.categoria}</p>

        {esPlantilla ? (
          <input type="checkbox" checked={seleccionado} onChange={() => manejarSeleccion(modelo)} />
        ) : (
          <button className="btn btn--danger btn--sm" onClick={() => manejarEliminacion(modelo)}>
            🗑️ Eliminar
          </button>
        )}

        <button className="btn btn--secondary btn--sm" onClick={() => setMostrarVistaPrevia(true)}>
          Ver modelo
        </button>
      </div>

      {mostrarVistaPrevia && (
        <div
          className="modal-vista-previa"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-modelo-titulo"
          onClick={(e) => {
            if (e.target.classList.contains("modal-vista-previa")) cerrarModal();
          }}
        >
          <div className={`modal-contenido ${cerrando ? "cerrando" : ""}`}>
            <button className="btn-cerrar" onClick={cerrarModal} aria-label="Cerrar">✖</button>
            <model-viewer
              src={modelo.url || modelo.modelo_url}
              scale="0.01 0.01 0.01"
              auto-rotate
              camera-controls
              style={{ width: "300px", height: "300px" }}
            />
            <p id="modal-modelo-titulo">{modelo.nombre}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ModeloItem;
