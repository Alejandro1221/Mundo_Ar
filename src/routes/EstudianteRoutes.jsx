import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginEstudiante from "../components/auth/LoginEstudiante";
import DashboardEstudiante from "../pages/Estudiantes/DashboardEstudiante";

const EstudianteRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<LoginEstudiante />} /> 
      <Route path="dashboard" element={<DashboardEstudiante />} />  
    </Routes>
  );
};

export default EstudianteRoutes;