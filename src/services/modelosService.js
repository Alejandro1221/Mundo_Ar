import { db, storage } from "./firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export const obtenerModelos = async () => {
  const snapshot = await getDocs(collection(db, "modelos3D"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const subirModelo = async (nombre, categoria, archivo, miniatura) => {
  const modeloRef = ref(storage, `modelos3D/${archivo.name}`);
  const miniaturaRef = ref(storage, `modelos3D/${miniatura.name}`);

  await uploadBytes(modeloRef, archivo);
  await uploadBytes(miniaturaRef, miniatura);

  const urlModelo = await getDownloadURL(modeloRef);
  const urlMiniatura = await getDownloadURL(miniaturaRef);

  const nuevoDoc = await addDoc(collection(db, "modelos3D"), {
    nombre,
    categoria,
    modelo_url: urlModelo,
    miniatura: urlMiniatura,
  });

  return { id: nuevoDoc.id, nombre, categoria, modelo_url: urlModelo, miniatura: urlMiniatura };
};

export const eliminarModelo = async (id, urlModelo, urlMiniatura) => {
  try {
    // Eliminar archivos en Firebase Storage
    const modeloRef = ref(storage, urlModelo);
    const miniaturaRef = ref(storage, urlMiniatura);

    await deleteObject(modeloRef);
    await deleteObject(miniaturaRef);

    // Eliminar registro en Firestore
    await deleteDoc(doc(db, "modelos3D", id));

    console.log(`✅ Modelo ${id} eliminado correctamente.`);
  } catch (error) {
    console.error("❌ Error al eliminar el modelo:", error);
  }
};