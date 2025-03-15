import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerJuegos } from "../../services/databaseService"; // ✅ Importamos la función desde `databaseService.js`

const DashboardEstudiante = () => {
  const navigate = useNavigate();
  const [juegos, setJuegos] = useState([]);

  useEffect(() => {
    const cargarJuegos = async () => {
      const juegosObtenidos = await obtenerJuegos();
      setJuegos(juegosObtenidos);
    };
    cargarJuegos();
  }, []);

  return (
    <div className="dashboard-estudiante">
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
