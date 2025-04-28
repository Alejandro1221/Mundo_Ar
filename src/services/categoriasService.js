import { db } from "./firebaseConfig";
import { collection, getDocs, addDoc, deleteDoc, doc} from "firebase/firestore";

const CATEGORIAS_COLLECTION = "categorias"; // Nombre de la colección en Firestore

// Obtener categorías existentes desde Firestore
export const obtenerCategorias = async () => {
  try {
    const snapshot = await getDocs(collection(db, CATEGORIAS_COLLECTION));
    return snapshot.docs.map(doc => doc.data().nombre);
  } catch (error) {
    console.error("❌ Error al obtener categorías:", error);
    return [];
  }
};

// Agregar una nueva categoría a Firestore
export const agregarCategoria = async (nombreCategoria) => {
  try {
    await addDoc(collection(db, CATEGORIAS_COLLECTION), { nombre: nombreCategoria });
    console.log(`✅ Categoría "${nombreCategoria}" agregada correctamente.`);
  } catch (error) {
    console.error("❌ Error al agregar categoría:", error);
  }
};

// Eliminar una categoría por nombre
export const eliminarCategoria = async (nombreCategoria) => {
  try {
    const snapshot = await getDocs(collection(db, CATEGORIAS_COLLECTION));
    const categoriaDoc = snapshot.docs.find(doc => doc.data().nombre === nombreCategoria);

    if (categoriaDoc) {
      await deleteDoc(doc(db, CATEGORIAS_COLLECTION, categoriaDoc.id));
      console.log(`✅ Categoría "${nombreCategoria}" eliminada correctamente.`);
    } else {
      console.log(`⚠️ Categoría "${nombreCategoria}" no encontrada.`);
    }
  } catch (error) {
    console.error("❌ Error al eliminar categoría:", error);
  }
};
