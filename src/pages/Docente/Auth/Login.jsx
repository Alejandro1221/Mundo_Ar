import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../../../services/firebaseConfig"; // Importar Firebase
import { signInWithEmailAndPassword } from "firebase/auth";
import "../../../assets/styles/auth.css";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Para redirigir después del login

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      console.log("✅ Usuario autenticado:", userCredential.user);
      alert("¡Inicio de sesión exitoso!");

      // Redirigir al dashboard del docente después del login
      navigate("/docente/dashboard");
    } catch (error) {
      console.error("❌ Error durante el inicio de sesión:", error);
      let mensajeError = "Error al iniciar sesión.";

      switch (error.code) {
        case "auth/wrong-password":
          mensajeError = "❌ Contraseña incorrecta. Intenta de nuevo.";
          break;
        case "auth/user-not-found":
          mensajeError = "⚠️ No se encontró una cuenta con este correo.";
          break;
        case "auth/invalid-email":
          mensajeError = "⚠️ El formato del correo es inválido.";
          break;
        default:
          mensajeError = "⚠️ Ocurrió un error inesperado. Inténtalo más tarde.";
      }

      setError(mensajeError);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box login-box">
        <h2>Ingreso Docente</h2>
        {error && <p className="error-message">{error}</p>}

          <form onSubmit={handleLogin}>
              <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />

                <div className="auth-links">
                  <Link to="/register">Registrarse</Link>
                  <Link to="/recuperar">¿Olvidaste tu contraseña?</Link>
                </div>

              <button type="submit" className="auth-button primary-btn">Ingresar</button>
          </form>
        </div>
      </div>

  );
};

export default Login;