import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../services/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { crearJuegoEnFirestore, obtenerJuegosPorDocente } from "../../services/juegosService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/styles/docente/Crearjuego.css"; 

const CrearJuego = () => {
  const [usuario, setUsuario] = useState(null);
  const [nombre, setNombre] = useState("");
  const [publico, setPublico] = useState(false);
  const [juegos, setJuegos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) return navigate("/login");
      const nombreDocente = await getNombre(user.uid);
      setUsuario({ ...user, nombre: nombreDocente });
      const js = await obtenerJuegosPorDocente(user.uid);
      setJuegos(js);
    });
    return () => unsub();
  }, [navigate]);

  const getNombre = async (uid) => {
    try {
      const ref = doc(db, "docentes", uid);
      const snap = await getDoc(ref);
      return snap.exists() ? snap.data().nombre : null;
    } catch { return null; }
  };

  const crear = async () => {
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
      await crearJuegoEnFirestore({
        nombre,
        casillas: Array(30).fill({ configuracion: null }),
        creadoPor: usuario.uid,
        fechaCreacion: new Date(),
        publico
      });
      toast.success(`🎉 Juego "${nombre}" creado.`);
      setTimeout(() => navigate("/docente/dashboard"), 1200);
    } catch (e) {
      toast.error("❌ Hubo un error al crear el juego.");
      console.error(e);
    }
  };

  return (
  <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title-crear">
    <div className="crear-juego-form">
      <div className="modal-head">
        <h1 id="modal-title-crear" className="modal-title">Nuevo juego</h1>
        <button
          className="modal-close"
          aria-label="Cerrar"
          onClick={() => navigate("/docente/dashboard")}
          title="Cerrar"
        >
          ✕
        </button>
      </div>

      <label className="label">Nombre del juego</label>
      <input
        type="text"
        className="input"
        placeholder="Escribe un nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <div className="switch-container" style={{ marginTop: 6 }}>
        <label className="switch-label">
          <span>{publico ? "Juego Público" : "Juego Privado"}</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={publico}
              onChange={(e) => setPublico(e.target.checked)}
            />
            <span className="slider" />
          </label>
        </label>
      </div>

      <button type="button" className="boton-dashboard" onClick={crear}>
        Crear Juego
      </button>
    </div>

    <ToastContainer position="top-center" autoClose={1200} />
  </div>
);
};

export default CrearJuego;
