import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home"; 
import Register from "../components/auth/Register";
import Login from "../components/auth/Login"; 
import DocenteRoutes from "./DocenteRoutes"; 
/*import EstudianteRoutes from "./EstudiantesRoutes";*/

const AppRoutes = () => {
  return (
    <Routes>
        <Route path="/Home" element={<Home />} /> 
        <Route path="/register" element={<Register />} /> 
        <Route path="/login" element={<Login />} /> 
        
        
        <Route path="/docente/*" element={<DocenteRoutes />} />
       
    </Routes>
  );
};

export default AppRoutes;
