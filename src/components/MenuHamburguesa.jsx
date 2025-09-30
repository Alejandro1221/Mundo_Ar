import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { auth } from "../services/firebaseConfig";
import { signOut } from "firebase/auth";
import Breadcrumbs from "./Breadcrumbs";
import "../assets/styles/componentes/menuhamburguesa.css";

export default function TopbarMenu({
  showBreadcrumbs = true,
  rightSlot = null,
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.pathname;

  const goBanco = (ruta) => {
    sessionStorage.setItem("paginaAnterior", returnTo);
    setOpen(false);
    navigate(ruta, { state: { desdePlantilla: false } });
  };

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (e) {
      console.error("Error al cerrar sesión:", e);
    }
  };

  return (
    <>
      {/* Barra superior con migas + botón */}
      <div className="topbar-bc">
        <div className="topbar-left">
          <button
            className="btn-menu"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={open}
            aria-controls="menu-drawer"
          >
            <FiMenu />
          </button>

          {showBreadcrumbs ? <Breadcrumbs /> : null}
        </div>

        <div className="topbar-right">
          {rightSlot}
        </div>
      </div>

      {/* Backdrop */}
      {open && <div className="menu-backdrop" onClick={() => setOpen(false)} />}

      {/* Drawer */}
      <nav
        id="menu-drawer"
        className={`menu-drawer ${open ? "open" : ""}`}
        aria-hidden={!open}
      >
        <div className="menu-header">
          <h2 id="menu-title">Menú</h2>
          <button className="menu-close" onClick={() => setOpen(false)} aria-label="Cerrar">
            <FiX />
          </button>
        </div>

        <ul className="menu-list">
          <li>
            <button className="menu-item" onClick={() => goBanco("/docente/banco-modelos")}>
              Banco de Modelos
            </button>
          </li>
          <li>
            <button className="menu-item" onClick={() => goBanco("/docente/banco-sonidos")}>
              Banco de Sonidos
            </button>
          </li>
          <li>
            <button className="menu-item danger" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
