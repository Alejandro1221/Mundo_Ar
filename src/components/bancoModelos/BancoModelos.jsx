import React, { useEffect, useState } from "react";
import { obtenerModelos, eliminarModelo } from "../../services/modelosService";
import { obtenerCategorias } from "../../services/categoriasService"; // 🔹 Importar categorías
import ModeloItem from "./ModeloItem";
import FormularioSubida from "./FormularioSubida";
import "../../assets/styles/bancoModelos.css";
import { useNavigate, useLocation } from "react-router-dom";

const BancoModelos = () => {
  const [modelos, setModelos] = useState([]);
  const [categorias, setCategorias] = useState(["Todos"]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
  const [modelosSeleccionados, setModelosSeleccionados] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Manejo seguro de location.state para evitar errores
  const desdePlantilla = Boolean(location.state?.desdePlantilla);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [modelosCargados, categoriasCargadas] = await Promise.all([
          obtenerModelos(),
          obtenerCategorias() // 🔹 Cargar categorías dinámicamente
        ]);

        if (!modelosCargados) throw new Error("No se pudieron cargar los modelos");

        setCategorias(["Todos", ...categoriasCargadas]); // 🔹 Actualizar categorías
        setModelos(modelosCargados);
      } catch (error) {
        console.error("❌ Error al cargar modelos:", error);
        setModelos([]);
      }
    };
    cargarDatos();
  }, []);

  // 🔹 Filtrar modelos según la categoría seleccionada
  const modelosFiltrados = modelos.filter(modelo =>
    categoriaSeleccionada === "Todos" || modelo.categoria === categoriaSeleccionada
);

  const manejarSeleccion = (modelo) => {
    setModelosSeleccionados(prev => {
      const yaSeleccionado = prev.some(m => m.id === modelo.id);
      return yaSeleccionado ? prev.filter(m => m.id !== modelo.id) : [...prev, modelo];
    });
  };

  const manejarEliminacion = async (modelo) => {
    if (window.confirm(`¿Seguro que deseas eliminar "${modelo.nombre}"?`)) {
      try {
        await eliminarModelo(modelo.id, modelo.modelo_url, modelo.miniatura);
        setModelos(prev => prev.filter(m => m.id !== modelo.id));
        console.log(`✅ Modelo "${modelo.nombre}" eliminado correctamente.`);
      } catch (error) {
        console.error("❌ Error al eliminar modelo:", error);
        alert("Hubo un error al eliminar el modelo. Inténtalo de nuevo.");
      }
    }
  };

  return (
    <div className="banco-modelos">
      {!desdePlantilla && <FormularioSubida setModelos={setModelos} />}

      <h1>Banco de Modelos</h1>

      {/* 🔹 Select dinámico con categorías */}
      <select onChange={(e) => setCategoriaSeleccionada(e.target.value)} value={categoriaSeleccionada}>
        {categorias.map((cat, index) => (
          <option key={index} value={cat}>{cat}</option>
        ))}
      </select>

      <div className="lista-modelos">
        {modelosFiltrados.length > 0 ? (
          modelosFiltrados.map((modelo) => (
            <ModeloItem 
              key={modelo.id} 
              modelo={modelo} 
              esPlantilla={desdePlantilla}
              manejarSeleccion={manejarSeleccion} 
              manejarEliminacion={manejarEliminacion} 
            />
          ))
        ) : (
          <p>⚠️ No hay modelos disponibles.</p>
        )}
      </div>

      <button onClick={() => {
        const paginaAnterior = sessionStorage.getItem("paginaAnterior") || "/docente/dashboard";
        navigate(paginaAnterior);
      }}>
        Volver
      </button>
    </div>
  );
};

export default BancoModelos;
