import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";

const DesdeMarcador = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const juegoId = sessionStorage.getItem("juegoId");
    const casillaId = parseInt(sessionStorage.getItem("casillaId"));

    if (!juegoId || isNaN(casillaId)) return navigate("/estudiante/dashboard");

    const cargarYRedirigir = async () => {
      const ref = doc(db, "juegos", juegoId);
      const snap = await getDoc(ref);
      const plantilla = snap.data()?.casillas?.[casillaId]?.plantilla;

      const rutas = {
        "modelo-sonido": `/estudiante/actividad-modelo-sonidos/${casillaId + 1}`,
        "clasificacion-modelos": `/estudiante/actividad-clasificacion-modelos/${casillaId + 1}`,
        "rompecabezas-modelo": `/estudiante/actividad-rompecabezas/${casillaId + 1}`,
        "modelo-texto": `/estudiante/actividad-modelo-texto/${casillaId + 1}`,
        "casilla-sorpresa": `/estudiante/actividad-casilla-sorpresa/${casillaId + 1}`,
      };

      if (plantilla && rutas[plantilla]) {
        navigate(rutas[plantilla]);
      } else {
        alert("⚠️ Plantilla no encontrada.");
        navigate("/estudiante/dashboard");
      }
    };

    cargarYRedirigir();
  }, [navigate]);

  return null;
};

export default DesdeMarcador;
