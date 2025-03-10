import React from "react";
import { eliminarSonido } from "../../services/sonidoService";
import "../../assets/styles/bancoSonidos.css";

const SonidoItem = ({ sonido, setSonidos }) => {
  const handleEliminar = async () => {
    const confirmar = window.confirm(`¿Seguro que deseas eliminar ${sonido.nombre}?`);
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
      <p>{sonido.nombre} ({sonido.categoria})</p>
      <audio controls>
        <source src={sonido.url} type="audio/mp3" />
        Tu navegador no soporta el elemento de audio.
      </audio>
      <button onClick={handleEliminar}>🗑️ Eliminar</button>
    </div>
  );
};

export default SonidoItem;
