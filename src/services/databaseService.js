import { db } from "./firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";  // ✅ Agregamos `collection` y `getDocs`

const CASILLAS_VACIAS = Array(30).fill({ plantilla: null }); 

// 🔹 Función para obtener todos los juegos desde Firestore
export const obtenerJuegos = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "juegos")); 
    const juegos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("Juegos obtenidos:", juegos); 
    return juegos;
  } catch (error) {
    console.error("Error obteniendo juegos:", error);
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
