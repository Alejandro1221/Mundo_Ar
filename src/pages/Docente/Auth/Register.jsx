import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../../services/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import fondoAutenticacion from "../../../assets/images/autenticacion.png";
import "../../../assets/styles/auth.css";

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
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const usuario = userCredential.user;

      await setDoc(doc(db, "docentes", usuario.uid), {
        nombre,
        email: email.trim(),
      });

      console.log("✅ Usuario registrado:", usuario);
      alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
      navigate("/login");
    } catch (error) {
      console.error("❌ Error en el registro:", error);
      let mensajeError = "Error al registrarse.";

      switch (error.code) {
        case "auth/email-already-in-use":
          mensajeError = "⚠️ El correo ya está registrado.";
          break;
        case "auth/invalid-email":
          mensajeError = "⚠️ El correo no es válido.";
          break;
        case "auth/weak-password":
          mensajeError = "⚠️ La contraseña debe tener al menos 6 caracteres.";
          break;
        default:
          mensajeError = "⚠️ Ocurrió un error inesperado.";
      }

      setError(mensajeError);
    }
  };

  return (
    <div className="auth-container"
    style={{
      backgroundImage: `url(${fondoAutenticacion})`,
      backgroundSize: "cover", 
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundColor: "var(--pastel-azul)", 
    }}>
      <div className="auth-box register-box">
        <h1>Registro Docente</h1>
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nombre Completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="button-group">
            <button type="submit" className="auth-button secondary-btn">
              Registrarse
            </button>
            <button
              type="button"
              className="auth-button primary-btn"
              onClick={() => navigate("/login")}
            >
              Ingresar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterDocente;
