import { db } from "./firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// 🔹 Obtener casillas de un juego
export const obtenerCasillas = async (juegoId) => {
  try {
    const juegoRef = doc(db, "juegos", juegoId);
    const juegoSnap = await getDoc(juegoRef);
    if (juegoSnap.exists()) {
      return juegoSnap.data().casillas || Array(30).fill({ plantilla: null });
    } else {
      return Array(30).fill({ plantilla: null });
    }
  } catch (error) {
    console.error("Error al obtener casillas:", error);
    return Array(30).fill({ plantilla: null });
  }
};

export const actualizarCasillas = async (juegoId, nuevasCasillas) => {
  try {
    const juegoRef = doc(db, "juegos", juegoId);
    const juegoSnap = await getDoc(juegoRef);
    if (juegoSnap.exists()) {
      await updateDoc(juegoRef, { casillas: nuevasCasillas });
    }
  } catch (error) {
    console.error("Error al actualizar casillas:", error);
  }
};

