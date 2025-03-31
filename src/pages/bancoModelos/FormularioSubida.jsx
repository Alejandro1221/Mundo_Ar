import React, { useState, useEffect } from "react";
import { subirModelo } from "../../services/modelosService";
import { obtenerCategorias, agregarCategoria } from "../../services/categoriasService";
import "../../assets/styles/bancoModelos/formularioSubida.css";
//import "../../assets/styles/formularioSubida.css";

const FormularioSubida = ({ setModelos }) => {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [archivo, setArchivo] = useState(null);
  const [miniatura, setMiniatura] = useState(null);
  const [progreso, setProgreso] = useState(0);
  const [subiendo, setSubiendo] = useState(false);
  const [mostrarInputCategoria, setMostrarInputCategoria] = useState(false);

  useEffect(() => {
    const cargarCategorias = async () => {
      const categoriasCargadas = await obtenerCategorias();
      setCategorias(categoriasCargadas);
    };
    cargarCategorias();
  }, []);

  const manejarSubida = async (e) => {
    e.preventDefault();
    if (!nombre || !categoria || !archivo || !miniatura) {
        alert("⚠️ Completa todos los campos");
        return;
    }

    setSubiendo(true);
    setProgreso(0);

    try {
        const nuevoModelo = await subirModelo(nombre, categoria, archivo, miniatura, setProgreso);

        if (nuevoModelo) {
            setModelos(prevModelos => [nuevoModelo, ...prevModelos]); // 🔥 Agregar modelo al inicio sin recargar Firebase
            setProgreso(100);
            setTimeout(() => setProgreso(0), 2000);
        }
    } catch (error) {
        console.error("❌ Error en la subida:", error);
    }

    setSubiendo(false);
};


  const manejarNuevaCategoria = async () => {
    if (!mostrarInputCategoria) {
      setMostrarInputCategoria(true);
      return;
    }

    if (nuevaCategoria.trim() === "") return;
    await agregarCategoria(nuevaCategoria);
    setCategorias(prev => [...prev, nuevaCategoria]);
    setCategoria(nuevaCategoria);
    setNuevaCategoria("");
    setMostrarInputCategoria(false);
  };

  return (
    <form className="form-subida" onSubmit={manejarSubida}>
      <input type="text" placeholder="Nombre del modelo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />

      <label>Seleccionar Categoría:</label>
      <select value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
        <option value="">-- Seleccionar --</option>
        {categorias.map((cat, index) => (
          <option key={index} value={cat}>{cat}</option>
        ))}
      </select>

      <div className="nueva-categoria-container">
        {mostrarInputCategoria && (
          <input 
            type="text" 
            placeholder="Nueva Categoría" 
            value={nuevaCategoria} 
            onChange={(e) => setNuevaCategoria(e.target.value)} 
          />
        )}
        <button type="button" onClick={manejarNuevaCategoria}>
          {mostrarInputCategoria ? "✔ Agregar" : "+ Nueva Categoría"}
        </button>
      </div>

      <input type="file" accept=".glb" onChange={(e) => setArchivo(e.target.files[0])} required />
      <input type="file" accept="image/*" onChange={(e) => setMiniatura(e.target.files[0])} required />

      {subiendo && (
        <div className="progreso-container">
          <p>📊 Subiendo... {progreso}%</p>
          <div className="progreso-barra">
            <div className="progreso" style={{ width: `${progreso}%` }}></div>
          </div>
        </div>
      )}

      <button type="submit" disabled={subiendo}>
        {subiendo ? "Subiendo..." : "Subir Modelo"}
      </button>
    </form>
  );
};

export default FormularioSubida;
