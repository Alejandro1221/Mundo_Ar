import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../../../services/firebaseConfig";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import fondoAutenticacion from "../../../assets/images/autenticacion.png";
import "../../../assets/styles/auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      console.log("✅ Usuario autenticado:", userCredential.user);
      alert("¡Inicio de sesión exitoso!");
      navigate("/docente/dashboard");
    } catch (error) {
      console.error("❌ Error durante el inicio de sesión:", error);
      let mensajeError = "Error al iniciar sesión.";

      switch (error.code) {
        case "auth/wrong-password":
          mensajeError = "❌ Contraseña incorrecta. Intenta de nuevo.";
          break;
        case "auth/user-not-found":
          mensajeError = "No se encontró una cuenta con este correo.";
          break;
        case "auth/invalid-email":
          mensajeError = "El formato del correo es inválido.";
          break;
        default:
          mensajeError = "Ocurrió un error inesperado. Inténtalo más tarde.";
      }

      setError(mensajeError);
    }
  };

  const iniciarSesionConGoogle = async () => {
    setError("");
    const provider = new GoogleAuthProvider();

    try {
      const resultado = await signInWithPopup(auth, provider);
      const usuario = resultado.user;

      console.log("✅ Sesión con Google:", usuario);
      alert("¡Inicio de sesión exitoso con Google!");
      navigate("/docente/dashboard");
    } catch (error) {
      console.error("❌ Error al iniciar sesión con Google:", error);
      setError("Ocurrió un error al iniciar sesión con Google.");
    }
  };

  return (
    <div className="auth-container" style={{
      backgroundImage: `url(${fondoAutenticacion})`,
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundColor: "var(--pastel-azul)"
    }}>
      <div className="auth-box login-box">
        <h1>Ingreso Docente</h1>
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

        <div className="button-group">
          <button type="button" className="auth-button google-signin-btn" onClick={iniciarSesionConGoogle}>
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google icon" style={{ width: "20px", marginRight: "10px" }} />
            Iniciar sesión con Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
