import React, { useEffect, useState } from "react";
import { db, storage } from "../../services/firebaseConfig";
import { collection, onSnapshot, deleteDoc, doc, getDocs } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import "../../assets/styles/bancoModelos.css"; 

const BancoModelos = () => {
  const [modelos, setModelos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
  const [modelosSeleccionados, setModelosSeleccionados] = useState(
    JSON.parse(sessionStorage.getItem("modelosSeleccionados")) || []
  );

  const urlParams = new URLSearchParams(window.location.search);
  const origen = urlParams.get("origen") || "gestionar";
  const esPlantilla = origen !== "gestionar";

  // 🔥 Cargar categorías desde Firestore
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const snapshot = await getDocs(collection(db, "modelos3D"));
        const categoriasUnicas = new Set();

        snapshot.forEach((doc) => {
          const modelo = doc.data();
          if (modelo.categoria) categoriasUnicas.add(modelo.categoria);
        });

        setCategorias(["Todos", ...Array.from(categoriasUnicas)]);
      } catch (error) {
        console.error("❌ Error al cargar categorías:", error);
      }
    };

    cargarCategorias();
  }, []);

  // 🔥 Cargar modelos 3D en tiempo real
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "modelos3D"), (snapshot) => {
      const modelosFiltrados = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((modelo) => categoriaSeleccionada === "Todos" || modelo.categoria === categoriaSeleccionada);

      setModelos(modelosFiltrados);
    });

    return () => unsub();
  }, [categoriaSeleccionada]);

  // 🔥 Manejar selección de modelos
  const manejarSeleccion = (modelo) => {
    setModelosSeleccionados((prev) => {
      const yaSeleccionado = prev.some((m) => m.id === modelo.id);

      let nuevosModelos = yaSeleccionado
        ? prev.filter((m) => m.id !== modelo.id)
        : [...prev, modelo];

      sessionStorage.setItem("modelosSeleccionados", JSON.stringify(nuevosModelos));
      return nuevosModelos;
    });
  };

  // 🔥 Eliminar modelos de Firestore y Storage
  const eliminarModelo = async (modelo) => {
    if (!window.confirm(`¿Seguro que quieres eliminar "${modelo.nombre}"?`)) return;

    try {
      const storageRefModelo = ref(storage, modelo.url);
      const storageRefMiniatura = ref(storage, modelo.miniatura);
      await deleteObject(storageRefModelo);
      await deleteObject(storageRefMiniatura);
      await deleteDoc(doc(db, "modelos3D", modelo.id));

      alert("✅ Modelo eliminado exitosamente.");
    } catch (error) {
      console.error("❌ Error al eliminar modelo:", error);
      alert("Hubo un error al eliminar el modelo.");
    }
  };

  // 🔥 Redirigir de vuelta a la plantilla
  const volverAPlantilla = () => {
    let nombrePlantilla = origen.startsWith("plantilla_") ? origen.replace("plantilla_", "") : origen;
    window.location.href = `../../modulo_docente/Plantillas/${nombrePlantilla}/plantilla_${nombrePlantilla}.html`;
  };

  return (
    <div className="banco-modelos">
      {esPlantilla && (
        <button className="btn-volver" onClick={volverAPlantilla}>
          Volver a la Plantilla
        </button>
      )}

      <h1>Banco de Modelos</h1>

      {/* 🔹 Selector de categorías */}
      <select onChange={(e) => setCategoriaSeleccionada(e.target.value)} value={categoriaSeleccionada}>
        {categorias.map((categoria) => (
          <option key={categoria} value={categoria}>
            {categoria}
          </option>
        ))}
      </select>

      {/* 🔹 Lista de modelos */}
      <div className="lista-modelos">
        {modelos.length === 0 ? (
          <p>⚠️ No hay modelos disponibles.</p>
        ) : (
          modelos.map((modelo) => (
            <div key={modelo.id} className="modelo-item">
              <img src={modelo.miniatura} alt={modelo.nombre} className="modelo-img" />
              <p><strong>{modelo.nombre}</strong></p>
              <p><strong>Categoría:</strong> {modelo.categoria}</p>
              
              {/* 🔹 Checkbox de selección */}
              <input
                type="checkbox"
                checked={modelosSeleccionados.some((m) => m.id === modelo.id)}
                onChange={() => manejarSeleccion(modelo)}
              />
              
              {/* 🔹 Botón de eliminar */}
              {!esPlantilla && (
                <button className="btn-eliminar" onClick={() => eliminarModelo(modelo)}>
                  🗑️ Eliminar
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BancoModelos;
