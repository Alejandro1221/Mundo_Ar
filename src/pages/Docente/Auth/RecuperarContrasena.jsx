import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../services/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import fondoAutenticacion from "../../../assets/images/autenticacion.png";
import '../../../assets/styles/docente/recuperarContra.css';

const RecuperarContrasena = () => {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMensaje('Revisa tu correo para restablecer tu contraseña.');
    } catch (error) {
      console.error(' Error al enviar correo de recuperación:', error);
      setError('No se pudo enviar el correo. ¿Está bien escrito?');
    }
  };

  return (
    <div
    className="auth-container"
        style={{
            backgroundImage: `url(${fondoAutenticacion})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundColor: "var(--pastel-azul)"
        }}
        >
        <div className="auth-container">
        <div className="auth-box">
            <h1>Recuperar Contraseña</h1>
            {mensaje && <p className="success-message">{mensaje}</p>}
            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleReset}>
            <input
                type="email"
                placeholder="Correo Electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <button type="submit" className="auth-button primary-btn">
                Enviar enlace
            </button>
            <button type="button" className="auth-button secondary-btn" onClick={() => navigate('/login')}>
                Volver al inicio
            </button>
            </form>
        </div>
        </div>
    </div>
  );
};

export default RecuperarContrasena;
