import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../services/firebaseConfig";
import { FiEdit } from "react-icons/fi";
import { actualizarJuego,obtenerJuegosPorDocente,eliminarJuegoPorId,} from "../../services/juegosService";
import { doc, getDoc } from "firebase/firestore";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../../assets/styles/docente/dashboardDocente.css"; 
import MenuHambuguesa from "../../components/MenuHamburguesa";
import CrearJuego from "./CrearJuego";

const DashboardDocente = () => {
  const [usuario, setUsuario] = useState(null);
  const [juegos, setJuegos] = useState([]);
  const navigate = useNavigate();
  const [modalCrearOpen, setModalCrearOpen] = useState(false);

  // Detectar usuario autenticado
useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async (user) => {
    if (!user) {
      if (window.location.pathname !== "/login") {
        navigate("/login", { replace: true });
      }
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

return (
  <div className="dashboard-container">
    <div className="dashboard-header">
      <div className="header-actions">
        <MenuHambuguesa showBreadcrumbs={false} />
      </div>
      <h1>
        {usuario?.nombre
          ? `¡Bienvenido, profesor ${usuario.nombre.charAt(0).toUpperCase() + usuario.nombre.slice(1)}!`
          : "¡Bienvenido, profesor!"}
      </h1>
    </div>

    {/* Lista de Juegos */}
    <div className="bloque-juegos">
      <div className="bloque-juegos__bar">
        <h3>Lista de Juegos Creados</h3>
        <button className="btn btn-primario" onClick={() => setModalCrearOpen(true)} aria-haspopup="dialog">
          Añadir juego
        </button>
      </div>

      <div className="lista-juegos">
        {juegos.length === 0 ? (
          <div className="empty-state">
            <p>No tienes juegos creados aún.</p>
            <button
              className="btn btn-primario"
                onClick={() => setModalCrearOpen(true)}
            >
              Crear tu primer juego
            </button>
          </div>
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
    <CrearJuego
      isOpen={modalCrearOpen}
      onClose={() => setModalCrearOpen(false)}
      onCreated={(nuevo) => {
        setJuegos((prev) => [nuevo, ...prev]);
        setModalCrearOpen(false);
        sessionStorage.setItem("paginaAnterior", window.location.pathname);
        navigate(`/docente/configurar-casillas/${nuevo.id}`);
      }}
    />
    <ToastContainer position="top-center" autoClose={1000} />
  </div>
);  
}

export default DashboardDocente;


