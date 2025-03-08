import React, { useState } from "react";
import { subirModelo } from "../../services/modelosService";
import "../../assets/styles/formularioSubida.css";

const FormularioSubida = ({ setModelos }) => {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [miniatura, setMiniatura] = useState(null);

  const manejarSubida = async (e) => {
    e.preventDefault();
    if (!nombre || !categoria || !archivo || !miniatura) {
      alert("Completa todos los campos");
      return;
    }

    const nuevoModelo = await subirModelo(nombre, categoria, archivo, miniatura);
    setModelos(prev => [...prev, nuevoModelo]);
  };

  return (
    <form className="form-subida" onSubmit={manejarSubida}>
      <input type="text" placeholder="Nombre del modelo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      <input type="text" placeholder="Categoría" value={categoria} onChange={(e) => setCategoria(e.target.value)} required />
      <input type="file" onChange={(e) => setArchivo(e.target.files[0])} required />
      <input type="file" onChange={(e) => setMiniatura(e.target.files[0])} required />
      <button type="submit">Subir Modelo</button>
    </form>
  );
};

export default FormularioSubida;
