import React, { useState, useEffect } from "react";
import { subirModelo } from "../../services/modelosService";
import { obtenerCategorias, agregarCategoria } from "../../services/categoriasService";
import "../../assets/styles/bancoModelos/formularioSubida.css";

const FormularioSubida = ({ setModelos }) => {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [categorias, setCategorias] = useState(["Seleccione una categoría"]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [mostrarInputCategoria, setMostrarInputCategoria] = useState(false);
  const [archivo, setArchivo] = useState(null);
  const [miniatura, setMiniatura] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);

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
        setModelos((prev) => [nuevoModelo, ...prev]);
        setProgreso(100);
        setTimeout(() => setProgreso(0), 2000);
        setNombre("");
        setCategoria("");
        setArchivo(null);
        setMiniatura(null);
      }
    } catch (error) {
      console.error("❌ Error en la subida:", error);
      alert("Ocurrió un error al subir el modelo.");
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
    setCategorias((prev) => [...prev, nuevaCategoria]);
    setCategoria(nuevaCategoria);
    setNuevaCategoria("");
    setMostrarInputCategoria(false);
  };

  return (
    <form className="form-subida" onSubmit={manejarSubida}>
      <fieldset disabled={subiendo}>
        <input
          type="text"
          placeholder="Nombre del modelo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <label>Seleccionar Categoría:</label>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          required
        >
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
          <button
            type="button"
            className="btn-nueva-categoria"
            onClick={manejarNuevaCategoria}
          >
            {mostrarInputCategoria ? "✔ Agregar" : "➕ Nueva Categoría"}
          </button>
        </div>
        
        <label>Subir Modelo (.glb)</label>
        <input
          type="file"
          accept=".glb"
          onChange={(e) => setArchivo(e.target.files[0])}
          required
        />
        <label>Subir Miniatura (Imagen PNG)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setMiniatura(e.target.files[0])}
          required
        />

        {subiendo && (
          <div className="progreso-container">
            <p>📊 Subiendo... {progreso}%</p>
            <div className="progreso-barra">
              <div className="progreso" style={{ width: `${progreso}%` }}></div>
            </div>
          </div>
        )}

        <button type="submit" className="btn-subir" disabled={subiendo}>
          {subiendo ? "Subiendo..." : "Subir Modelo"}
        </button>
      </fieldset>
    </form>
  );
};

export default FormularioSubida;
