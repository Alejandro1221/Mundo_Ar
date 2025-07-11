import React, { useEffect, useState } from "react";
import { obtenerModelos, eliminarModelo } from "../../services/modelosService";
import { obtenerCategorias, eliminarCategoria} from "../../services/categoriasService"; 
import { useNavigate, useLocation } from "react-router-dom";
import ModeloItem from "../../components/ModeloItem";
import FormularioSubida from "./FormularioSubida";
import { FiPlus, FiArrowLeft } from "react-icons/fi";
import { useSeleccionModelos } from "../../hooks/useSeleccionModelos";
import "../../assets/styles/bancoModelos/bancoModelos.css";

const BancoModelos = () => {
  const [modelos, setModelos] = useState([]);
  const [categorias, setCategorias] = useState(["Todos"]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState("");
  const [mostrarCampoEliminar, setMostrarCampoEliminar] = useState(false);

  

  const location = useLocation();
  const navigate = useNavigate();
  const desdePlantilla = Boolean(location.state?.desdePlantilla);
    //const { juegoId, casillaId } = location.state || {};
    const juegoId = location.state?.juegoId || sessionStorage.getItem("juegoId");
    const casillaId = location.state?.casillaId || sessionStorage.getItem("casillaId");

    console.log("🧩 BancoModelos → juegoId:", juegoId, "| casillaId:", casillaId);

    const { modelosSeleccionados, setModelosSeleccionados } = useSeleccionModelos(juegoId, casillaId);
  useEffect(() => {
      const cargarDatos = async () => {
        try {
          const [modelosCargados, categoriasCargadas] = await Promise.all([
            obtenerModelos(),
            obtenerCategorias()
          ]);
  
          if (!modelosCargados) throw new Error("No se pudieron cargar los modelos");
  
          setCategorias(["Todos", ...categoriasCargadas]);
          setModelos(modelosCargados);
        } catch (error) {
          console.error("❌ Error al cargar modelos:", error);
          setModelos([]);
        }
      };
      cargarDatos();
    }, []);

  // Filtrar modelos según la categoría seleccionada
 const modelosFiltrados = modelos.filter(
    modelo => categoriaSeleccionada === "Todos" || modelo.categoria === categoriaSeleccionada
  );

  const manejarSeleccion = (modelo) => {
    setModelosSeleccionados(prev => {
      const yaSeleccionado = prev.some(m => m.id === modelo.id);
      return yaSeleccionado ? prev.filter(m => m.id !== modelo.id) : [...prev, modelo];
    });
  };

  // Confirmar selección y volver a la plantilla
const confirmarSeleccion = () => {
  const nuevosSeleccionados = modelosSeleccionados.map(m => ({
    id: m.id,
    nombre: m.nombre,
    url: m.url || m.modelo_url,
    miniatura: m.miniatura,
    categoria: m.categoria,
  }));

  const key = `modelosSeleccionados_${juegoId}_${casillaId}`;
  sessionStorage.setItem(key, JSON.stringify(nuevosSeleccionados));

  // También actualizamos el hook
  setModelosSeleccionados(nuevosSeleccionados);

  navigate(sessionStorage.getItem("paginaAnterior") || "/docente/dashboard");
};


const manejarEliminacion = async (modelo) => {
  if (window.confirm(`¿Seguro que deseas eliminar "${modelo.nombre}"?`)) {
    try {
      setModelosDesvaneciendo(prev => [...prev, modelo.id]); 
      setTimeout(async () => {
        await eliminarModelo(modelo.id, modelo.modelo_url, modelo.miniatura);
        setModelos(prev => prev.filter(m => m.id !== modelo.id));
        setModelosDesvaneciendo(prev => prev.filter(id => id !== modelo.id)); 
        console.log(`✅ Modelo "${modelo.nombre}" eliminado correctamente.`);
      }, 500); 
    } catch (error) {
      console.error("❌ Error al eliminar modelo:", error);
      alert("Hubo un error al eliminar el modelo. Inténtalo de nuevo.");
    }
  }
};


const manejarEliminacionCategoria = async () => {
  if (!categoriaAEliminar.trim()) {
    alert("⚠️ Escribe el nombre de una categoría.");
    return;
  }

  if (categoriaAEliminar === "Todos") {
    alert("⚠️ No puedes eliminar la categoría 'Todos'.");
    return;
  }

  if (window.confirm(`¿Seguro que deseas eliminar la categoría "${categoriaAEliminar}"?`)) {
    try {
      await eliminarCategoria(categoriaAEliminar);
      setCategorias(prev => prev.filter(cat => cat !== categoriaAEliminar));
      setCategoriaSeleccionada("Todos"); // Reiniciar a Todos
      setCategoriaAEliminar(""); // Limpiar input
      console.log(`✅ Categoría "${categoriaAEliminar}" eliminada correctamente.`);
    } catch (error) {
      console.error("❌ Error al eliminar categoría:", error);
      alert("Hubo un error al eliminar la categoría. Inténtalo de nuevo.");
    }
  }
};

  return (
    <div className="banco-modelos">
      <div className="encabezado-pagina">
        <button
          className="btn-volver"
          onClick={() => {
            const paginaAnterior = sessionStorage.getItem("paginaAnterior") || "/docente/dashboard";
            navigate(paginaAnterior);
          }}
        >
        <FiArrowLeft /> 
        </button>
        <h1>Banco de Modelos</h1>
      </div>

      {/* Botón para mostrar/ocultar formulario */}
      {!desdePlantilla && (
        <button
          className="btn-toggle-formulario"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          {mostrarFormulario ? (
            <>
              <FiArrowLeft /> Ocultar Formulario
            </>
          ) : (
            <>
              <FiPlus /> Subir Modelo
            </>
          )}
        </button>
      )}

      {/* Formulario de subida */}
      {!desdePlantilla && mostrarFormulario && (
        <FormularioSubida setModelos={setModelos} />
      )}

      {/* Selector de categoría + botón eliminar */}
      <div className="selector-categoria">
        <select
          onChange={(e) => setCategoriaSeleccionada(e.target.value)}
          value={categoriaSeleccionada}
        >
          {categorias.map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <button
          className="btn-toggle-eliminar-categoria"
          onClick={() => setMostrarCampoEliminar(prev => !prev)}
        >
          {mostrarCampoEliminar ? "Cancelar Eliminación" : "🗑️ Eliminar Categoría"}
        </button>
      </div>

      {/* Campo eliminar categoría */}
      {mostrarCampoEliminar && (
        <div className="campo-eliminar-categoria">
          <input
            type="text"
            list="categorias-lista"
            placeholder="Escribe una categoría a eliminar"
            value={categoriaAEliminar}
            onChange={(e) => setCategoriaAEliminar(e.target.value)}
          />
          <datalist id="categorias-lista">
            {categorias
              .filter(cat => cat !== "Todos")
              .map((cat, index) => (
                <option key={index} value={cat} />
              ))}
          </datalist>
          <button
            className="btn-eliminar-categoria"
            onClick={manejarEliminacionCategoria}
            disabled={!categoriaAEliminar.trim()}
          >
            🗑️ Confirmar Eliminar
          </button>
        </div>
      )}

      {/* Lista de modelos */}
      <div className="lista-modelos">
        {modelosFiltrados.length > 0 ? (
          modelosFiltrados.map((modelo) => (
            <ModeloItem
              key={modelo.id}
              modelo={modelo}
              esPlantilla={desdePlantilla}
              manejarSeleccion={desdePlantilla ? manejarSeleccion : null}
              manejarEliminacion={manejarEliminacion}
              seleccionado={
                desdePlantilla
                  ? modelosSeleccionados.some((m) => m.id === modelo.id)
                  : false
              }
            />
          ))
        ) : (
          <p>⚠️ No hay modelos disponibles.</p>
        )}
      </div>

      {/* Confirmar selección si viene de plantilla */}
      {desdePlantilla && (
        <button className="btn-confirmar" onClick={confirmarSeleccion}>
          ✅ Confirmar Selección
        </button>
      )}
    </div>
  );
}  

export default BancoModelos;
