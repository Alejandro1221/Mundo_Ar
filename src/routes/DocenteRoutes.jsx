import { Routes, Route } from "react-router-dom";
import DashboardDocente from "../pages/Docente/DashboardDocente";
import BancoModelos from "../pages/Docente/BancoModelos";
import ConfigurarCasillas from "../pages/Docente/ConfigurarCasillas.jsx";  


const DocenteRoutes = () => {
  return (
    <Routes>
        <Route path="dashboard" element={<DashboardDocente />} /> 
        <Route path="configurar-casillas/:juegoId" element={<ConfigurarCasillas />} />
        <Route path="banco-modelos" element={<BancoModelos />} />
        
    </Routes>
  );
};

export default DocenteRoutes;