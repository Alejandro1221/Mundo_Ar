import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { obtenerSonidos, obtenerCategorias, eliminarCategoria } from "../../services/sonidoService";
import FormularioSubidaSonidos from "./FormularioSubidaSonidos";
import SonidoItem from "../../components/SonidoItem";
import BancoSonidosSeleccion from "./BancoSonidosSeleccion";
import "../../assets/styles/bancoSonidos/bancoSonidos.css";
import MenuHamburguesa from "../../components/MenuHamburguesa";

const BancoSonidos = () => {
  const location = useLocation();
  const desdePlantilla = location.state?.desdePlantilla || false;

  const [sonidos, setSonidos] = useState([]);
  const [categorias, setCategorias] = useState(["Todos"]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
  const [categoriaAEliminar, setCategoriaAEliminar] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  // CAMBIO: paginación
  const [pagina, setPagina] = useState(1);
  const TAM_PAGINA = 8;

  const norm = (s = "") =>
    String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Cargar datos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [listaSonidos, listaCategorias] = await Promise.all([
          obtenerSonidos(),
          obtenerCategorias(),
        ]);

        setSonidos(listaSonidos || []);

        // CAMBIO: normalizar categorias a strings siempre
        const cats = (listaCategorias || [])
          .map((c) => (typeof c === "string" ? c : c?.nombre))
          .filter(Boolean);

        setCategorias(["Todos", ...cats]);
      } catch (error) {
        console.error("❌ Error al cargar datos:", error);
        setSonidos([]);
        setCategorias(["Todos"]);
      }
    };
    cargarDatos();
  }, []);

  // CAMBIO: reset de página cuando cambian filtros o búsqueda
  useEffect(() => {
    setPagina(1);
  }, [categoriaSeleccionada, busqueda]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setActiveModal(null);
    if (activeModal) {
      document.body.classList.add("modal-open");
      window.addEventListener("keydown", onKey);
    }
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [activeModal]);

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
        setCategorias((prev) => prev.filter((cat) => cat !== categoriaAEliminar));
        setCategoriaSeleccionada("Todos");
        setCategoriaAEliminar("");
        alert(`✅ Categoría "${categoriaAEliminar}" eliminada.`);
      } catch (error) {
        alert("❌ Error al eliminar la categoría: " + (error?.message || String(error)));
      }
    }
  };

  const q = norm(busqueda);
  const sonidosFiltrados = sonidos.filter((s) => {
    const okCat = categoriaSeleccionada === "Todos" || s.categoria === categoriaSeleccionada;
    const enNombre = norm(s?.nombre || "").includes(q); // CAMBIO: defensivo
    const okSearch = q === "" || enNombre;
    return okCat && okSearch;
  });

  // CAMBIO: cálculos de paginación
  const totalPaginas = Math.max(1, Math.ceil(sonidosFiltrados.length / TAM_PAGINA));
  const inicio = (pagina - 1) * TAM_PAGINA;
  const sonidosVisibles = sonidosFiltrados.slice(inicio, inicio + TAM_PAGINA);
  const irA = (p) => setPagina(Math.min(Math.max(1, p), totalPaginas));

  return (
    <div className="banco-sonidos">
      <MenuHamburguesa showBreadcrumbs={true} />

      <h1 className="titulo-pagina">
        {desdePlantilla ? "Seleccionar Sonido" : "Banco de Sonidos"}
      </h1>

      {!desdePlantilla && (
        <>
          {/* Toolbar (abre modales) */}
          <div className="page-toolbar">
            <button className="btn btn--primary" onClick={() => setActiveModal("subir")}>
              + Subir sonido
            </button>
            <button className="btn btn--danger" onClick={() => setActiveModal("eliminar")}>
              Eliminar categoría
            </button>
          </div>

          {/* Filtros */}
          <div className="filtros-sonidos">
            <select
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
              aria-label="Filtrar por categoría"
            >
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
              
            <div className="search">
              <input
                type="text"
                placeholder="Buscar sonido..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                aria-label="Buscar sonido por nombre"
              />
              {busqueda && (
                <button type="button" className="btn-clear" onClick={() => setBusqueda("")}>
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Modal: Subir sonido */}
          {activeModal === "subir" && (
            <>
              <div className="modal-backdrop" onClick={() => setActiveModal(null)} />
              <div
                className="modal-window"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-subir-titulo"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2 id="modal-subir-titulo">Subir sonido</h2>
                  <button className="menu-close" onClick={() => setActiveModal(null)} aria-label="Cerrar">❌</button>
                </div>
                <div className="modal-body">
                  <FormularioSubidaSonidos
                    setSonidos={setSonidos}
                    onSuccess={() => setActiveModal(null)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Modal: Eliminar categoría */}
          {activeModal === "eliminar" && (
            <>
              <div className="modal-backdrop" onClick={() => setActiveModal(null)} />
              <div
                className="modal-window"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-eliminar-titulo"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2 id="modal-eliminar-titulo">Eliminar categoría</h2>
                  <button className="menu-close" onClick={() => setActiveModal(null)} aria-label="Cerrar">❌</button>
                </div>
                <div className="modal-body">
                  <input
                    type="text"
                    list="categorias-lista"
                    placeholder="Escribe una categoría a eliminar"
                    value={categoriaAEliminar}
                    onChange={(e) => setCategoriaAEliminar(e.target.value)}
                    className="modal-input"
                  />
                  <datalist id="categorias-lista">
                    {categorias
                      .filter((c) => c !== "Todos")
                      .map((c) => (
                        <option key={c} value={c} />
                      ))}
                  </datalist>

                  <div className="modal-actions">
                    <button className="btn btn--outline" onClick={() => setActiveModal(null)}>
                      Cancelar
                    </button>
                    <button
                      className="btn btn--danger"
                      onClick={async () => { await manejarEliminacionCategoria(); setActiveModal(null); }}
                      disabled={!categoriaAEliminar.trim()}
                    >
                      Confirmar eliminar
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="sonidos-scroll">
            <div className="lista-sonidos">
              {sonidosFiltrados.length > 0 ? (
                sonidosVisibles.map((sonido) => (
                  <SonidoItem key={sonido.id} sonido={sonido} setSonidos={setSonidos} />
                ))
              ) : (
                <p>No hay sonidos disponibles.</p>
              )}
            </div>

          {Math.ceil(sonidosFiltrados.length / TAM_PAGINA) > 1 && (
            <div className="paginador">
              <button onClick={() => irA(pagina - 1)} disabled={pagina === 1}>← Anterior</button>
              <span className="info">Página {pagina} de {totalPaginas}</span>
              <button onClick={() => irA(pagina + 1)} disabled={pagina === totalPaginas}>Siguiente →</button>
            </div>
          )}
          </div>
        </>
      )}

      {desdePlantilla && (
        <BancoSonidosSeleccion
          onSeleccionar={(sonido) => {
            sessionStorage.setItem("sonidoSeleccionado", JSON.stringify(sonido));
            window.history.back();
          }}
        />
      )}
    </div>
  );
};

export default BancoSonidos;
