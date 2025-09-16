import React, { useState, useMemo } from "react";
import { eliminarCategoria as eliminarCategoriaAPI } from "../../services/categoriasService";

const EliminarCategoria = ({ categorias = [], onClose, onDeleted }) => {
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const opciones = useMemo(
    () => categorias.filter((c) => c && c !== "Todos"),
    [categorias]
  );

  const disabled =
    !valor.trim() || valor.trim() === "Todos" || !opciones.includes(valor.trim());

  const handleEliminar = async (e) => {
    e.preventDefault();
    const nombre = valor.trim();

    if (disabled) {
      setMsg("Selecciona una categoría válida.");
      return;
    }

    if (!window.confirm(`¿Seguro que deseas eliminar la categoría "${nombre}"?`))
      return;

    try {
      setLoading(true);
      setMsg("");
      await eliminarCategoriaAPI(nombre);
      onDeleted?.(nombre);   // avisa al padre para que actualice estado
      onClose?.();           // cierra el modal
    } catch (err) {
      console.error("❌ Error al eliminar categoría:", err);
      setMsg("Hubo un error al eliminar la categoría. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleEliminar} className="form-subida" style={{ boxShadow: "none", padding: 0, maxWidth: "100%" }}>
      <label htmlFor="categoriaEliminar">Elige la categoría a eliminar</label>
      <input
        id="categoriaEliminar"
        list="lista-categorias"
        placeholder="Escribe o selecciona…"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        aria-invalid={!!msg}
      />
      <datalist id="lista-categorias">
        {opciones.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      {msg && <small className="error">{msg}</small>}

      <div className="modal-actions">
        <button type="button" className="btn-sec" onClick={onClose} disabled={loading}>
          Cancelar
        </button>
        <button type="submit" className="btn-danger" disabled={disabled || loading}>
          {loading ? "Eliminando…" : "Eliminar"}
        </button>
      </div>
    </form>
  );
};

export default EliminarCategoria;
