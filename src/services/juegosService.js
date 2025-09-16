import { db } from "./firebaseConfig";
import { collection, query, where, getDocs, doc, addDoc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";

// Crear juego
export const crearJuegoEnFirestore = async (nuevoJuego) => {
    return await addDoc(collection(db, "juegos"), nuevoJuego);
  };
  
  //Actualizar juego
  export const actualizarJuego = async (juegoId, data) => {
    const juegoRef = doc(db, "juegos", juegoId);
    return await updateDoc(juegoRef, data);
  };
  
  // Obtener juegos por docente
  export const obtenerJuegosPorDocente = async (uid) => {
    const juegosQuery = query(collection(db, "juegos"), where("creadoPor", "==", uid));
    const snapshot = await getDocs(juegosQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };
  
  // Obtener solo juegos públicos (para estudiantes)
  export const obtenerJuegosPublicos = async () => {
    const juegosQuery = query(collection(db, "juegos"), where("publico", "==", true));
    const snapshot = await getDocs(juegosQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };
  
  // Obtener un juego por ID
  export const obtenerJuegoPorId = async (juegoId) => {
    const juegoRef = doc(db, "juegos", juegoId);
    const docSnap = await getDoc(juegoRef);
    return docSnap.exists() ? docSnap.data() : null;
  };

  
// Eliminar un juego
export const eliminarJuegoPorId = async (juegoId) => {
  const juegoRef = doc(db, "juegos", juegoId);
  await deleteDoc(juegoRef);
  return true;
};