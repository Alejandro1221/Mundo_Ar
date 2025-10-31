import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import { resetAR } from "../../utils/resetAR";
import { fixViewportOnce } from "../../utils/fixViewportOnce";


const normalize = (s) =>
  String(s || "").trim().toLowerCase().replace(/[_\s]+/g, "-");

const DesdeMarcador = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const juegoId = sessionStorage.getItem("juegoId");
    const casillaId = Number(sessionStorage.getItem("casillaId"));

    const goBack = (mensaje) => {
      resetAR(); 
      sessionStorage.setItem(
        "flashMsg",
        JSON.stringify({
          tipo: "warning",
          titulo: "No pudimos abrir la actividad",
          mensaje: mensaje ?? `La casilla #${casillaId + 1} no tiene una plantilla válida asignada.`,
        })
      );
      window.location.href = "/estudiante/seleccionar-casilla";
    };

    if (!juegoId || Number.isNaN(casillaId)) {
      goBack("Información incompleta del juego/casilla.");
      return;
    }

    (async () => {
      try {
        const ref = doc(db, "juegos", juegoId);
        const snap = await getDoc(ref);
        if (!snap.exists()) return goBack("El juego no existe.");

        const plantillaRaw = snap.data()?.casillas?.[casillaId]?.plantilla || "";
        const plantilla = normalize(plantillaRaw);

        const rutas = {
          "modelo-sonido": `/estudiante/actividad-modelo-sonidos/${casillaId + 1}`,
          "clasificacion-modelos": `/estudiante/actividad-clasificacion-modelos/${casillaId + 1}`,
          "rompecabezas-modelo": `/estudiante/actividad-rompecabezas/${casillaId + 1}`,
          "modelo-texto": `/estudiante/actividad-modelo-texto/${casillaId + 1}`,
          "casilla-sorpresa": `/estudiante/actividad-casilla-sorpresa/${casillaId + 1}`,
        };

        if (rutas[plantilla]) {
          navigate(rutas[plantilla]);
        } else {
          goBack(
            `La casilla #${casillaId + 1} no tiene una plantilla válida asignada${
              plantillaRaw ? ` (${plantillaRaw})` : ""
            }.`
          );
        }
      } catch (e) {
        goBack("Ocurrió un error al cargar la casilla.");
      }
    })();
  }, [navigate]);

  return null;
};

export default DesdeMarcador;
