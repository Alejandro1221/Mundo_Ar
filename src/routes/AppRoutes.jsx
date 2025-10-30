import { Routes, Route } from "react-router-dom";
import Home from "../pages/home"; 
import Register from "../pages/Docente/Auth/Register";
import Login from "../pages/Docente/Auth/Login"; 
import DocenteRoutes from "./DocenteRoutes"; 
import EstudianteRoutes from "./EstudianteRoutes";

import FlowTracer from "../dev/FlowTracer";

const AppRoutes = () => {
  return (
    <>
      <FlowTracer />

      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/register" element={<Register />} /> 
        <Route path="/login" element={<Login />} /> 
        <Route path="/docente/*" element={<DocenteRoutes />} />
        <Route path="/estudiante/*" element={<EstudianteRoutes />} /> 
      </Routes>
    </>
  );
};

export default AppRoutes;
