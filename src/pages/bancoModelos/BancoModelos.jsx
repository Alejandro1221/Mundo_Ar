import React, { useEffect, useState } from "react";
import { obtenerModelos, eliminarModelo } from "../../services/modelosService";
import { obtenerCategorias } from "../../services/categoriasService"; 
import { useNavigate, useLocation } from "react-router-dom";
import ModeloItem from "../../components/ModeloItem";
import FormularioSubida from "./FormularioSubida";
import "../../assets/styles/bancoModelos/bancoModelos.css";


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

        // ✅ Si se abrió desde una plantilla, recuperar modelos seleccionados desde sessionStorage
        if (desdePlantilla) {
          const modelosGuardados = sessionStorage.getItem("modelosSeleccionados");
          if (modelosGuardados) {
            setModelosSeleccionados(JSON.parse(modelosGuardados));
          }
        }

      } catch (error) {
        console.error("❌ Error al cargar modelos:", error);
        setModelos([]);
      }
    };
    cargarDatos();
  }, [desdePlantilla]);

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

  // ✅ Confirmar selección y volver a la plantilla
  const confirmarSeleccion = () => {
    console.log("📌 Antes de guardar en sessionStorage en BancoModelos.jsx:", modelosSeleccionados);

    const modelosConURL = modelosSeleccionados.map(m => ({
        id: m.id,
        nombre: m.nombre,
        url: m.modelo_url,  
        miniatura: m.miniatura,
        categoria: m.categoria,
    }));

    sessionStorage.setItem("modelosSeleccionados", JSON.stringify(modelosConURL));

    navigate(-1); 
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
              manejarSeleccion={desdePlantilla ? manejarSeleccion : null} 
              manejarEliminacion={manejarEliminacion} 
              seleccionado={desdePlantilla ? modelosSeleccionados.some((m) => m.id === modelo.id) : false}
            />
          ))
        ) : (
          <p>⚠️ No hay modelos disponibles.</p>
        )}
      </div>

      {/* ✅ Mostrar el botón solo si está en modo selección desde una plantilla */}
      {desdePlantilla && (
        <button onClick={confirmarSeleccion}>✅ Confirmar Selección</button>
      )}


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
