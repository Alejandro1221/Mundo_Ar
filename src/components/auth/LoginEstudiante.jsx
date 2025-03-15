import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/loginEstudiante.css"; 

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
    <div className="login-estudiante">
      <h2>Ingresa tu Nombre</h2>
      <input 
        type="text" 
        placeholder="Nombre de usuario..." 
        value={username} 
        onChange={(e) => {
          setUsername(e.target.value);
          setError(null); 
        }}
      />
      {error && <p className="error-message">{error}</p>}
      <button onClick={handleIngresar}>Ingresar</button>
    </div>
  );
};

export default LoginEstudiante;
