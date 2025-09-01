import React, { useState, useEffect } from "react";
import { subirModelo } from "../../services/modelosService";
import { obtenerCategorias, agregarCategoria } from "../../services/categoriasService";
import "../../assets/styles/bancoModelos/formularioSubida.css";

const FormularioSubida = ({ setModelos }) => {
  const [nombre, setNombre] = useState("");
  const [nombreTouched, setNombreTouched] = useState(false);

  const [categoria, setCategoria] = useState("");
  const [categorias, setCategorias] = useState(["Seleccione una categoría"]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [mostrarInputCategoria, setMostrarInputCategoria] = useState(false);
  const [archivo, setArchivo] = useState(null);
  const [miniatura, setMiniatura] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);

  const nombreTrim = nombre.trim();
  const nombreValido = nombreTrim.length > 0;
  const puedeEnviar = nombreValido && categoria && archivo && miniatura && !subiendo;

  useEffect(() => {
    const cargarCategorias = async () => {
      const categoriasCargadas = await obtenerCategorias();
      setCategorias(categoriasCargadas || []);
    };
    cargarCategorias();
  }, []);

  const manejarSubida = async (e) => {
    e.preventDefault();

    // Validación de nombre (sin alert)
    if (!nombreValido) {
      setNombreTouched(true);
      return;
    }

    // Validación de los demás campos (puedes mantener alert si quieres)
    if (!categoria || !archivo || !miniatura) {
      alert("⚠️ Completa categoría, modelo y miniatura.");
      return;
    }

    setSubiendo(true);
    setProgreso(0);

    try {
      // Ajusta la firma si tu servicio recibe objeto en vez de params
      const nuevoModelo = await subirModelo(
        nombreTrim,
        categoria,
        archivo,
        miniatura,
        setProgreso
      );

      if (nuevoModelo) {
        setModelos((prev) => [nuevoModelo, ...prev]);
        setProgreso(100);
        setTimeout(() => setProgreso(0), 2000);

        // Reset del formulario
        setNombre("");
        setNombreTouched(false);
        setCategoria("");
        setArchivo(null);
        setMiniatura(null);
      }
    } catch (error) {
      console.error("❌ Error en la subida:", error);
      alert("Ocurrió un error al subir el modelo.");
    } finally {
      setSubiendo(false);
    }
  };

  const manejarNuevaCategoria = async () => {
    if (!mostrarInputCategoria) {
      setMostrarInputCategoria(true);
      return;
    }
    const nueva = nuevaCategoria.trim();
    if (!nueva) return;

    await agregarCategoria(nueva);
    setCategorias((prev) => [...prev, nueva]);
    setCategoria(nueva);
    setNuevaCategoria("");
    setMostrarInputCategoria(false);
  };

  return (
    <form className="form-subida" onSubmit={manejarSubida} noValidate>
      <fieldset disabled={subiendo}>
        {/* Nombre obligatorio */}
        <label>Nombre del modelo *</label>
        <input
          type="text"
          placeholder="Ej. Esqueleto humano"
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

        <div className={`nueva-categoria-container ${mostrarInputCategoria ? "columna" : ""}`}>
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

        <label>Modelo (.glb)</label>
        <input
          type="file"
          accept=".glb"
          onChange={(e) => setArchivo(e.target.files[0] || null)}
          required
        />

        <label>Miniatura (Imagen PNG)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setMiniatura(e.target.files[0] || null)}
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

        <button type="submit" className="btn-subir" disabled={!puedeEnviar}>
          {subiendo ? "Subiendo..." : "Subir Modelo"}
        </button>
      </fieldset>
    </form>
  );
};

export default FormularioSubida;
