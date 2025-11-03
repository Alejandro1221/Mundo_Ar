import React, { useEffect, useState } from "react";
import { auth, db } from "../../services/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { crearJuegoEnFirestore, obtenerJuegosPorDocente } from "../../services/juegosService";
import { toast } from "react-toastify";
import "../../assets/styles/docente/crearjuego.css"; 

export default function CrearJuego({ isOpen, onClose, onCreated }) {
  const [usuario, setUsuario] = useState(null);
  const [nombre, setNombre] = useState("");
  const [publico, setPublico] = useState(false);
  const [juegos, setJuegos] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) return onClose?.();
      const nombreDocente = await getNombre(user.uid);
      setUsuario({ ...user, nombre: nombreDocente });
      const js = await obtenerJuegosPorDocente(user.uid);
      setJuegos(js);
    });
    return () => unsub();
  }, [isOpen, onClose]);

  const getNombre = async (uid) => {
    try {
      const ref = doc(db, "docentes", uid);
      const snap = await getDoc(ref);
      return snap.exists() ? snap.data().nombre : null;
    } catch { return null; }
  };

  const crear = async (e) => {
    e?.preventDefault?.();
    if (!nombre.trim()) {
      toast.warning("⚠️ El nombre del juego es obligatorio.");
      return;
    }
    const existe = juegos.some(j => j.nombre.toLowerCase() === nombre.toLowerCase());
    if (existe) {
      toast.warning("⚠️ Ya existe un juego con ese nombre.");
      return;
    }
    try {
      setSaving(true);
      const nuevo = {
        nombre: nombre.trim(),
        // 👇 Usa la misma forma que el resto de tu app para evitar inconsistencias
        casillas: Array(30).fill({ plantilla: null }),
        creadoPor: usuario?.uid ?? null,
        fechaCreacion: new Date(),
        publico
      };
      const ref = await crearJuegoEnFirestore(nuevo);
      toast.success(`Juego "${nuevo.nombre}" creado.`);
      onCreated?.({ id: ref.id, ...nuevo });
      // Limpia y cierra
      setNombre("");
      setPublico(false);
      onClose?.();
    } catch (e) {
      console.error(e);
      toast.error("❌ Hubo un error al crear el juego.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className="modal-window"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title-crear"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="modal-title-crear">Nuevo juego</h2>
          <button className="modal-close" aria-label="Cerrar" onClick={onClose}>✕</button>
        </div>

        <form className="modal-body" onSubmit={crear}>
          <div className="form-row">
            <label htmlFor="input-nombre" className="label">Nombre del juego</label>
            <input
              id="input-nombre"
              type="text"
              className="input"
              placeholder="Escribe un nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoFocus
            />
          </div>

          <div className="switch-line">
            <span className="switch-text">
              {publico ? "Juego Público" : "Juego Privado"}
            </span>
            <label className="switch">
              <input
                type="checkbox"
                checked={publico}
                onChange={(e) => setPublico(e.target.checked)}
              />
              <span className="slider" />
            </label>
          </div>
          
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="btn btn--danger"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving || !nombre.trim()}
              className="btn btn--primary"
            >
              {saving ? "Creando..." : "Crear juego"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
