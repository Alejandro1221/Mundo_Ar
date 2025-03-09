import { db } from "./firebaseConfig";
import { collection, getDocs, addDoc } from "firebase/firestore";

const CATEGORIAS_COLLECTION = "categorias"; // Nombre de la colección en Firestore

// 🔹 Obtener categorías existentes desde Firestore
export const obtenerCategorias = async () => {
  try {
    const snapshot = await getDocs(collection(db, CATEGORIAS_COLLECTION));
    return snapshot.docs.map(doc => doc.data().nombre);
  } catch (error) {
    console.error("❌ Error al obtener categorías:", error);
    return [];
  }
};

// 🔹 Agregar una nueva categoría a Firestore
export const agregarCategoria = async (nombreCategoria) => {
  try {
    await addDoc(collection(db, CATEGORIAS_COLLECTION), { nombre: nombreCategoria });
    console.log(`✅ Categoría "${nombreCategoria}" agregada correctamente.`);
  } catch (error) {
    console.error("❌ Error al agregar categoría:", error);
  }
};
