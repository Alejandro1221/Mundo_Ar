import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginEstudiante from "../pages/Estudiantes/Auth/LoginEstudiante";
import DashboardEstudiante from "../pages/Estudiantes/DashboardEstudiante";
import SeleccionarCasilla from "../pages/Estudiantes/SeleccionarCasilla";
import ActividadModeloSonido from "../pages/Estudiantes/ActividadModeloSonido";
import VistaPreviaModeloSonido from "../pages/Estudiantes/VistaPreviaModeloSonido"; 
import ActividadClasificacionModelos from "../pages/Estudiantes/ActividadClasificacionModelos"; 
import VistaPreviaClasificacionModelos from "../pages/Estudiantes/VistaPreviaClasificacionModelos";
import ActividadRompecabezas from "../pages/Estudiantes/ActividadRompecabezas";
import ActividadModeloTexto from "../pages/Estudiantes/ActividadModeloTexto";

import VerificarCasilla from "../pages/Estudiantes/VerificarCasilla";
import DesdeMarcador from "../pages/Estudiantes/DesdeMarcador";

const EstudianteRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<LoginEstudiante />} /> 
      <Route path="dashboard" element={<DashboardEstudiante />} />  
      <Route path="seleccionar-casilla" element={<SeleccionarCasilla />} />
      <Route path="actividad-modelo-sonidos/:casillaId" element={<ActividadModeloSonido />} />
      <Route path="vista-previa-modelo-sonido" element={<VistaPreviaModeloSonido />} />
      <Route path="actividad-clasificacion-modelos/:casillaId" element={<ActividadClasificacionModelos />} />
      <Route path="vista-previa-clasificacion-modelos" element={<VistaPreviaClasificacionModelos />} />

      <Route path="actividad-rompecabezas/:casillaId" element={<ActividadRompecabezas />} />
      <Route path="actividad-modelo-texto/:casillaId" element={<ActividadModeloTexto />} />

      <Route path="verificar-casilla" element={<VerificarCasilla />} />           
      <Route path="desde-marcador" element={<DesdeMarcador />} /> 
    </Routes>
  );
};

export default EstudianteRoutes;