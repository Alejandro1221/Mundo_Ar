import { getAuth } from "firebase/auth";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
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
        if (typeof setProgreso === "function") setProgreso(Math.round(progreso));
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
};

// Nombre único para evitar colisiones en Storage
const nombreUnico = (nombreOriginal) => {
  const ext = nombreOriginal.includes(".") ? nombreOriginal.split(".").pop() : "glb";
  const base = nombreOriginal.replace(/\.[^.]+$/, "");
  const uid = Math.random().toString(36).slice(2, 8);
  return `${base}_${Date.now()}_${uid}.${ext}`;
};

const obtenerRutaDesdeURL = (url) => {
  const baseUrl = decodeURIComponent(url.split("?")[0]);
  const parts = baseUrl.split("/o/");
  return parts[1]; 
};

/* ===== Crear ===== */
export const subirModelo = async (nombre, categoria, archivo, setProgreso) => {
  const auth = getAuth();
  const usuario = auth.currentUser;
  if (!usuario) throw new Error("Usuario no autenticado.");
  if (!archivo) throw new Error("Falta el archivo.");

  try {
    const rutaModelo = `modelos3D/${categoria}/${nombreUnico(archivo.name)}`;
    const urlModelo = await subirArchivo(archivo, rutaModelo, setProgreso);

    const nuevoDoc = await addDoc(collection(db, "modelos3D"), {
      nombre,
      categoria,
      modelo_url: urlModelo,
      creadoPor: usuario.email,
      fecha_creacion: new Date(),
    });

    return { id: nuevoDoc.id, nombre, categoria, modelo_url: urlModelo };
  } catch (error) {
    console.error("❌ Error en subirModelo():", error);
    throw error;
  }
};

/* ===== Leer ===== */
export const obtenerModelos = async () => {
  try {
    const snapshot = await getDocs(collection(db, "modelos3D"));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("❌ Error al obtener modelos:", error);
    return [];
  }
};

/* ===== Editar metadatos ===== */
export const actualizarModelo = async (id, dataParcial) => {
  if (!id) throw new Error("Falta el id del modelo.");
  await updateDoc(doc(db, "modelos3D", id), dataParcial);
  return { id, ...dataParcial };
};

/* ===== Reemplazar archivo 3D ===== */
export const reemplazarArchivoModelo = async ({
  id,
  archivoNuevo,
  categoriaDestino,
  urlAnterior,
  setProgreso = () => {},
}) => {
  if (!id) throw new Error("Falta el id del modelo.");
  if (!archivoNuevo) throw new Error("Falta el archivo nuevo.");
  if (!categoriaDestino) throw new Error("Falta la categoría destino.");

  // 1) Subir nuevo archivo
  const nombre = nombreUnico(archivoNuevo.name || "modelo.glb");
  const rutaNueva = `modelos3D/${categoriaDestino}/${nombre}`;
  const urlNueva = await subirArchivo(archivoNuevo, rutaNueva, setProgreso);

  // 2) Borrar archivo anterior (opcional)
  if (urlAnterior) {
    try {
      const rutaAnterior = obtenerRutaDesdeURL(urlAnterior);
      await deleteObject(ref(storage, rutaAnterior));
    } catch (e) {
      console.warn("No se pudo borrar el archivo anterior (continuando):", e);
    }
  }

  // 3) Actualizar Firestore
  await updateDoc(doc(db, "modelos3D", id), {
    modelo_url: urlNueva,
    categoria: categoriaDestino,
  });

  return { id, modelo_url: urlNueva, categoria: categoriaDestino };
};

/* ===== Eliminar ===== */
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

