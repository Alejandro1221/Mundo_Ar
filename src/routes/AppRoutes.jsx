import { Routes, Route } from "react-router-dom";
import Home from "../pages/home"; 
import Register from "../components/auth/Register";
import Login from "../components/auth/Login"; 
import DocenteRoutes from "./DocenteRoutes"; 
import EstudianteRoutes from "./EstudianteRoutes";

const AppRoutes = () => {
  return (
    <Routes>
        <Route path="/home" element={<Home />} /> 
        <Route path="/register" element={<Register />} /> 
        <Route path="/login" element={<Login />} /> 
        <Route path="/docente/*" element={<DocenteRoutes />} />
        <Route path="/estudiante/*" element={<EstudianteRoutes />} /> 
       
    </Routes>
  );
};

export default AppRoutes;
