import React, { useEffect, useState } from "react";
import { FiPlus, FiArrowLeft, FiMenu, FiX } from "react-icons/fi";
import { obtenerModelos, eliminarModelo } from "../../services/modelosService";
import { obtenerCategorias, eliminarCategoria} from "../../services/categoriasService"; 
import { useNavigate, useLocation } from "react-router-dom";
import ModeloItem from "../../components/ModeloItem";
import FormularioSubida from "./FormularioSubida";
import { useSeleccionModelos } from "../../hooks/useSeleccionModelos";
import "../../assets/styles/bancoModelos/bancoModelos.css";

const BancoModelos = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [modelos, setModelos] = useState([]);
  const [categorias, setCategorias] = useState(["Todos"]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
  const [categoriaAEliminar, setCategoriaAEliminar] = useState("");
  const [modelosDesvaneciendo, setModelosDesvaneciendo] = useState([]);

  const closeMenu = () => {
    setMenuOpen(false);
    setActiveModal(null);
  };

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
    texto: m.texto || ""
  }));

  const key = `modelosSeleccionados_${juegoId}_${casillaId}`;
  sessionStorage.setItem(key, JSON.stringify(nuevosSeleccionados));

  // También actualizamos el hook
  setModelosSeleccionados(nuevosSeleccionados);

  //navigate(sessionStorage.getItem("paginaAnterior") || "/docente/dashboard");
  navigate(sessionStorage.getItem("paginaAnterior") || "/docente/dashboard", {
  state: {
    juegoId,
    casillaId
  }
});

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
        <div className="acciones-derecha">
          
          <button
            className="btn-menu"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            aria-controls="menu-drawer"
          >
            <FiMenu />
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div
          className="menu-backdrop"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}


      {/* Drawer */}
      <nav
        id="menu-drawer"
        className={`menu-drawer ${menuOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="menu-header">
          <h2 id="menu-title">Menú</h2>
          <button type="button" className="menu-close" onClick={closeMenu} aria-label="Cerrar menú">
            ❌
          </button>
        </div>

        <ul className="menu-list">
          {!desdePlantilla && (
            <li>
              <button
                className="menu-item"
                onClick={() => {
                  setActiveModal("subir");
                  closeMenu();
                }}
              >
                <FiPlus /> Subir modelo
              </button>
            </li>
          )}
          <li>
            <button
              className="menu-item danger"
              onClick={() => {
                setActiveModal("eliminarCategoria");
                closeMenu();
              }}
            >
              🗑️ Eliminar categoría
            </button>
          </li>
        </ul>
      </nav>


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
