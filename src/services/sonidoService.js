import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"; 
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { app } from "./firebaseConfig";


const storage = getStorage(app);
const db = getFirestore(app);
const sonidosCollection = collection(db, "sonidos");
const categoriasCollection = collection(db, "categoriasSonidos");

// Obtener todas las categorías de sonidos desde Firestore
export const obtenerCategorias = async () => {
  const snapshot = await getDocs(categoriasCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Crear una nueva categoría si no existe
export const crearCategoria = async (nombre) => {
  const nombreLower = nombre.trim().toLowerCase();
  const consulta = query(categoriasCollection, where("nombre", "==", nombreLower));
  const resultado = await getDocs(consulta);

  if (!resultado.empty) {
    throw new Error("La categoría ya existe.");
  }

  await addDoc(categoriasCollection, { nombre: nombreLower });
};

// Subir un sonido a Firebase Storage y guardar en Firestore
export const subirSonido = async (archivo, nombre, categoria, setProgreso) => {
  if (!archivo || !nombre || !categoria) {
    throw new Error("Todos los campos son obligatorios.");
  }
  
  const extension = archivo.name.split(".").pop().toLowerCase();
  if (extension !== "mp3") {
    throw new Error("Solo se permiten archivos en formato .mp3");
  }
  
  const sonidoRef = ref(storage, `sonidos/${Date.now()}_${archivo.name}`);
  const uploadTask = uploadBytesResumable(sonidoRef, archivo);

  return new Promise((resolve, reject) => {
    uploadTask.on("state_changed",
      (snapshot) => {
        const progreso = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (setProgreso) setProgreso(progreso.toFixed(2));
      },
      (error) => {
        reject(error);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        const docRef = await addDoc(sonidosCollection, { nombre, categoria, url });
        resolve({ id: docRef.id, nombre, categoria, url });
      }
    );
  });
};

export const obtenerSonidos = async () => {
  try {
    const snapshot = await getDocs(sonidosCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); 
  } catch (error) {
    console.error("❌ Error al obtener sonidos:", error);
    throw new Error("No se pudieron obtener los sonidos.");
  }
};


// Eliminar un sonido de Firebase Storage y Firestore
export const eliminarSonido = async (id, url) => {
  if (!id || !url) {
    throw new Error("ID y URL del sonido son requeridos.");
  }
  
  try {
    // Eliminar de Firebase Storage
    const sonidoRef = ref(storage, url);
    await deleteObject(sonidoRef);

    // Eliminar de Firestore
    await deleteDoc(doc(db, "sonidos", id));
  } catch (error) {
    throw new Error("Error al eliminar el sonido: " + error.message);
  }
};