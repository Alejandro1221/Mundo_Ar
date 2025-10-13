import React, { useState, useEffect, useRef } from "react";
import { subirModelo } from "../../services/modelosService";
import { obtenerCategorias, agregarCategoria } from "../../services/categoriasService";
import "../../assets/styles/bancoModelos/formularioSubida.css";

const MAX_GLTF_MB = 50; // ajusta el límite si quieres

const FormularioSubida = ({ setModelos, onSuccess }) => {
  const [nombre, setNombre] = useState("");
  const [nombreTouched, setNombreTouched] = useState(false);

  const [categoria, setCategoria] = useState("");
  const [categorias, setCategorias] = useState(["Seleccione una categoría"]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [mostrarInputCategoria, setMostrarInputCategoria] = useState(false);

  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);

  const [catLoading, setCatLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef(null);

  const nombreTrim = nombre.trim();
  const nombreValido = nombreTrim.length > 0;

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const categoriasCargadas = await obtenerCategorias();
        // Normaliza, desduplica, filtra vacíos
        const limpias = Array.from(
          new Set(
            (categoriasCargadas || [])
              .map(c => String(c).trim())
              .filter(Boolean)
          )
        );
        setCategorias(limpias);
      } catch (e) {
        console.error("Error cargando categorías:", e);
        setCategorias([]);
      }
    };
    cargarCategorias();
  }, []);

  const validarArchivo = (file) => {
    if (!file) return "Debes seleccionar un archivo .glb";
    const isGlb = file.name.toLowerCase().endsWith(".glb") || file.type === "model/gltf-binary";
    if (!isGlb) return "El archivo debe ser .glb";
    const tooBig = file.size > MAX_GLTF_MB * 1024 * 1024;
    if (tooBig) return `El archivo supera ${MAX_GLTF_MB} MB`;
    return "";
  };

  const manejarSubida = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!nombreValido) {
      setNombreTouched(true);
      setErrorMsg("Debes escribir un nombre.");
      return;
    }
    if (!categoria) {
      setErrorMsg("Selecciona una categoría.");
      return;
    }
    const fileError = validarArchivo(archivo);
    if (fileError) {
      setErrorMsg(fileError);
      return;
    }

    try {
      setSubiendo(true);
      setProgreso(0);

      const nuevoModelo = await subirModelo(nombreTrim, categoria, archivo, setProgreso);
      if (nuevoModelo) {
        setModelos(prev => [nuevoModelo, ...prev]);

        setNombre("");
        setNombreTouched(false);
        setCategoria("");
        setArchivo(null);
        setProgreso(100);
        if (fileRef.current) fileRef.current.value = "";

        onSuccess && onSuccess();
        setTimeout(() => setProgreso(0), 1200);
      }
    } catch (error) {
      console.error("❌ Error en la subida:", error);
      setErrorMsg("Ocurrió un error al subir el modelo.");
    } finally {
      setSubiendo(false);
    }
  };

  const manejarNuevaCategoria = async () => {
    setErrorMsg("");

    if (!mostrarInputCategoria) {
      setMostrarInputCategoria(true);
      return;
    }

    const nueva = nuevaCategoria.trim();
    if (!nueva) {
      setErrorMsg("Escribe un nombre para la nueva categoría.");
      return;
    }

    const yaExiste = categorias.some(c => c.toLowerCase() === nueva.toLowerCase());
    if (yaExiste) {
      setCategoria(categorias.find(c => c.toLowerCase() === nueva.toLowerCase()));
      setNuevaCategoria("");
      setMostrarInputCategoria(false);
      return;
    }

    try {
      setCatLoading(true);
      await agregarCategoria(nueva);
      setCategorias(prev => [...prev, nueva]);
      setCategoria(nueva);
      setNuevaCategoria("");
      setMostrarInputCategoria(false);
    } catch (e) {
      console.error("Error agregando categoría:", e);
      setErrorMsg("No se pudo agregar la categoría.");
    } finally {
      setCatLoading(false);
    }
  };

  const puedeSubir = nombreValido && categoria && archivo && !subiendo;

  return (
    <form className="form-subida" onSubmit={manejarSubida} noValidate>
      <fieldset disabled={subiendo}>

        <label htmlFor="nombre">Nombre del modelo</label>
        <input
          id="nombre"
          type="text"
          placeholder="Escribe el nombre del modelo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onBlur={() => setNombreTouched(true)}
          aria-invalid={nombreTouched && !nombreValido}
          aria-describedby="err-nombre"
          required
          maxLength={60}
        />
        {nombreTouched && !nombreValido && (
          <small id="err-nombre" className="error" aria-live="polite">
            Debes escribir un nombre.
          </small>
        )}

        <label htmlFor="categoria">Seleccionar Categoría</label>
        <select
          id="categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          required
        >
          <option value="">-- Seleccionar --</option>
          {categorias.map((cat, index) => (
            <option key={`${cat}-${index}`} value={cat}>{cat}</option>
          ))}
        </select>

        <div className={`nueva-categoria-container ${mostrarInputCategoria ? "columna" : ""}`}>
          {mostrarInputCategoria && (
            <input
              type="text"
              placeholder="Nueva Categoría"
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
              maxLength={40}
            />
          )}
          {/* Botón Nueva Categoría */}
          <button
            type="button"
            className="btn btn--success btn--sm btn-nueva-categoria"
            onClick={manejarNuevaCategoria}
            disabled={catLoading}
          >
            {catLoading ? "Agregando..." : (mostrarInputCategoria ? "✔ Agregar" : "Nueva Categoría")}
          </button>
        </div>

        <label htmlFor="archivo">Modelo (.glb)</label>
        <input
          id="archivo"
          ref={fileRef}
          type="file"
          accept=".glb,model/gltf-binary"
          onChange={(e) => setArchivo(e.target.files?.[0] || null)}
          required
        />

        {subiendo && (
          <div className="progreso-container" aria-live="polite">
            <p>📊 Subiendo... {progreso}%</p>
            <div className="progreso-barra">
              <div className="progreso" style={{ width: `${progreso}%` }} />
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="form-error" role="alert" aria-live="assertive">
            {errorMsg}
          </div>
        )}

        {/* Botón Subir */}
        <button type="submit" className="btn btn--primary btn-subir" disabled={!puedeSubir}>
          {subiendo ? "Subiendo..." : "Subir Modelo"}
        </button>
      </fieldset>
    </form>
  );
};

export default FormularioSubida;
