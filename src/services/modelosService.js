import { getAuth } from "firebase/auth";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./firebaseConfig";

// 🔸 Función reutilizable interna
const subirArchivo = async (archivo, ruta) => {
    if (!archivo) throw new Error("El archivo no puede estar vacío.");
    const archivoRef = ref(storage, ruta);
    await uploadBytes(archivoRef, archivo);
    return getDownloadURL(archivoRef);
};

const obtenerRutaDesdeURL = (url) => {
  const baseUrl = decodeURIComponent(url.split("?")[0]);
  const parts = baseUrl.split("/o/");
  return parts[1]; // retorna ruta relativa
};

// 🔹 Subir modelo optimizado (con manejo claro de errores)
export const subirModelo = async (nombre, categoria, archivo, miniatura) => {
    const auth = getAuth();
    const usuario = auth.currentUser;

    if (!usuario) {
        throw new Error("Usuario no autenticado.");
    }

    console.log(`🔹 Usuario autenticado: ${usuario.email}`);
    console.log("📂 Datos del modelo:", { nombre, categoria });

    try {
        if (!archivo || !miniatura) {
            throw new Error("Falta el archivo o miniatura.");
        }

        const rutaModelo = `modelos3D/${categoria}/${archivo.name}`;
        const rutaMiniatura = `modelos3D/${categoria}/miniaturas/${miniatura.name}`;

        // 🔥 Subida en paralelo (más eficiente)
        const [urlModelo, urlMiniatura] = await Promise.all([
            subirArchivo(archivo, rutaModelo),
            subirArchivo(miniatura, rutaMiniatura)
        ]);

        const nuevoDoc = await addDoc(collection(db, "modelos3D"), {
            nombre,
            categoria,
            modelo_url: urlModelo,
            miniatura: urlMiniatura,
            creadoPor: usuario.email,
            fecha_creacion: new Date(),
        });

        console.log("✅ Modelo guardado en Firestore con ID:", nuevoDoc.id);

        return {
            id: nuevoDoc.id,
            nombre,
            categoria,
            modelo_url: urlModelo,
            miniatura: urlMiniatura
        };

    } catch (error) {
        console.error("❌ Error en subirModelo():", error);
        throw error;
    }
};



// 🔹 Obtener modelos optimizado (con manejo claro de errores)
export const obtenerModelos = async () => {
    try {
        const snapshot = await getDocs(collection(db, "modelos3D"));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("❌ Error al obtener modelos:", error);
        return [];
    }
};

export const eliminarModelo = async (id, urlModelo, urlMiniatura) => {
  try {
    const rutaModelo = obtenerRutaDesdeURL(urlModelo);
    const rutaMiniatura = obtenerRutaDesdeURL(urlMiniatura);

    await Promise.all([
      deleteObject(ref(storage, rutaModelo)),
      deleteObject(ref(storage, rutaMiniatura)),
      deleteDoc(doc(db, "modelos3D", id)),
    ]);

    console.log(`✅ Modelo ${id} eliminado correctamente.`);
  } catch (error) {
    console.error("❌ Error al eliminar el modelo:", error);
    throw error;
  }
};
