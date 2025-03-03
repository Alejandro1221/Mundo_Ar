import { Routes, Route } from "react-router-dom";
import DashboardDocente from "../pages/Docente/DashboardDocente";
import BancoModelos from "../pages/Docente/BancoModelos";



/*import ConfigurarCasillas from "../pages/Docente/ConfigurarCasillas";
import ConfigurarPlantilla from "../pages/Docente/ConfigurarPlantilla";
import GestionarJuegos from "../pages/Docente/GestionarJuegos";
import BancoSonidosDocente from "../pages/Docente/BancoSonidosDocente";


<Route path="configurar-casillas/:idJuego" element={<ConfigurarCasillas />} />
        <Route path="configurar-plantilla/:idCasilla" element={<ConfigurarPlantilla />} />
        <Route path="gestionar-juegos" element={<GestionarJuegos />} />
        <Route path="banco-sonidos" element={<BancoSonidosDocente />} />
        <Route path="banco-modelos" element={<BancoModelosDocente />} />
*/

const DocenteRoutes = () => {
  return (
    <Routes>
        <Route path="dashboard" element={<DashboardDocente />} /> 
        <Route path="banco-modelos" element={<BancoModelos />} />
        
    </Routes>
  );
};

export default DocenteRoutes;