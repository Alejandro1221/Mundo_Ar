import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../services/firebaseConfig";
import { signOut } from "firebase/auth";
import { FiLogOut } from "react-icons/fi";
import { FiEdit } from "react-icons/fi";
import {crearJuegoEnFirestore,actualizarJuego,obtenerJuegosPorDocente,} from "../../services/juegosService";
import { doc, getDoc } from "firebase/firestore";
import "../../assets/styles/docente/dashboardDocente.css";

const DashboardDocente = () => {
  const [usuario, setUsuario] = useState(null);
  const [juegos, setJuegos] = useState([]);
  const [nombreJuego, setNombreJuego] = useState("");
  const navigate = useNavigate();
  const [mostrarInput, setMostrarInput] = useState(false);
  const [publico, setPublico] = useState(false);
  

  // Detectar usuario autenticado
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
  
      const nombre = await obtenerNombreDocente(user.uid);
  setUsuario({ ...user, nombre }); // agregamos el nombre al objeto user

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

  // Crear un nuevo juego
  const crearJuego = async () => {
    if (!usuario || !usuario.uid) {  
      alert("Error: No se pudo identificar al usuario.");
      return;
    }
  
    if (!nombreJuego.trim()) {
      alert("El nombre del juego es obligatorio.");
      return;
    }
  
    try {
      const nuevoJuego = {
        nombre: nombreJuego,
        casillas: Array(30).fill({ configuracion: null }),
        creadoPor: usuario.uid,
        fechaCreacion: new Date(),
        publico: publico,
      };
  
      const juegosExistentes = juegos.map(j => j.nombre.toLowerCase());
      if (juegosExistentes.includes(nombreJuego.toLowerCase())) {
        alert("⚠️ Ya existe un juego con ese nombre.");
        return;
      }
  
      await crearJuegoEnFirestore(nuevoJuego);
      alert(`Juego "${nombreJuego}" creado exitosamente.`);
      setNombreJuego("");
      cargarJuegos(usuario.uid);
    } catch (error) {
      console.error("Error al crear el juego:", error);
      alert("Hubo un error al crear el juego.");
    }
  };
  

  // Cambiar visibilidad del juego
  const cambiarVisibilidad = async (juegoId, nuevoEstado) => {
    try {
      await actualizarJuego(juegoId, { publico: nuevoEstado });
  
      // 🔄 Actualizar estado local
      setJuegos(prev =>
        prev.map(j =>
          j.id === juegoId ? { ...j, publico: nuevoEstado } : j
        )
      );
  
      console.log(`✅ Visibilidad del juego actualizada: ${nuevoEstado}`);
    } catch (error) {
      console.error("❌ Error al actualizar visibilidad:", error);
      alert("No se pudo actualizar la visibilidad.");
    }
  };
  
  // Cerrar sesión
  const handleCerrarSesion = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Hubo un problema al cerrar sesión.");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>
          {usuario?.nombre
            ? `Bienvenido profe ${usuario.nombre.charAt(0).toUpperCase() + usuario.nombre.slice(1)}`
            : "Bienvenido profe"}
        </h1>
        <button className="boton-logout" onClick={handleCerrarSesion}>
          <FiLogOut />
          Cerrar sesión
        </button>
      </div>
  
      {/* Crear un nuevo juego */}
      <div className="crear-juego-form">
        {mostrarInput && (
          <>
            <label className="label">Nombre del juego</label>
            <input
              type="text"
              className="input"
              placeholder="Escribe un nombre"
              value={nombreJuego}
              onChange={(e) => setNombreJuego(e.target.value)}
            />
            {/* Switch público */}
            <div className="switch-container">
              <label className="switch-label">
                <span>Juego Público</span>
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
          </>
        )}
  
        <button
          type="button"
          className="boton"
          onClick={() => {
            if (!mostrarInput) {
              setMostrarInput(true);
            } else if (nombreJuego.trim() !== "") {
              crearJuego();
              setMostrarInput(false);
            }
          }}
        >
          Crear Juego
        </button>
      </div>
  
      {/* Lista de Juegos como bloque estilizado */}
      <div className="bloque-juegos">
        <h3>Lista de Juegos Creados</h3>
        <div className="lista-juegos">
          {juegos.length === 0 ? (
            <p>No tienes juegos creados aún.</p>
          ) : (
            juegos.map((juego) => (
              <div key={juego.id} className="juego-item">
                <div className="juego-nombre">{juego.nombre}</div>
  
                <div className="switch-container">
                  <label className="switch-label">
                    <span>Público</span>
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
              </div>
            ))
          )}
        </div>
      </div>
  
      {/* Opciones finales */}
      <div className="opciones-bancos">
        <button
          className="boton"
          onClick={() => {
            sessionStorage.setItem("paginaAnterior", "/docente/dashboard");
            navigate("/docente/banco-modelos", { state: { desdePlantilla: false } });
          }}
        >
          Banco de Modelos
        </button>
  
        <button
          className="boton"
          onClick={() => {
            sessionStorage.setItem("paginaAnterior", "/docente/dashboard");
            navigate("/docente/banco-sonidos", { state: { desdePlantilla: false } });
          }}
        >
          Banco de Sonidos
        </button>
      </div>
    </div>
  );
}

export default DashboardDocente;


