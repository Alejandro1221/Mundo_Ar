import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes"; 
function App() {
  return (
    <Router>
      <AppRoutes /> {/* 🔹 Carga todas las rutas aquí */}
    </Router>
  );
}

export default App;
