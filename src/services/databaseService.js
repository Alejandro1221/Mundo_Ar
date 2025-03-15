import { db } from "./firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

// Función para obtener todos los juegos desde Firestore
export const obtenerJuegos = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "juegos"));
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
