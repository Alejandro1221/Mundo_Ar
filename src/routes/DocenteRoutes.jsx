import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RecuperarContrasena from "../pages/Docente/Auth/RecuperarContrasena";
import DashboardDocente from "../pages/Docente/DashboardDocente";
import CrearJuego from "../pages/Docente/CrearJuego";
import BancoModelos from "../pages/bancoModelos/BancoModelos.jsx";
import BancoSonidos from "../pages/bancoSonidos/BancoSonidos.jsx";
import ConfigurarCasillas from "../pages/Docente/ConfigurarCasillas.jsx";

// Plantillas
import ModeloSonido from "../templates/ModeloSonido";
import ClasificacionModelos from "../templates/ClasificacionModelos";
import RompecabezasModelo from "../templates/RompecabezasModelo";
import ModeloTexto from "../templates/ModeloTexto";
import CasillaSorpresa from "../templates/CasillaSorpresa";

export default function DocenteRoutes() {
  useEffect(() => {
    sessionStorage.setItem("rolActivo", "docente");
  }, []);
  
  return (
    <Routes>
      <Route path="recuperar" element={<RecuperarContrasena />} />
      <Route path="dashboard" element={<DashboardDocente />} />
      <Route path="crear-juego" element={<CrearJuego />} />
      <Route path="banco-modelos" element={<BancoModelos />} />
      <Route path="banco-sonidos" element={<BancoSonidos />} />

      {/* Rutas de plantillas (más específicas) */}
      <Route path="configurar-casillas/:juegoId/plantilla-sonido-modelo" element={<ModeloSonido />} />
      <Route path="configurar-casillas/:juegoId/clasificacion-modelos" element={<ClasificacionModelos />} />
      <Route path="configurar-casillas/:juegoId/rompecabezas-modelo" element={<RompecabezasModelo />} />
      <Route path="configurar-casillas/:juegoId/modelo-texto" element={<ModeloTexto />} />
      <Route path="configurar-casillas/:juegoId/casilla-sorpresa" element={<CasillaSorpresa />} />

      {/* Alias que redirigen según juegoId en sessionStorage */}
      <Route
        path="plantilla-sonido-modelo"
        element={<Navigate to={`/docente/configurar-casillas/${sessionStorage.getItem("juegoId") || ""}/plantilla-sonido-modelo`} replace />}
      />
      <Route
        path="clasificacion-modelos"
        element={<Navigate to={`/docente/configurar-casillas/${sessionStorage.getItem("juegoId") || ""}/clasificacion-modelos`} replace />}
      />
      <Route
        path="rompecabezas-modelo"
        element={<Navigate to={`/docente/configurar-casillas/${sessionStorage.getItem("juegoId") || ""}/rompecabezas-modelo`} replace />}
      />
      <Route
        path="modelo-texto"
        element={<Navigate to={`/docente/configurar-casillas/${sessionStorage.getItem("juegoId") || ""}/modelo-texto`} replace />}
      />
      <Route
        path="casilla-sorpresa"
        element={<Navigate to={`/docente/configurar-casillas/${sessionStorage.getItem("juegoId") || ""}/casilla-sorpresa`} replace />}
      />

      {/* ÚNICA ruta genérica de configurar casillas (con casillaId opcional) */}
      <Route path="configurar-casillas/:juegoId/:casillaId?" element={<ConfigurarCasillas />} />

      {/* Fallback SIEMPRE al final */}
      <Route path="*" element={<Navigate to="/docente/dashboard" replace />} />
    </Routes>
  );
}
