import React, { useState, useEffect } from "react";
import { subirSonido, obtenerCategorias, crearCategoria } from "../../services/sonidoService";
import "../../assets/styles/bancoSonidos/formularioSubidaSonidos.css";

const FormularioSubidaSonidos = ({ setSonidos }) => {
  const [archivo, setArchivo] = useState(null);
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [progreso, setProgreso] = useState(0);
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    const cargarCategorias = async () => {
      const listaCategorias = await obtenerCategorias();
      setCategorias(listaCategorias);
    };
    cargarCategorias();
  }, []);

  const handleArchivo = (e) => {
    setArchivo(e.target.files[0]);
  };

  const handleSubir = async (e) => {
    e.preventDefault();
    if (!archivo || !nombre || !categoria) {
      alert("⚠️ Todos los campos son obligatorios.");
      return;
    }

    setSubiendo(true);
    try {
      const nuevoSonido = await subirSonido(archivo, nombre, categoria, setProgreso);
      setSonidos((prev) => [...prev, nuevoSonido]);
      setArchivo(null);
      setNombre("");
      setCategoria("");
      setProgreso(0);
      alert("✅ Sonido subido exitosamente.");
    } catch (error) {
      alert("❌ Error al subir el sonido: " + error.message);
    }
    setSubiendo(false);
  };

  const handleCrearCategoria = async () => {
    const nuevaCategoria = prompt("📝 Ingrese el nombre de la nueva categoría:");
    if (nuevaCategoria?.trim()) {
      try {
        await crearCategoria(nuevaCategoria);
        setCategorias((prev) => [...prev, { nombre: nuevaCategoria }]);
        setCategoria(nuevaCategoria);
        alert("✅ Categoría creada exitosamente.");
      } catch (error) {
        alert("❌ Error al crear categoría: " + error.message);
      }
    }
  };


  return (
    <form onSubmit={handleSubir} className="form-subida-sonidos">
      <input
        type="text"
        placeholder="Nombre del sonido"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />

      <select value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
        <option value="">Selecciona una categoría</option>
        {categorias.map((cat, index) => (
          <option key={index} value={cat.nombre}>{cat.nombre}</option>
        ))}
      </select>

      <button type="button" className="btn-nueva-categoria" onClick={handleCrearCategoria}>
        ➕ Nueva Categoría
      </button>

      <input type="file" accept="audio/mp3,audio/wav" onChange={handleArchivo} required />

      {subiendo && (
        <div className="progreso-container">
          <p>🎧 Subiendo... {progreso}%</p>
          <div className="progreso-barra">
            <div className="progreso" style={{ width: `${progreso}%` }}></div>
          </div>
        </div>
      )}

      <button type="submit" disabled={subiendo} className="btn-subir-sonido">
        {subiendo ? "Subiendo..." : "🎵 Subir Sonido"}
      </button>
    </form>
  );
};

export default FormularioSubidaSonidos;
