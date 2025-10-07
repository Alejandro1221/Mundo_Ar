import { getAuth } from "firebase/auth";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./firebaseConfig";

const subirArchivo = async (archivo, ruta, setProgreso = () => {}) => {
    if (!archivo) throw new Error("El archivo no puede estar vacío.");

    const archivoRef = ref(storage, ruta);
    const uploadTask = uploadBytesResumable(archivoRef, archivo);

    return new Promise((resolve, reject) => {
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progreso = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (typeof setProgreso === "function") {
                    setProgreso(Math.round(progreso));
                }
            },
            (error) => reject(error),
            async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(url);
            }
        );
    });
};

const obtenerRutaDesdeURL = (url) => {
  const baseUrl = decodeURIComponent(url.split("?")[0]);
  const parts = baseUrl.split("/o/");
  return parts[1]; 
};

export const subirModelo = async (nombre, categoria, archivo, setProgreso) => {
    const auth = getAuth();
    const usuario = auth.currentUser;

    if (!usuario) {
        throw new Error("Usuario no autenticado.");
    }

    try {
        if (!archivo) {
            throw new Error("Falta el archivo.");
        }

        const rutaModelo = `modelos3D/${categoria}/${archivo.name}`;

        const urlModelo = await subirArchivo(archivo, rutaModelo, setProgreso);

        const nuevoDoc = await addDoc(collection(db, "modelos3D"), {
            nombre,
            categoria,
            modelo_url: urlModelo,
            creadoPor: usuario.email,
            fecha_creacion: new Date(),
        });

        console.log("✅ Modelo guardado en Firestore con ID:", nuevoDoc.id);

        return {
            id: nuevoDoc.id,
            nombre,
            categoria,
            modelo_url: urlModelo,
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

export const eliminarModelo = async (id, urlModelo) => {
  try {
    if (urlModelo) {
      const rutaModelo = obtenerRutaDesdeURL(urlModelo);
      await deleteObject(ref(storage, rutaModelo));
    }

    await deleteDoc(doc(db, "modelos3D", id));

    console.log(`✅ Modelo ${id} eliminado correctamente.`);
  } catch (error) {
    console.error("❌ Error al eliminar el modelo:", error);
    throw error;
  }
};

