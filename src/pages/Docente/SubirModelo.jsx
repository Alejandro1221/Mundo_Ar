import React, { useState } from "react";
import { db, storage } from "../../services/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";

const SubirModelo = () => {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("Animales");
  const [modelo, setModelo] = useState(null);
  const [imagen, setImagen] = useState(null);
  const [progreso, setProgreso] = useState(0);

  const handleSubirModelo = async () => {
    if (!nombre || !modelo || !imagen) {
      alert("⚠️ Completa todos los campos.");
      return;
    }

    try {
      // Subir imagen
      const imgRef = ref(storage, `modelos3D/${nombre}_miniatura.${imagen.name.split('.').pop()}`);
      const imgUpload = await uploadBytesResumable(imgRef, imagen);
      const imgUrl = await getDownloadURL(imgUpload.ref);

      // Subir modelo
      const modeloRef = ref(storage, `modelos3D/${nombre}.${modelo.name.split('.').pop()}`);
      const modeloUpload = uploadBytesResumable(modeloRef, modelo);

      modeloUpload.on("state_changed", (snapshot) => {
        setProgreso((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      }, (error) => {
        console.error("❌ Error al subir el modelo:", error);
      }, async () => {
        const modeloUrl = await getDownloadURL(modeloUpload.snapshot.ref);

        // Guardar en Firestore
        await addDoc(collection(db, "modelos3D"), {
          nombre,
          modelo_url: modeloUrl,
          miniatura: imgUrl,
          categoria
        });

        alert("✅ Modelo subido con éxito.");
        setNombre("");
        setModelo(null);
        setImagen(null);
        setProgreso(0);
      });
    } catch (error) {
      console.error("❌ Error al subir el modelo:", error);
    }
  };

  return (
    <div>
      <h2>Subir Modelo 3D</h2>
      <input type="text" placeholder="Nombre del modelo" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
        <option value="Animales">Animales</option>
        <option value="Vehículos">Vehículos</option>
        <option value="Nueva">Nueva Categoría</option>
      </select>
      <input type="file" accept=".glb,.gltf" onChange={(e) => setModelo(e.target.files[0])} />
      <input type="file" accept="image/*" onChange={(e) => setImagen(e.target.files[0])} />
      <button onClick={handleSubirModelo}>Subir Modelo</button>
      {progreso > 0 && <p>Progreso: {Math.round(progreso)}%</p>}
    </div>
  );
};

export default SubirModelo;
