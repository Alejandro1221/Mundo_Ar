import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import fondoAutenticacion from "../../../assets/images/autenticacion.png";
import logoMundoAR from "../../../assets/images/logo.png"; 
import "../../../assets/styles/estudiante/loginEstudiante.css";

const LoginEstudiante = () => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleIngresar = () => {
    if (username.trim() === "") {
      setError("Por favor, ingresa un nombre de usuario.");
      return;
    }

    localStorage.setItem("usernameEstudiante", username);
    navigate("/estudiante/dashboard");
  };

  return (
    <div
      className="login-estudiante-container"
      style={{
        backgroundImage: `url(${fondoAutenticacion})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundColor: "var(--pastel-azul)", // Fallback
      }}
    >
      <div className="login-content">
        <img src={logoMundoAR} alt="Logo Mundo AR" className="logo-login" />

        <h2>Ingresa tu Nombre</h2>

        <input
          type="text"
          placeholder="Nombre de usuario..."
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError(null);
          }}
          className="input-login"
        />

        {error && <p className="error-message">{error}</p>}

        <button onClick={handleIngresar} className="btn-login">
          Ingresar
        </button>
      </div>

      <footer className="footer-login">
        © 2025 Mundo AR. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default LoginEstudiante;
