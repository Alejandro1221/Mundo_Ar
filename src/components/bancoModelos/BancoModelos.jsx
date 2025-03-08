import React, { useEffect, useState } from "react";
import { obtenerModelos, eliminarModelo } from "../../services/modelosService";
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
        const modelosCargados = await obtenerModelos();
        if (!modelosCargados) throw new Error("No se pudieron cargar los modelos");

        const categoriasUnicas = ["Todos", ...new Set(modelosCargados.map(m => m.categoria))];
        setCategorias(categoriasUnicas);
        setModelos(modelosCargados);
      } catch (error) {
        console.error("❌ Error al cargar modelos:", error);
        setModelos([]); // Evita que quede undefined
      }
    };
    cargarDatos();
  }, []);

  const manejarSeleccion = (modelo) => {
    setModelosSeleccionados(prev => {
      const yaSeleccionado = prev.some(m => m.id === modelo.id);
      return yaSeleccionado ? prev.filter(m => m.id !== modelo.id) : [...prev, modelo];
    });
  };

  const manejarEliminacion = async (modelo) => {
    if (window.confirm(`¿Seguro que deseas eliminar "${modelo.nombre}"?`)) {
      await eliminarModelo(modelo.id);
      setModelos(prev => prev.filter(m => m.id !== modelo.id));
    }
  };

  return (
    <div className="banco-modelos">
      {!desdePlantilla && <FormularioSubida setModelos={setModelos} />}

      <h1>Banco de Modelos</h1>

      <select onChange={(e) => setCategoriaSeleccionada(e.target.value)} value={categoriaSeleccionada}>
        {categorias.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <div className="lista-modelos">
        {modelos && Array.isArray(modelos) && modelos.length > 0 ? (
          modelos
            .filter((modelo) => modelo && modelo.id) // 🔥 Filtra elementos vacíos o incorrectos
            .map((modelo) => (
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

