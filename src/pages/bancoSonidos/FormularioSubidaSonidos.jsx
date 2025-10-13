import React, { useState, useEffect, useRef } from "react";
import {
  subirSonido,
  obtenerCategorias,
  crearCategoria,
} from "../../services/sonidoService";
import "../../assets/styles/bancoSonidos/formularioSubidaSonidos.css";

const FormularioSubidaSonidos = ({ setSonidos }) => {
  const [archivo, setArchivo] = useState(null);
  const [nombre, setNombre] = useState("");
  const [nombreTouched, setNombreTouched] = useState(false);
  const [categoria, setCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [progreso, setProgreso] = useState(0);
  const [subiendo, setSubiendo] = useState(false);

   const nombreTrim = nombre.trim();
  const nombreValido = nombreTrim.length > 0;
  const [mostrarCampoNuevaCategoria, setMostrarCampoNuevaCategoria] =
    useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState("");

  // Ref para limpiar el input de archivo
  const inputFileRef = useRef(null);

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

    if (!archivo || !nombreValido || !categoria) {
      alert("⚠️ Todos los campos son obligatorios.");
      return;
    }

    setSubiendo(true);
    try {
      const nuevoSonido = await subirSonido(
        archivo,
        nombreTrim,
        categoria,
        setProgreso
      );
      setSonidos((prev) => [...prev, nuevoSonido]);

      // Limpiar todo después de subir
      setArchivo(null);
      setNombre("");
      setCategoria("");
      setProgreso(0);
      if (inputFileRef.current) inputFileRef.current.value = ""; 

      alert("✅ Sonido subido exitosamente.");
    } catch (error) {
      alert("❌ Error al subir el sonido: " + error.message);
    }
    setSubiendo(false);
  };

  const handleCrearCategoria = async () => {
    if (!nuevaCategoria.trim()) {
      alert("⚠️ Ingresa un nombre de categoría.");
      return;
    }

    try {
      await crearCategoria(nuevaCategoria);
      setCategorias((prev) => [...prev, { nombre: nuevaCategoria }]);
      setCategoria(nuevaCategoria);
      setNuevaCategoria("");
      setMostrarCampoNuevaCategoria(false);
      alert("✅ Categoría creada exitosamente.");
    } catch (error) {
      alert("❌ Error al crear categoría: " + error.message);
    }
  };

  return (
    <form onSubmit={handleSubir} className="form-subida-sonidos">
      <input
        type="text"
        placeholder="Nombre del sonido"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        onBlur={() => setNombreTouched(true)}
        aria-invalid={nombreTouched && !nombreValido ? "true" : "false"}
        required
        maxLength={60}
      />
      {nombreTouched && !nombreValido && (
        <small className="error">Debes escribir un nombre.</small>
      )}

      <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
        <option value="">Selecciona una categoría</option>
        {categorias.map((categoria) => (
          <option key={categoria.nombre ?? categoria} value={categoria.nombre ?? categoria}>
            {categoria.nombre ?? categoria}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="btn-nueva-categoria"
        onClick={() => setMostrarCampoNuevaCategoria((prev) => !prev)}
      >
        {mostrarCampoNuevaCategoria ? "Cancelar" : "Nueva Categoría"}
      </button>

      {mostrarCampoNuevaCategoria && (
        <div className="campo-nueva-categoria">
          <input
            type="text"
            placeholder="Nombre de nueva categoría"
            value={nuevaCategoria}
            onChange={(e) => setNuevaCategoria(e.target.value)}
          />
          <button
            type="button"
            className="btn-confirmar-categoria"
            onClick={handleCrearCategoria}
          >
            Crear Categoría
          </button>
        </div>
      )}

      <input
        ref={inputFileRef}
        type="file"
        accept="audio/mp3,audio/wav"
        onChange={handleArchivo}
        required
      />

      {subiendo && (
        <div className="progreso-container">
          <p>🎧 Subiendo... {progreso}%</p>
          <div className="progreso-barra">
            <div className="progreso" style={{ width: `${progreso}%` }}></div>
          </div>
        </div>
      )}

      <button type="submit" 
        disabled={subiendo || !archivo || !categoria || !nombreValido} className="btn-subir-sonido">
        {subiendo ? "Subiendo..." : "🎵 Subir Sonido"}
      </button>
    </form>
  );
};

export default FormularioSubidaSonidos;
