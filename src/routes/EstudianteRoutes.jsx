import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import LoginEstudiante from "../pages/Estudiantes/Auth/LoginEstudiante";
import DashboardEstudiante from "../pages/Estudiantes/DashboardEstudiante";
import SeleccionarCasilla from "../pages/Estudiantes/SeleccionarCasilla";
import ActividadModeloSonido from "../pages/Estudiantes/ActividadModeloSonido";
import VistaPreviaModeloSonido from "../pages/Estudiantes/VistaPreviaModeloSonido"; 
import ActividadClasificacionModelos from "../pages/Estudiantes/ActividadClasificacionModelos"; 
import VistaPreviaClasificacionModelos from "../pages/Estudiantes/VistaPreviaClasificacionModelos";
import ActividadRompecabezas from "../pages/Estudiantes/ActividadRompecabezas";
import VistaPreviaRompecabezas from "../pages/Estudiantes/VistaPreviaRompecabezas";
import ActividadModeloTexto from "../pages/Estudiantes/ActividadModeloTexto";
import VistaPreviaModeloTexto from "../pages/Estudiantes/VistaPreviaModeloTexto";

import ActividadCasillaSorpresa from "../pages/Estudiantes/ActividadCasillaSorpresa";
import VistaPreviaCasillaSorpresa from "../pages/Estudiantes/VistaPreviaCasillaSorpresa";
import VerificarCasilla from "../pages/Estudiantes/VerificarCasilla";
import DesdeMarcador from "../pages/Estudiantes/DesdeMarcador";

const EstudianteRoutes = () => {
   useEffect(() => {
    sessionStorage.setItem("rolActivo", "estudiante");
  }, []);
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
      <Route path="vista-previa-rompecabezas" element={<VistaPreviaRompecabezas />} />

      <Route path="actividad-modelo-texto/:casillaId" element={<ActividadModeloTexto />} />
      <Route path="vista-previa-modelo-texto" element={<VistaPreviaModeloTexto />} />

      <Route path="actividad-casilla-sorpresa/:casillaId" element={<ActividadCasillaSorpresa />} />
      <Route path="vista-previa-casilla-sorpresa" element={<VistaPreviaCasillaSorpresa />} />


      <Route path="verificar-casilla" element={<VerificarCasilla />} />           
      <Route path="desde-marcador" element={<DesdeMarcador />} /> 
    </Routes>
  );
};

export default EstudianteRoutes;