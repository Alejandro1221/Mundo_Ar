import React, { useState } from "react";
import { subirModelo } from "../../services/modelosService";
import "../../assets/styles/formularioSubida.css";

const FormularioSubida = ({ setModelos }) => {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [miniatura, setMiniatura] = useState(null);
  const [progreso, setProgreso] = useState(0);

  const manejarSubida = async (e) => {
    e.preventDefault();
    if (!nombre || !categoria || !archivo || !miniatura) {
      alert("Completa todos los campos");
      return;
    }

    const nuevoModelo = await subirModelo(nombre, categoria, archivo, miniatura, setProgreso);
    if (nuevoModelo) {
      setModelos(prev => [...prev, nuevoModelo]);
      setProgreso(0); // 🔥 Reset progreso después de subir
    }
  };

  return (
    <form className="form-subida" onSubmit={manejarSubida}>
      <input type="text" placeholder="Nombre del modelo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      <input type="text" placeholder="Categoría" value={categoria} onChange={(e) => setCategoria(e.target.value)} required />

      {/* Primero selecciona archivo .glb (modelo 3D) */}
      <input type="file" accept=".glb" onChange={(e) => setArchivo(e.target.files[0])} required />

      {/* Luego selecciona imagen (miniatura) */}
      <input type="file" accept="image/*" onChange={(e) => setMiniatura(e.target.files[0])} required />

      {progreso > 0 && <p>📊 Subiendo... {progreso}%</p>}
      
      <button type="submit">Subir Modelo</button>
    </form>

  );
};

export default FormularioSubida;
