import React, { useEffect, useState } from "react";

const ModalEditarModelo = ({ abierto, modelo, categorias, onClose, onSave, cargando, progreso }) => {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [archivo, setArchivo] = useState(null);

  useEffect(() => {
    if (modelo) {
      setNombre(modelo.nombre || "");
      setCategoria(modelo.categoria || "");
      setArchivo(null);
    }
  }, [modelo]);

  if (!abierto) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-window" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar modelo</h2>
          <button className="menu-close" onClick={onClose} aria-label="Cerrar">❌</button>
        </div>

        <div className="modal-body">
          <label>Nombre</label>
          <input
            className="modal-input"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Serpiente"
          />

          <label style={{ marginTop: 12 }}>Categoría</label>
          <select
            className="modal-select"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="">— Selecciona categoría —</option>
            {categorias.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <p className="nombre-modelo" style={{ marginTop: 12 }}>
            Reemplazar archivo (.glb)
          </p>

          <input
            className="file"
            type="file"
            accept=".glb,.gltf"
            disabled={cargando}
            onChange={(e) => setArchivo(e.target.files?.[0] || null)}
          />

          {cargando && (
            <div style={{ marginTop: 10 }}>
              <div style={{ height: 8, background: "#eee", borderRadius: 8 }}>
                <div style={{ width: `${progreso}%`, height: 8, borderRadius: 8, background: "var(--pastel-azul)" }} />
              </div>
              <small>{progreso}%</small>
            </div>
          )}

          <div className="modal-actions">
            <button
              className="btn btn--primary"
              onClick={() => onSave({ nombre: nombre.trim(), categoria, archivo })}
              disabled={cargando || !nombre || !categoria}
            >
              Guardar cambios
            </button>
            <button className="btn btn--danger" onClick={onClose} disabled={cargando}>Cancelar</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalEditarModelo;
