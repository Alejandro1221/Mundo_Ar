import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/styles/global.css";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext";
import { NotifyProvider } from "./components/NotifyProvider";  

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <NotifyProvider>
        <App />
      </NotifyProvider>
    </AuthProvider>
  </StrictMode>
);