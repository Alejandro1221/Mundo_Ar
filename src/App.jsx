import { BrowserRouter as Router } from "react-router-dom";
import "./assets/styles/componentes/botones.css";
import AppRoutes from "./routes/AppRoutes"; 

function App() {
  return (
    <Router>
      <AppRoutes /> {/* 🔹 Aquí se renderizan todas las rutas de tu app */}
    </Router>
  );
}

export default App;
