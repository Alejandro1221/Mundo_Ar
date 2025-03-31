import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../services/firebaseConfig";
import { signOut } from "firebase/auth";
import { FiLogOut } from "react-icons/fi";
import { FiEdit } from "react-icons/fi";
import { collection, query, where, getDocs, addDoc, doc, getDoc } from "firebase/firestore";
import "../../assets/styles/docente/dashboardDocente.css";

const DashboardDocente = () => {
  const [usuario, setUsuario] = useState(null);
  const [juegos, setJuegos] = useState([]);
  const [nombreJuego, setNombreJuego] = useState("");
  const navigate = useNavigate();
  const [mostrarInput, setMostrarInput] = useState(false);

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
      const juegosQuery = query(collection(db, "juegos"), where("creadoPor", "==", uid));
      const juegosSnapshot = await getDocs(juegosQuery);

      if (juegosSnapshot.empty) {
        setJuegos([]);
      } else {
        const juegosData = juegosSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setJuegos(juegosData);
      }
    } catch (error) {
      console.error("Error al cargar los juegos:", error);
    }
  };

  // Crear un nuevo juego
  const crearJuego = async (e) => {
    e.preventDefault();
    
    // ✅ Verifica que el usuario esté definido antes de usar usuario.uid
    if (!usuario || !usuario.uid) {  
      alert("Error: No se pudo identificar al usuario. Recarga la página e intenta de nuevo.");
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
      };

      const juegosExistentes = juegos.map(j => j.nombre.toLowerCase());
      if (juegosExistentes.includes(nombreJuego.toLowerCase())) {
        alert("⚠️ Ya existe un juego con ese nombre.");
        return;
      }

      await addDoc(collection(db, "juegos"), nuevoJuego);
      alert(`Juego "${nombreJuego}" creado exitosamente.`);
      setNombreJuego(""); // Reset input
      cargarJuegos(usuario.uid);
    } catch (error) {
      console.error("Error al crear el juego:", error);
      alert("Hubo un error al crear el juego.");
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
      <button className="boton-logout" onClick={handleCerrarSesion}>
        <FiLogOut />
        Cerrar sesión
      </button>
  
      <h1>Bienvenido, {usuario?.nombre || usuario?.email}</h1>
  
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
            </>
          )}
          <button
            type="button"
            className="boton"
            onClick={() => {
              if (!mostrarInput) {
                setMostrarInput(true); // Mostrar input
              } else if (nombreJuego.trim() !== "") {
                crearJuego(); // Ejecuta la función que ya tienes
                setMostrarInput(false); // Oculta input después
              }
            }}
          >
            Crear Juego
        </button>
      </div>
          
      <h3>Lista de Juegos Creados</h3>
      <div className="lista-juegos">
        {juegos.length === 0 ? (
          <p>No tienes juegos creados aún.</p>
        ) : (
          juegos.map((juego) => (
            <div key={juego.id} className="juego-item">
              <div className="juego-nombre">{juego.nombre}</div>
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


