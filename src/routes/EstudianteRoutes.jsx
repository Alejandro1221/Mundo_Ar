import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginEstudiante from "../components/auth/LoginEstudiante";
import DashboardEstudiante from "../pages/Estudiantes/DashboardEstudiante";
import SeleccionarCasilla from "../pages/Estudiantes/SeleccionarCasilla";
import ActividadModeloSonido from "../pages/Estudiantes/ActividadModeloSonido";



const EstudianteRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<LoginEstudiante />} /> 
      <Route path="dashboard" element={<DashboardEstudiante />} />  
      <Route path="seleccionar-casilla" element={<SeleccionarCasilla />} />
      <Route path="actividad-modelo-sonidos/:casillaId" element={<ActividadModeloSonido />} />
      

    </Routes>
  );
};

export default EstudianteRoutes;