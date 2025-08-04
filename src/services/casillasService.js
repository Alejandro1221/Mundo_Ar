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

export const actualizarCasillas = async (juegoId, index, nuevaPlantilla) => {
  try {
    const juegoRef = doc(db, "juegos", juegoId);
    const juegoSnap = await getDoc(juegoRef);

    if (juegoSnap.exists()) {
      const juegoData = juegoSnap.data();
      const nuevasCasillas = [...(juegoData.casillas || Array(30).fill({ plantilla: null }))];

      // Actualizar solo la casilla específica
      nuevasCasillas[index] = { plantilla: nuevaPlantilla };

      await updateDoc(juegoRef, { casillas: nuevasCasillas });
    }
  } catch (error) {
    console.error("Error al actualizar casilla:", error);
  }
};
export const eliminarCasilla = async (juegoId, index) => {
  try {
    const juegoRef = doc(db, "juegos", juegoId);
    const juegoSnap = await getDoc(juegoRef);

    if (juegoSnap.exists()) {
      const juegoData = juegoSnap.data();
      const nuevasCasillas = [...(juegoData.casillas || Array(30).fill({ plantilla: null }))];

      //Eliminar la plantilla de esa casilla
       nuevasCasillas[index] = { plantilla: null, configuracion: null };
      //nuevasCasillas[index] = { plantilla: null };

      await updateDoc(juegoRef, { casillas: nuevasCasillas });
    }
  } catch (error) {
    console.error("Error al eliminar plantilla de la casilla:", error);
  }
};

