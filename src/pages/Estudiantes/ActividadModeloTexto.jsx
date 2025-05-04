/*import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import HeaderActividad from "../../components/Estudiante/HeaderActividad";

const ActividadModeloTexto = () => {
  const navigate = useNavigate();
  const { casillaId } = useParams();
  const juegoId = sessionStorage.getItem("juegoId");

  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!juegoId || !casillaId) return navigate("/estudiante/dashboard");

    const cargarDatos = async () => {
      try {
        const juegoRef = doc(db, "juegos", juegoId);
        const juegoSnap = await getDoc(juegoRef);
        if (juegoSnap.exists()) {
          const casilla = juegoSnap.data().casillas[casillaId];
          const modelosCargados = casilla?.configuracion?.modelos || [];
          setModelos(modelosCargados);
        } else {
          console.warn("❌ No se encontró el documento del juego en Firestore");
        }
      } catch (error) {
        console.error("❌ Error al cargar los datos del juego:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [juegoId, casillaId, navigate]);

  return (
    <div className="actividad-ra-container">
      <HeaderActividad titulo="Modelos y conceptos asociados" />

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="modelos-lista">
          {modelos.length > 0 ? (
            modelos.map((modelo, index) => (
              <div key={index} className="modelo-texto-card">
                <model-viewer
                  src={modelo.url}
                  alt={modelo.nombre}
                  camera-controls
                  auto-rotate
                  shadow-intensity="1"
                  style={{ width: "200px", height: "200px" }}
                ></model-viewer>
                <p><strong>{modelo.nombre}</strong></p>
                <p className="texto-concepto">📝 {modelo.texto || "Sin texto asociado"}</p>
              </div>
            ))
          ) : (
            <p>No hay modelos configurados para esta casilla.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ActividadModeloTexto;
*/