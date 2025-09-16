import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {obtenerSonidos,obtenerCategorias,eliminarCategoria,} from "../../services/sonidoService";
import FormularioSubidaSonidos from "./FormularioSubidaSonidos";
import SonidoItem from "../../components/SonidoItem";
import BancoSonidosSeleccion from "./BancoSonidosSeleccion";
import { FiArrowLeft, FiPlus } from "react-icons/fi";
import "../../assets/styles/bancoSonidos/bancoSonidos.css";

const BancoSonidos = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const desdePlantilla = location.state?.desdePlantilla || false;

  const [sonidos, setSonidos] = useState([]);
  const [categorias, setCategorias] = useState(["Todos"]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
  const [categoriaAEliminar, setCategoriaAEliminar] = useState("");
  const [mostrarCampoEliminar, setMostrarCampoEliminar] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [listaSonidos, listaCategorias] = await Promise.all([
          obtenerSonidos(),
          obtenerCategorias(),
        ]);
        setSonidos(listaSonidos);
        setCategorias(["Todos", ...listaCategorias.map((c) => c.nombre)]);
      } catch (error) {
        console.error("❌ Error al cargar datos:", error);
      }
    };
    cargarDatos();
  }, []);

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
        alert("❌ Error al eliminar la categoría: " + error.message);
      }
    }
  };

  const sonidosFiltrados = sonidos.filter(
    (s) => categoriaSeleccionada === "Todos" || s.categoria === categoriaSeleccionada
  );

  return (
    <div className="banco-sonidos">
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
        <h2>{desdePlantilla ? "Seleccionar Sonido" : "Banco de Sonidos"}</h2>
      </div>

      {!desdePlantilla && (
        <>
          <button
            className="btn-toggle-formulario"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            {mostrarFormulario ? "◀ Ocultar Formulario" : "➕ Subir Sonido"}
          </button>

          {mostrarFormulario && (
            <FormularioSubidaSonidos setSonidos={setSonidos} />
          )}

          <div className="selector-categoria">
            <select
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            >
              {categorias.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>

            <button
              className="btn-toggle-eliminar-categoria"
              onClick={() => setMostrarCampoEliminar((prev) => !prev)}
            >
              {mostrarCampoEliminar ? "Cancelar Eliminación" : "🗑️ Eliminar Categoría"}
            </button>
          </div>

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
                {categorias.filter((cat) => cat !== "Todos").map((cat, index) => (
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

          <div className="lista-sonidos">
            {sonidosFiltrados.length > 0 ? (
              sonidosFiltrados.map((sonido) => (
                <SonidoItem
                  key={sonido.id}
                  sonido={sonido}
                  setSonidos={setSonidos}
                />
              ))
            ) : (
              <p>No hay sonidos disponibles.</p>
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

