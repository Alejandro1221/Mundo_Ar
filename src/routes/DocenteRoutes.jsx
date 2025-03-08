import { Routes, Route } from "react-router-dom";
import DashboardDocente from "../pages/Docente/DashboardDocente";
import BancoModelos from "../components/bancoModelos/BancoModelos";
import ConfigurarCasillas from "../pages/Docente/ConfigurarCasillas.jsx";  
import ModeloSonido from "../templates/ModeloSonido";


const DocenteRoutes = () => {
  return (
    <Routes>
        <Route path="dashboard" element={<DashboardDocente />} /> 
        <Route path="configurar-casillas/:juegoId" element={<ConfigurarCasillas />} />
        <Route path="banco-modelos" element={<BancoModelos />} />
        <Route path="plantilla-sonido-modelo" element={<ModeloSonido />} />
        
    </Routes>
  );
};

export default DocenteRoutes;