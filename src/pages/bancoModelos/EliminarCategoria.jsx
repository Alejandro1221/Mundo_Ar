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

  const disabled = !valor; 

  const handleEliminar = async (e) => {
    e.preventDefault();
    if (disabled) { setMsg("Selecciona una categoría válida."); return; }

    if (!window.confirm(`¿Seguro que deseas eliminar la categoría "${valor}"?`)) return;

    try {
      setLoading(true);
      setMsg("");
      await eliminarCategoriaAPI(valor);
      onDeleted?.(valor);
      onClose?.();
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

      <select
        id="categoriaEliminar"
        className="modal-select"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        aria-invalid={!!msg}
      >
        <option value="">— Selecciona categoría —</option>
        {opciones.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {msg && <small className="error">{msg}</small>}

      <div className="modal-actions">
        <button type="button" className="btn btn--secondary" onClick={onClose} disabled={loading}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--danger" disabled={disabled || loading}>
          {loading ? "Eliminando…" : "Eliminar"}
        </button>
      </div>
    </form>
  );
};

export default EliminarCategoria;
