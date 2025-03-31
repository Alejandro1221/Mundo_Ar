import React from "react";
import { eliminarSonido } from "../services/sonidoService";
import "../assets/styles/bancoSonidos/sonidoItem.css";

const SonidoItem = ({ sonido, setSonidos }) => {
  const handleEliminar = async () => {
    const confirmar = window.confirm(`¿Seguro que deseas eliminar "${sonido.nombre}"?`);
    if (!confirmar) return;

    try {
      await eliminarSonido(sonido.id, sonido.url);
      setSonidos((prev) => prev.filter((s) => s.id !== sonido.id));
      alert("✅ Sonido eliminado exitosamente.");
    } catch (error) {
      alert("❌ Error al eliminar sonido: " + error.message);
    }
  };

  return (
    <div className="sonido-item">
      <div className="info-sonido">
        <p className="nombre-sonido">
          🎵 <strong>{sonido.nombre}</strong> <span className="categoria-sonido">({sonido.categoria})</span>
        </p>
        <audio controls>
          <source src={sonido.url} type="audio/mp3" />
          Tu navegador no soporta el elemento de audio.
        </audio>
      </div>
      <button className="btn-eliminar-sonido" onClick={handleEliminar}>🗑️ Eliminar</button>
    </div>
  );
};

export default SonidoItem;

