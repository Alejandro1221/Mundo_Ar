import React from "react";
import { Link } from "react-router-dom";
import "../assets/styles/home.css"; 
import logoMundoAR from "../assets/images/logo.png";
import homeBackground from "../assets/images/home.png"; 

const Home = () => {
  return (
    <div
      className="home-container"
      style={{
        backgroundImage: `url(${homeBackground})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center bottom',
        backgroundColor: 'var(--pastel-azul)', 
      }}
    >
      <div className="home-content">

      <img src={logoMundoAR} alt="Logo Mundo AR" className="logo-home" />
        <h1>¡Bienvenido a Mundo AR!</h1>
        <h2>Elige tu rol para comenzar</h2>

        <div className="home-buttons">
          <Link to="/login" className="role-btn docente" aria-label="Iniciar sesión como docente">
            Docente
          </Link>
          <Link to="/estudiante/login" className="role-btn estudiante" aria-label="Acceder como estudiante">
            Estudiante
          </Link>
        </div>
      </div>

      <footer className="home-footer">
        © 2025 Mundo AR. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default Home;
