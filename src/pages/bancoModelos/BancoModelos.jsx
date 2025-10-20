import React, { useEffect, useState } from "react";
import { obtenerModelos, eliminarModelo } from "../../services/modelosService";
import { obtenerCategorias} from "../../services/categoriasService"; 
import { useNavigate, useLocation } from "react-router-dom";
import ModeloItem from "../../components/ModeloItem";
import FormularioSubida from "./FormularioSubida";
import EliminarCategoria from "./EliminarCategoria";
import { useSeleccionModelos } from "../../hooks/useSeleccionModelos";
import "../../assets/styles/bancoModelos/bancoModelos.css";
import MenuHamburguesa from "../../components/MenuHamburguesa";


const BancoModelos = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [modelos, setModelos] = useState([]);
  const [categorias, setCategorias] = useState(["Todos"]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [, setModelosDesvaneciendo] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();
  const desdePlantilla = Boolean(location.state?.desdePlantilla) || sessionStorage.getItem("seleccionandoModelos") === "1";
  const juegoId = location.state?.juegoId || sessionStorage.getItem("juegoId");
  const casillaId = location.state?.casillaId || sessionStorage.getItem("casillaId");
  const [pagina, setPagina] = useState(1);
  const TAM_PAGINA = 8;

  useEffect(() => {
    setPagina(1);
  }, [categoriaSeleccionada, busqueda]);

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

  const norm = (s = "") =>
    String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const q = norm(busqueda);
  const modelosFiltrados = modelos.filter((modelo) => {
    const coincideCategoria =
    categoriaSeleccionada === "Todos" || modelo.categoria === categoriaSeleccionada;

    const enNombre = norm(modelo.nombre).includes(q);
    const enTexto  = modelo.texto ? norm(modelo.texto).includes(q) : false;

    const coincideBusqueda = q === "" || enNombre || enTexto;

    return coincideCategoria && coincideBusqueda;
  });

  const totalPaginas = Math.max(1, Math.ceil(modelosFiltrados.length / TAM_PAGINA));
  const inicio = (pagina - 1) * TAM_PAGINA;
  const modelosVisibles = modelosFiltrados.slice(inicio, inicio + TAM_PAGINA);
  const irA = (p) => setPagina(Math.min(Math.max(1, p), totalPaginas));


const manejarSeleccion = (modelo) => {
  setModelosSeleccionados(prev => {
    const yaSeleccionado = prev.some(m => m.id === modelo.id);
    return yaSeleccionado ? prev.filter(m => m.id !== modelo.id) : [...prev, modelo];
    });
  };

const confirmarSeleccion = () => {
  if (!Array.isArray(modelosSeleccionados) || modelosSeleccionados.length === 0) {
    alert("Selecciona al menos un modelo.");
    return;
  }

  const normalizados = modelosSeleccionados
    .map(m => ({
      id: m.id,
      nombre: m.nombre,
      url: m.url ?? m.modelo_url ?? "",
      categoria: m.categoria ?? "",
      texto: m.texto ?? ""
    }))
    .filter(m => m.url);

  const key = `modelosSeleccionados_${juegoId}_${casillaId}`;
  sessionStorage.setItem(key, JSON.stringify(normalizados));
  sessionStorage.setItem("modelosSeleccionados", JSON.stringify(normalizados));

  sessionStorage.removeItem("seleccionandoModelos");
  setModelosSeleccionados(normalizados);

  const back = sessionStorage.getItem("paginaAnterior") || "/docente/configurar-casillas";
  navigate(back, { state: { juegoId, casillaId }, replace: true });
};


const manejarEliminacion = async (modelo) => {
  if (window.confirm(`¿Seguro que deseas eliminar "${modelo.nombre}"?`)) {
    try {
      setModelosDesvaneciendo(prev => [...prev, modelo.id]); 
      setTimeout(async () => {
        await eliminarModelo(modelo.id, modelo.modelo_url);
        setModelos(prev => prev.filter(m => m.id !== modelo.id));
        setModelosDesvaneciendo(prev => prev.filter(id => id !== modelo.id)); 
        console.log(`Modelo "${modelo.nombre}" eliminado correctamente.`);
      }, 500); 
    } catch (error) {
      console.error("Error al eliminar modelo:", error);
      alert("Hubo un error al eliminar el modelo. Inténtalo de nuevo.");
    }
  }
};

useEffect(() => {
  const onKey = (e) => e.key === "Escape" && setActiveModal(null);

  if (activeModal) {
    document.body.classList.add("modal-open");
    window.addEventListener("keydown", onKey);
  } else {
    document.body.classList.remove("modal-open");
    window.removeEventListener("keydown", onKey);
  }

  return () => {
    document.body.classList.remove("modal-open");
    window.removeEventListener("keydown", onKey);
  };
}, [activeModal]);


return (
  <div className="banco-modelos">
    <MenuHamburguesa showBreadcrumbs={true} />
    <h1 className="titulo-pagina">Banco de Modelos</h1>

    <div className="page-toolbar">
      {!desdePlantilla ? (
        <>
          <button className="btn btn--primary" onClick={() => setActiveModal("subir")}>
            Subir modelo
          </button>
          <button className="btn btn--danger" onClick={() => setActiveModal("eliminarCategoria")}>
            Eliminar categoría
          </button>
        </>
      ) : (
        <button className="btn btn--primary" onClick={confirmarSeleccion}>
          ✅ Confirmar selección
        </button>
      )}
    </div>
      {activeModal === "subir" && (
        <>
          <div
            className="modal-backdrop"
            onClick={() => setActiveModal(null)}
            aria-hidden="true"
          />
          <div
            className="modal-window"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-subir-titulo"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="modal-subir-titulo">Subir modelo</h2>
              <button
                type="button"
                className="menu-close"
                onClick={() => setActiveModal(null)}
                aria-label="Cerrar"
              >
                ❌
              </button>
            </div>

            <div className="modal-body">
              <FormularioSubida
                setModelos={setModelos}
                onSuccess={() => setActiveModal(null)}
              />
            </div>
          </div>
        </>
      )}

      {/* Modal: Eliminar Categoría */}
      {activeModal === "eliminarCategoria" && (
        <>
          <div className="modal-backdrop" onClick={() => setActiveModal(null)} aria-hidden="true" />
          <div
            className="modal-window"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-eliminar-titulo"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="modal-eliminar-titulo">Eliminar categoría</h2>
              <button
                type="button"
                className="menu-close"
                onClick={() => setActiveModal(null)}
                aria-label="Cerrar"
              >
                ❌
              </button>
            </div>

            <div className="modal-body">
              <EliminarCategoria
                categorias={categorias}
                onClose={() => setActiveModal(null)}
                onDeleted={(cat) => {
                  setCategorias((prev) => prev.filter((c) => c !== cat));
                  setCategoriaSeleccionada("Todos");
                }}
              />
            </div>
          </div>
        </>
      )}
      {/* Filtros: categoría + búsqueda */}
      <div className="filtros-modelos">
        <select
          value={categoriaSeleccionada}
          onChange={(e) => setCategoriaSeleccionada(e.target.value)}
          aria-label="Filtrar por categoría"
        >
          {categorias.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <div className="search">
          <input
            type="text"
            placeholder="Buscar modelo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar modelo por nombre o texto"
          />
          {busqueda && (
            <button type="button" className="btn-clear" onClick={() => setBusqueda("")}>
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="modelos-scroll">
        <div className="lista-modelos">
          {modelosFiltrados.length > 0 ? (
            modelosVisibles.map((modelo) => (
              <ModeloItem
                key={modelo.id}
                modelo={modelo}
                esPlantilla={desdePlantilla}
                manejarSeleccion={desdePlantilla ? manejarSeleccion : null}
                manejarEliminacion={!desdePlantilla ? manejarEliminacion : null}
                seleccionado={desdePlantilla ? modelosSeleccionados.some((m) => m.id === modelo.id) : false}
              />
            ))
          ) : (
            <p>No hay modelos disponibles.</p>
          )}
        </div>
      </div>

      {totalPaginas > 1 && (
          <div className="paginador">
            <button onClick={() => irA(pagina - 1)} disabled={pagina === 1}>← Anterior</button>
            <span className="info">Página {pagina} de {totalPaginas}</span>
            <button onClick={() => irA(pagina + 1)} disabled={pagina === totalPaginas}>Siguiente →</button>
          </div>
        )}

      {/* Confirmar selección si viene de plantilla */}
      {desdePlantilla && (
        <button className="btn btn--primary btn--block" onClick={confirmarSeleccion}>
          ✅ Confirmar Selección
        </button>
      )}
    </div>
  );
}  

export default BancoModelos;
