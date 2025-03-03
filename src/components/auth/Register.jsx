import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../services/firebaseConfig"; 
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "../../assets/styles/auth.css"; 

const RegisterDocente = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); 

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const usuario = userCredential.user;

      await setDoc(doc(db, "docentes", usuario.uid), {
        nombre: nombre,
        email: email,
      });

      console.log("✅ Usuario registrado:", usuario);
      alert("¡Registro exitoso! Ahora puedes iniciar sesión.");

      navigate("/login"); 

    } catch (error) {
      console.error("❌ Error en el registro:", error);
      setError("Error al registrarse: " + error.message);
    }
  };

  return (
    <div className="auth-container"> 
      <div className="auth-box register-box"> 
        <h1>Registro Docente</h1>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleRegister}>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            placeholder="Nombre Completo"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Correo Electrónico"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Contraseña"
          />

            <div className="button-group">
                <button type="submit" className="auth-button primary-btn">Registrarse</button>
                <button type="button" className="auth-button secondary-btn" onClick={() => navigate("/login")}>Ingresar</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterDocente;
