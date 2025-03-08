import { getAuth } from "firebase/auth";
import { db, storage } from "./firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// 🔹 Función para subir modelos
export const subirModelo = async (nombre, categoria, archivo, miniatura, setProgreso) => {
    const auth = getAuth();
    const usuario = auth.currentUser;

    if (!usuario) {
        alert("⚠️ Debes iniciar sesión para subir modelos.");
        console.error("❌ Usuario no autenticado.");
        return;
    }

    console.log(`🔹 Usuario autenticado: ${usuario.email}`);
    console.log("📂 Datos del modelo:", { nombre, categoria, archivo, miniatura });

    // 🔥 Verifica que los archivos existan antes de subir
    if (!archivo || !miniatura) {
        console.error("❌ Error: archivo o miniatura están vacíos.");
        return;
    }

    const imagenPath = `modelos3D/${nombre}_miniatura.${miniatura.name.split('.').pop()}`;
    const modeloPath = `modelos3D/${nombre}.${archivo.name.split('.').pop()}`;

    try {
        // 📤 Subir la miniatura
        console.log("📤 Subiendo miniatura...");
        const miniaturaRef = ref(storage, imagenPath);
        await uploadBytes(miniaturaRef, miniatura);
        const urlMiniatura = await getDownloadURL(miniaturaRef);
        console.log("✅ Miniatura subida:", urlMiniatura);

        // 📤 Subir el modelo 3D
        console.log("📤 Subiendo modelo 3D...");
        const modeloRef = ref(storage, modeloPath);
        await uploadBytes(modeloRef, archivo);
        const urlModelo = await getDownloadURL(modeloRef);
        console.log("✅ Modelo subido correctamente:", urlModelo);

        // 📂 Guardar en Firestore
        console.log("📂 Guardando en Firestore...");
        const nuevoDoc = await addDoc(collection(db, "modelos3D"), {
            nombre,
            categoria,
            modelo_url: urlModelo,
            miniatura: urlMiniatura,
            creadoPor: usuario.uid
        });

        console.log("✅ Modelo guardado en Firestore con ID:", nuevoDoc.id);

        return { id: nuevoDoc.id, nombre, categoria, modelo_url: urlModelo, miniatura: urlMiniatura };
    } catch (error) {
        console.error("❌ Error en subirModelo():", error);
    }
};

// 🔹 Función para obtener modelos
export const obtenerModelos = async () => {
  try {
      const snapshot = await getDocs(collection(db, "modelos3D"));

      if (snapshot.empty) {
          console.warn("⚠️ No hay modelos en Firestore.");
          return []; // 🔥 Devolver un array vacío evita errores en BancoModelos.jsx
      }

      const modelos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("✅ Modelos obtenidos:", modelos);
      return modelos;
  } catch (error) {
      console.error("❌ Error al obtener modelos:", error);
      return []; // 🔥 Evita que `modelos` sea `undefined`
  }
};

// 🔹 Función para eliminar modelos
export const eliminarModelo = async (id, urlModelo, urlMiniatura) => {
    try {
        const modeloRef = ref(storage, urlModelo);
        const miniaturaRef = ref(storage, urlMiniatura);

        await deleteObject(modeloRef);
        await deleteObject(miniaturaRef);

        await deleteDoc(doc(db, "modelos3D", id));

        console.log(`✅ Modelo ${id} eliminado correctamente.`);
    } catch (error) {
        console.error("❌ Error al eliminar el modelo:", error);
    }
};
