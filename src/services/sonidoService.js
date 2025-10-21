import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"; 
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore";
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
    const sonidoRef = ref(storage, url) 
    await deleteObject(sonidoRef);

    // Eliminar de Firestore
    await deleteDoc(doc(db, "sonidos", id));
  } catch (error) {
    throw new Error("Error al eliminar el sonido: " + error.message);
  }
};

export const eliminarCategoria = async (nombre) => {
  const snapshot = await getDocs(query(collection(db, "categoriasSonidos"), where("nombre", "==", nombre.trim().toLowerCase())));
  if (snapshot.empty) throw new Error("Categoría no encontrada.");
  await deleteDoc(snapshot.docs[0].ref);
};


export const reemplazarArchivoSonido = async (id, file, oldUrl) => {
  if (!id || !file) throw new Error("ID y archivo son obligatorios.");

  const ext = file.name.split(".").pop().toLowerCase();
  if (ext !== "mp3") throw new Error("Solo se permiten archivos .mp3");

  // Subir nuevo archivo
  const nuevoRef = ref(storage, `sonidos/${Date.now()}_${file.name}`);
  const uploadTask = uploadBytesResumable(nuevoRef, file);

  const url = await new Promise((resolve, reject) => {
    uploadTask.on("state_changed",
      () => {},
      (err) => reject(err),
      async () => {
        const nuevaUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(nuevaUrl);
      }
    );
  });

  // Actualizar Firestore con la nueva URL
  await updateDoc(doc(db, "sonidos", id), { url });

 
  if (oldUrl) {
    try {
      const oldRef = ref(storage, oldUrl);
      await deleteObject(oldRef);
    } catch (e) {
      console.warn("No se pudo borrar el archivo anterior:", e?.message || e);
    }
  }

  return { id, url };
};


export const actualizarSonido = async (id, data) => {
  if (!id || !data || typeof data !== "object") {
    throw new Error("Parámetros inválidos para actualizar el sonido.");
  }
  const docRef = doc(db, "sonidos", id);
  await updateDoc(docRef, data);
  return { id, ...data };
};