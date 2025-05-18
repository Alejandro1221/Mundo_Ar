import { Routes, Route } from "react-router-dom";
import RecuperarContrasena from '../pages/Docente/Auth/RecuperarContrasena';
import DashboardDocente from "../pages/Docente/DashboardDocente";
import BancoModelos from "../pages/bancoModelos/BancoModelos.jsx";
import BancoSonidos from "../pages/bancoSonidos/BancoSonidos.jsx";
import ConfigurarCasillas from "../pages/Docente/ConfigurarCasillas.jsx";  
import ModeloSonido from "../templates/ModeloSonido";
import ClasificacionModelos from "../templates/ClasificacionModelos";
import RompecabezasModelo from "../templates/RompecabezasModelo";
import ModeloTexto from "../templates/ModeloTexto"; 

const DocenteRoutes = () => {
  return (
    <Routes>
        <Route path="recuperar" element={<RecuperarContrasena />} />
        <Route path="dashboard" element={<DashboardDocente />} /> 
        <Route path="configurar-casillas/:juegoId" element={<ConfigurarCasillas />} />
        <Route path="banco-modelos" element={<BancoModelos />} />
        <Route path="banco-sonidos" element={<BancoSonidos />} />  
        <Route path="plantilla-sonido-modelo" element={<ModeloSonido />} />
        <Route path="clasificacion-modelos" element={<ClasificacionModelos />} />
        <Route path="rompecabezas-modelo" element={<RompecabezasModelo/>}/>
        <Route path="modelo-texto" element={<ModeloTexto />} />
    </Routes>
  );
};

export default DocenteRoutes;