import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../services/firebaseConfig";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import "../../assets/styles/dashboardDocente.css";

const DashboardDocente = () => {
  const [usuario, setUsuario] = useState(null);
  const [juegos, setJuegos] = useState([]);
  const [nombreJuego, setNombreJuego] = useState("");
  const navigate = useNavigate();

  // Detectar usuario autenticado
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
  
      setUsuario(user);
      const usuarioRef = doc(db, "docentes", user.uid);
      const usuarioSnap = await getDoc(usuarioRef);
  
      if (usuarioSnap.exists()) {
        setUsuario((prev) => ({ ...prev, nombre: usuarioSnap.data().nombre }));
      }
  
      cargarJuegos(user.uid);
    });
  
    return () => unsubscribe(); 
  }, [navigate]);
  

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
  
      await setDoc(doc(db, "juegos", nombreJuego), nuevoJuego);
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
      <h1>Bienvenido, {usuario?.nombre || usuario?.email}</h1>

      <button className="logout-btn" onClick={handleCerrarSesion}>
        Cerrar Sesión
      </button>

      {/* Crear un nuevo juego */}
      <form onSubmit={crearJuego} className="crear-juego-form">
        <input
          type="text"
          placeholder="Nombre del juego"
          value={nombreJuego}
          onChange={(e) => setNombreJuego(e.target.value)}
        />
        <button type="submit">Crear Juego</button>
      </form>

      {/* Lista de juegos */}
      <div className="lista-juegos">
        {juegos.length === 0 ? (
          <p>No tienes juegos creados aún.</p>
        ) : (
          juegos.map((juego) => (
            <div key={juego.id} className="juego-item">
              <span>{juego.nombre}</span>
              {/*<button onClick={() => navigate(`/docente/configurar-casillas/${juego.id}`)}>Configurar</button>*/}
              <button onClick={() => {
                sessionStorage.setItem("paginaAnterior", window.location.pathname);
                  navigate(`/docente/configurar-casillas/${juego.id}`);
              }}>
                Configurar
              </button>
            </div>
          ))
        )}
      </div>

      
      <div className="opciones-bancos">
        <button onClick={() => {
            sessionStorage.setItem("paginaAnterior", "/docente/dashboard"); // ✅ Guardar referencia al Dashboard
            navigate("/docente/banco-modelos", { state: { desdePlantilla: false } });
        }}>
          Banco de Modelos
        </button>

        <button onClick={() => {
          sessionStorage.setItem("paginaAnterior", "/docente/dashboard");
          navigate("/docente/banco-sonidos", { state: { desdePlantilla: false } });
        }}>
          Banco de Sonidos
        </button>
      </div>
    </div>
  );
};

export default DashboardDocente;
