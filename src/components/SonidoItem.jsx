import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { eliminarSonido, actualizarSonido, reemplazarArchivoSonido } from "../services/sonidoService";
import "../assets/styles/bancoSonidos/sonidoItem.css";

const SonidoItem = ({ sonido, setSonidos, modoSeleccion = false, onSeleccionar }) => {
  const [showEdit, setShowEdit] = useState(false);
  const [nombre, setNombre] = useState(sonido.nombre);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const modalRef = useRef(null);

  const abrirEdicion = () => {
    setNombre(sonido.nombre);
    setFile(null);
    setShowEdit(true);
  };
  const cerrarEdicion = () => setShowEdit(false);

  const guardarCambios = async () => {
    try {
      setSaving(true);
      if (nombre.trim() && nombre.trim() !== sonido.nombre) {
        await actualizarSonido(sonido.id, { nombre: nombre.trim() });
        setSonidos((prev) =>
          prev.map((s) => (s.id === sonido.id ? { ...s, nombre: nombre.trim() } : s))
        );
      }
      if (file) {
        const { url } = await reemplazarArchivoSonido(sonido.id, file, sonido.url);
        setSonidos((prev) =>
          prev.map((s) => (s.id === sonido.id ? { ...s, url } : s))
        );
      }
      cerrarEdicion();
    } catch (e) {
      alert("No se pudo guardar: " + (e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") cerrarEdicion();
    };

    if (showEdit) {
      document.body.classList.add("modal-open");
      window.addEventListener("keydown", onKeyDown);
      // enfoca el modal
      setTimeout(() => modalRef.current?.focus(), 0);
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showEdit]);

  const handleEliminar = async () => {
    if (!confirm(`¿Eliminar "${sonido.nombre}"?`)) return;
    try {
      await eliminarSonido(sonido.id, sonido.url);
      setSonidos((prev) => prev.filter((s) => s.id !== sonido.id));
    } catch (e) {
      alert("Error eliminando: " + (e?.message || e));
    }
  };

  return (
    <div className="sonido-card">
      <div className="sonido-card-header">
        <strong className="sonido-nombre">{sonido.nombre}</strong>
        <span className="sonido-categoria">{sonido.categoria}</span>
      </div>

      <audio controls className="sonido-audio">
        <source src={sonido.url} type="audio/mp3" />
      </audio>

      <div className="row-actions">
        <button
          className="btn btn--secondary btn--icon--sm"
          onClick={abrirEdicion}
          title="Editar"
          aria-label="Editar"
        >
          ✏️
        </button>

        <button
          className="btn btn--icon btn--danger"
          onClick={handleEliminar}
          title="Eliminar"
          aria-label="Eliminar"
        >
          🗑️
        </button>
      </div>

      {modoSeleccion && (
        <button
          className="btn btn--primary btn--select"
          onClick={() => onSeleccionar?.(sonido)}
        >
          🎵 Seleccionar
        </button>
      )}

      {showEdit &&
      createPortal(
        <>
          <div className="modal-backdrop" onClick={cerrarEdicion} />
          <div
            className="modal-window"
            role="dialog"
            aria-modal="true"
            aria-labelledby="editar-sonido-title"
            ref={modalRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="editar-sonido-title">Editar sonido</h2>
              <button className="menu-close" onClick={cerrarEdicion} aria-label="Cerrar">❌</button>
            </div>
            <div className="modal-body">
              {/* ——— tu formulario tal cual ——— */}
              <div className="form-row">
                <label>Nombre</label>
                <input
                  className="input"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre del sonido"
                />
              </div>

              <div className="form-row">
                <label>Reemplazar archivo (opcional)</label>
                <input
                  className="file"
                  type="file"
                  accept="audio/mp3,audio/mpeg"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="modal-actions">
                <button className="btn btn--primary " onClick={guardarCambios} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar"}
                </button>
                <button className="btn btn--danger " onClick={cerrarEdicion}>Cancelar</button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )
    }
    </div>
  );
};

export default SonidoItem;