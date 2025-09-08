import React, { useEffect, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../services/firebaseConfig";
import { signOut } from "firebase/auth";
import { FiEdit } from "react-icons/fi";
import { actualizarJuego,obtenerJuegosPorDocente,} from "../../services/juegosService";
import { doc, getDoc } from "firebase/firestore";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { eliminarJuegoPorId } from "../../services/juegosService";
import "../../assets/styles/docente/dashboardDocente.css";

const DashboardDocente = () => {
  const [usuario, setUsuario] = useState(null);
  const [juegos, setJuegos] = useState([]);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const goTo = (path) => { setMenuOpen(false); navigate(path); };
  
  // Detectar usuario autenticado
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
  
      const nombre = await obtenerNombreDocente(user.uid);
  setUsuario({ ...user, nombre }); 
  cargarJuegos(user.uid);
});
  
    return () => unsubscribe(); 
  }, [navigate]);

  const obtenerNombreDocente = async (uid) => {
    try {
      const usuarioRef = doc(db, "docentes", uid);
      const usuarioSnap = await getDoc(usuarioRef);
      if (usuarioSnap.exists()) {
        return usuarioSnap.data().nombre;
      }
      return null;
    } catch (error) {
      console.error("Error obteniendo el nombre del docente:", error);
      return null;
    }
  };
  
  // Cargar juegos creados por el docente
  const cargarJuegos = async (uid) => {
    try {
      const juegosData = await obtenerJuegosPorDocente(uid);
      setJuegos(juegosData);
    } catch (error) {
      console.error("Error al cargar los juegos:", error);
    }
  };

  // Cambiar visibilidad del juego
  const cambiarVisibilidad = async (juegoId, nuevoEstado) => {
    try {
      await actualizarJuego(juegoId, { publico: nuevoEstado });
  
      // Actualizar estado local
      setJuegos(prev =>
        prev.map(j =>
          j.id === juegoId ? { ...j, publico: nuevoEstado } : j
        )
      );
  
      toast.info(`Cambiaste el juego a modo ${nuevoEstado ? "público" : "privado"}`);
    } catch (error) {
      console.error("❌ Error al actualizar visibilidad:", error);
      toast.error("⚠️ No se pudo actualizar la visibilidad.");
    }
  };

  // Cerrar sesión
  const handleCerrarSesion = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Hubo un problema al cerrar sesión.");
    }
  };

  
const eliminarJuego = async (juegoId) => {
  try {
    await eliminarJuegoPorId(juegoId);
    setJuegos((prevJuegos) => prevJuegos.filter((juego) => juego.id !== juegoId));
    alert("Juego eliminado exitosamente.");
  } catch (error) {
    console.error("Error al eliminar el juego:", error);
    alert("Hubo un problema al eliminar el juego.");
  }
};

const confirmarEliminacion = (juegoId, nombreJuego) => {
    toast.info(
      <div className="toast-confirmation">
        <p>¿Seguro que deseas eliminar el juego <strong>{nombreJuego}</strong>?</p>
        <div className="toast-buttons">
          <button
            className="toast-btn-confirm"
            onClick={async () => {
              await eliminarJuego(juegoId);
              toast.dismiss();
            }}
          >
            Sí, eliminar
          </button>
          <button className="toast-btn-cancel" onClick={() => toast.dismiss()}>
            Cancelar
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        icon: "❓"
      }
    );
};

const openBancoModelos = ({ desdePlantilla = false, returnTo = "/docente/dashboard" } = {}) => {
  sessionStorage.setItem("paginaAnterior", returnTo);
  setMenuOpen(false);
  navigate("/docente/banco-modelos", { state: { desdePlantilla } });
};

const openBancoSonidos = ({ desdePlantilla = false, returnTo = "/docente/dashboard" } = {}) => {
  sessionStorage.setItem("paginaAnterior", returnTo);
  setMenuOpen(false);
  navigate("/docente/banco-sonidos", { state: { desdePlantilla } });
};

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>
          {usuario?.nombre
            ? `Bienvenido, profesor ${usuario.nombre.charAt(0).toUpperCase() + usuario.nombre.slice(1)}`
            : "Bienvenido, profesor"}
        </h1>
        <div className="header-actions">
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            aria-controls="menu-drawer"
          >
            <FiMenu />
          </button>
        </div>
      </div>

      {menuOpen && <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />}

      <nav id="menu-drawer" className={`menu-drawer ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        <button className="menu-close" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú">
          <FiX />
        </button>

        <ul className="menu-list">
          <li>
            <button className="menu-item" onClick={() => { setMenuOpen(false); navigate("/docente/crear-juego"); }}>
              Crear juego
            </button>
          </li>
          <li>
            <button className="menu-item" onClick={() => openBancoModelos()}>
              Banco de Modelos
            </button>
          </li>
          <li>
            <button className="menu-item" onClick={() => openBancoSonidos()}>
              Banco de Sonidos
            </button>
          </li>
          <li>
            <button className="menu-item danger" onClick={handleCerrarSesion}>
              Cerrar sesión
            </button>
          </li>
        </ul>
      </nav>
  
      {/* Lista de Juegos */}
      <div className="bloque-juegos">
        <h3>Lista de Juegos Creados</h3>
        <div className="lista-juegos">
          {juegos.length === 0 ? (
            <p>No tienes juegos creados aún.</p>
          ) : (
            juegos.map((juego) => (
              <div
                key={juego.id}
                className={`juego-item ${juego.publico ? 'juego-publico' : 'juego-privado'}`}
              >
                <div className="juego-nombre">{juego.nombre}</div>
  
                <div className="switch-container">
                  <label className="switch-label">
                    <span>{juego.publico ? "Juego Público" : "Juego Privado"}</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={juego.publico}
                        onChange={() => cambiarVisibilidad(juego.id, !juego.publico)}
                      />
                      <span className="slider" />
                    </label>
                  </label>
                </div>
  
                <button
                  className="icono-btn"
                  onClick={() => {
                    sessionStorage.setItem("paginaAnterior", window.location.pathname);
                    navigate(`/docente/configurar-casillas/${juego.id}`);
                  }}
                  aria-label="Modificar juego"
                >
                  <FiEdit />
                </button>
                <button
            className="icono-btn eliminar-btn"
            onClick={() => confirmarEliminacion(juego.id, juego.nombre)}
            aria-label="Eliminar juego"
          >
            🗑️
          </button>
              </div>
            ))
          )}
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={1000} />
    </div>
  );  
}

export default DashboardDocente;


