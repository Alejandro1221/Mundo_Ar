import React from "react";
import { Link } from "react-router-dom";
import Background from "../components/Background"; 
import "../assets/styles/home.css";

const Home = () => {
  return (
    <div className="home-container">
      <Background /> 
      <h1>¡Bienvenido a Mundo AR!</h1>
      <h2>Elige tu rol para comenzar</h2>

      <div className="home-buttons">
        <Link to="/login" className="role-btn" aria-label="Iniciar sesión como docente">
          Docente
        </Link>
        <Link to="/estudiante/login" className="role-btn" aria-label="Acceder como estudiante">
          Estudiante
        </Link>
      </div>

      <footer className="home-footer">
        © 2025 Mundo AR. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default Home;

