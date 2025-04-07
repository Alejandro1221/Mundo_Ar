import { db } from "./firebaseConfig";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";

const CASILLAS_VACIAS = Array(30).fill({ plantilla: null }); 

// 🔹 Función para obtener todos los juegos desde Firestore
export const obtenerJuegos = async () => {
  try {
    const juegosQuery = query(collection(db, "juegos"), where("publico", "==", true));
    const querySnapshot = await getDocs(juegosQuery); 
    const juegos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return juegos;
  } catch (error) {
    console.error("Error obteniendo juegos públicos:", error);
    return [];
  }
};

export const obtenerCasillasPorJuego = async (juegoId) => {
  try {
    const juegoRef = doc(db, "juegos", juegoId);
    const juegoSnap = await getDoc(juegoRef);

    if (juegoSnap.exists()) {
      const juegoData = juegoSnap.data();
      return juegoData.casillas || CASILLAS_VACIAS; 
    } else {
      console.warn("⚠️ El juego no existe en Firestore.");
      return CASILLAS_VACIAS; 
    }
  } catch (error) {
    console.error("❌ Error obteniendo casillas:", error);
    return CASILLAS_VACIAS; 
  }
};
