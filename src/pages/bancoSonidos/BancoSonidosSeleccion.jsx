import React, { useEffect, useState } from "react";
import { obtenerSonidos } from "../../services/sonidoService";
import "../../assets/styles/bancoSonidos/bancoSonidosSeleccion.css";


const BancoSonidosSeleccion = ({ onSeleccionar }) => {
  const [sonidos, setSonidos] = useState([]);

  useEffect(() => {
    const cargarSonidos = async () => {
      const listaSonidos = await obtenerSonidos();
      setSonidos(listaSonidos);
    };
    cargarSonidos();
  }, []);

return (
    <div className="banco-sonidos seleccion">
      <h2>Seleccionar Sonido</h2>
      <div className="lista-sonidos">
        {sonidos.length > 0 ? (
          sonidos.map((sonido) => (
            <div key={sonido.id} className="sonido-item">
              <p>{sonido.nombre} ({sonido.categoria})</p>
              <audio controls>
                <source src={sonido.url} type="audio/mp3" />
              </audio>
              <button onClick={() => {
                const modeloSeleccionado = JSON.parse(sessionStorage.getItem("modeloSeleccionadoParaSonido"));
                if (!modeloSeleccionado) {
                  alert("Error: No se ha seleccionado un modelo.");
                  return;
                }

                // Asegurar que el modelo tiene un campo de sonido
                modeloSeleccionado.sonido = {
                  id: sonido.id,
                  nombre: sonido.nombre,
                  url: sonido.url
                };

                // Actualizar los modelos en sessionStorage
                let modelosSeleccionados = JSON.parse(sessionStorage.getItem("modelosSeleccionados")) || [];
                modelosSeleccionados = modelosSeleccionados.map(m => 
                  m.url === modeloSeleccionado.url ? modeloSeleccionado : m
                );

                sessionStorage.setItem("modelosSeleccionados", JSON.stringify(modelosSeleccionados));
                
                // También actualizar el sonido en sessionStorage (para garantizar su persistencia)
                sessionStorage.setItem("sonidoSeleccionado", JSON.stringify(modeloSeleccionado.sonido));
                
                window.history.back();
              
              }}>
                🎵 Seleccionar
              </button>

            </div>
          ))
        ) : (
          <p>No hay sonidos disponibles.</p>
        )}
      </div>
    </div>
  );
};

export default BancoSonidosSeleccion;
