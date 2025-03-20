import { db } from "./firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";  // ✅ Agregamos `collection` y `getDocs`

// 🔹 Función para obtener todos los juegos desde Firestore
export const obtenerJuegos = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "juegos"));  // ✅ Corrección aquí
    const juegos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("Juegos obtenidos:", juegos); // ✅ Verificar en la consola
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
      return juegoData.casillas || Array(30).fill({ plantilla: null }); // 🔹 Unificamos con módulo docente
    } else {
      console.warn("El juego no existe.");
      return Array(30).fill({ plantilla: null }); // 🔹 Ahora siempre devuelve 30 casillas
    }
  } catch (error) {
    console.error("Error obteniendo casillas:", error);
    return Array(30).fill({ plantilla: null }); // 🔹 Evitamos errores devolviendo 30 casillas vacías
  }
};

