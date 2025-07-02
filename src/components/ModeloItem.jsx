import React, { useState, useEffect } from "react";
import "@google/model-viewer";
import "../assets/styles/bancoModelos/modeloItem.css";

const ModeloItem = ({ modelo, esPlantilla, manejarSeleccion, manejarEliminacion, seleccionado = false }) => {
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);
  const [cerrando, setCerrando] = useState(false);

  useEffect(() => {
  const contenedor = document.querySelector(".lista-modelos");
  if (!contenedor) return;

  if (mostrarVistaPrevia) {
    contenedor.classList.add("modal-bloqueo");
  } else {
    contenedor.classList.remove("modal-bloqueo");
  }

  return () => {
  const contenedor = document.querySelector(".lista-modelos");
  contenedor?.classList.remove("modal-bloqueo");
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

        <button className="btn-ver" onClick={() => setMostrarVistaPrevia(true)}>
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
      </div>

      {mostrarVistaPrevia && (
        <div
          className="modal-vista-previa"
          onClick={(e) => {
            if (e.target.classList.contains("modal-vista-previa")) {
              cerrarModal();
            }
          }}
        >
          <div className={`modal-contenido ${cerrando ? "cerrando" : ""}`}>
            <button className="btn-cerrar" onClick={cerrarModal}>✖</button>
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
    </>
  );
};

export default ModeloItem;
