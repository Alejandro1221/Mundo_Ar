import React from "react";
import { eliminarSonido } from "../services/sonidoService";
import "../assets/styles/bancoSonidos/sonidoItem.css";

const SonidoItem = ({ sonido, setSonidos }) => {
  const handleEliminar = async () => {
    const confirmar = window.confirm(`¿Seguro que deseas eliminar "${sonido.nombre}"?`);
    if (!confirmar) return

    try {
      await eliminarSonido(sonido.id, sonido.url);
      setSonidos((prev) => prev.filter((s) => s.id !== sonido.id));
      alert("✅ Sonido eliminado exitosamente.");
    } catch (error) {
      alert("❌ Error al eliminar sonido: " + error.message);
    }
  };

  return (
    <div className="sonido-card">
      <div className="sonido-card-header">
        <strong>{sonido.nombre}</strong>
        <span className="sonido-categoria">{sonido.categoria}</span>
      </div>
      <audio controls className="sonido-audio">
        <source src={sonido.url} type="audio/mp3" />
        Tu navegador no soporta el elemento de audio.
      </audio>
      <button className="btn btn--danger btn--sm" onClick={handleEliminar}>
        🗑️ Eliminar
      </button>
    </div>
  );
};

export default SonidoItem;

