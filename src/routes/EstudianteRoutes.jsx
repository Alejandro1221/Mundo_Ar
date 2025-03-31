import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginEstudiante from "../pages/Estudiantes/Auth/LoginEstudiante";
import DashboardEstudiante from "../pages/Estudiantes/DashboardEstudiante";
import SeleccionarCasilla from "../pages/Estudiantes/SeleccionarCasilla";
import ActividadModeloSonido from "../pages/Estudiantes/ActividadModeloSonido";
import ActividadClasificacionModelos from "../pages/Estudiantes/ActividadClasificacionModelos"; 

const EstudianteRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<LoginEstudiante />} /> 
      <Route path="dashboard" element={<DashboardEstudiante />} />  
      <Route path="seleccionar-casilla" element={<SeleccionarCasilla />} />
      <Route path="actividad-modelo-sonidos/:casillaId" element={<ActividadModeloSonido />} />
      <Route path="actividad-clasificacion-modelos/:casillaId" element={<ActividadClasificacionModelos />} /> 
    </Routes>
  );
};

export default EstudianteRoutes;