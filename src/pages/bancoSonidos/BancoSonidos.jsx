import React, { useEffect, useState } from "react";
import {  useNavigate, useLocation } from "react-router-dom"; 
import { obtenerSonidos } from "../../services/sonidoService";
import FormularioSubidaSonidos from "./FormularioSubidaSonidos";
import SonidoItem from "../../components/SonidoItem";
import BancoSonidosSeleccion from "./BancoSonidosSeleccion";
import { FiArrowLeft } from "react-icons/fi";
import "../../assets/styles/bancoSonidos/bancoSonidos.css";


const BancoSonidos = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const desdePlantilla = location.state?.desdePlantilla || false;
  const [sonidos, setSonidos] = useState([]);

  useEffect(() => {
    const cargarSonidos = async () => {
      try {
        const listaSonidos = await obtenerSonidos();
        setSonidos(listaSonidos);
      } catch (error) {
        console.error("❌ Error al cargar sonidos en BancoSonidos.jsx:", error);
      }
    };
    cargarSonidos();
  }, []); 

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
  
      {/* Contenido de la página */}
      {desdePlantilla ? (
        <BancoSonidosSeleccion onSeleccionar={(sonido) => {
          sessionStorage.setItem("sonidoSeleccionado", JSON.stringify(sonido));
          window.history.back(); // Regresa a la plantilla
        }} />
      ) : (
        <>
          <FormularioSubidaSonidos setSonidos={setSonidos} />
          <div className="lista-sonidos">
            {sonidos.length > 0 ? (
              sonidos.map((sonido) => (
                <SonidoItem key={sonido.id} sonido={sonido} setSonidos={setSonidos} />
              ))
            ) : (
              <p>No hay sonidos disponibles.</p>
            )}
          </div>
        </>
      )}
      
    </div>
  );
};

export default BancoSonidos;
