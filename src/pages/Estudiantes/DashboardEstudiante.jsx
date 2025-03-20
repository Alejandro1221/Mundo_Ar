import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerJuegos } from "../../services/databaseService"; 
import "../../assets/styles/estudiante/dashboardEstudiante.css"; 


const DashboardEstudiante = () => {
  const navigate = useNavigate();
  const [juegos, setJuegos] = useState([]);
  const [username, setUsername] = useState("");

  useEffect(() => {

    const nombreGuardado = localStorage.getItem("usernameEstudiante");
    if(nombreGuardado) {
      setUsername(nombreGuardado);
    }

    const cargarJuegos = async () => {
      const juegosObtenidos = await obtenerJuegos();
      setJuegos(juegosObtenidos);
    };
    cargarJuegos();
  }, []);

  return (
    <div className="dashboard-estudiante">
      <h1>Bienvenido, {username || "Estudiante"} 👋</h1> 
      <h2>Selecciona un Juego</h2>
      <div className="lista-juegos">
        {juegos.length > 0 ? (
          juegos.map((juego) => (
            <div
              key={juego.id}
              className="juego-item"
              onClick={() => {
                sessionStorage.setItem("juegoId", juego.id);
                navigate(`/estudiante/seleccionar-casilla`);
              }}
            >
              <h3>{juego.nombre}</h3>
              <p>{juego.descripcion || "Sin descripción"}</p>
            </div>
          ))
        ) : (
          <p>No hay juegos disponibles.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardEstudiante;
