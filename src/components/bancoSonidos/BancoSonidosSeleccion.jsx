// components/bancoSonidos/BancoSonidosSeleccion.jsx
import React, { useEffect, useState } from "react";
import { obtenerSonidos } from "../../services/sonidoService";
import "../../assets/styles/bancoSonidosSeleccion.css";

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
                Tu navegador no soporta el elemento de audio.
              </audio>
              <button onClick={() => {
                  console.log("🎵 Sonido seleccionado:", sonido); 
                  sessionStorage.setItem("sonidoSeleccionado", JSON.stringify(sonido));
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
