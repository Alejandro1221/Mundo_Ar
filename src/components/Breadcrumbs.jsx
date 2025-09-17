import { Link, useLocation } from "react-router-dom";
import "../assets/styles/componentes/breadcrumbs.css";

const MODULE_HOME = {
  docente:     { to: "/docente/dashboard",     label: "Dashboard" },
  estudiantes: { to: "/estudiante/dashboard", label: "Dashboard estudiante" },
};

const LABELS = {
  "configurar-casillas": "Configurar casillas",
  "clasificacion-modelos": "Clasificación de modelos",
  "plantilla-sonido-modelo": "Modelo-sonido",
  "rompecabezas-modelo": "Rompecabezas",
  "modelo-texto": "Modelo de texto",
  "casilla-sorpresa": "Casilla sorpresa",
};

const looksLikeId = (s) =>
  /^\d+$/.test(s) || (s.length >= 20 && !s.includes("-") && !s.includes("_"));
const nice = (s) =>
  s.replaceAll("-", " ")
   .replace(/\b\w/g, (m) => m.toUpperCase());

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean); 

  const root = parts[0];
  const home = MODULE_HOME[root] ?? { to: "/", label: "Inicio" };
  const isModule = Boolean(MODULE_HOME[root]);
  const basePrefix = isModule ? `/${root}` : "";

  // Oculta IDs y, si estamos en módulo, quita el primer segmento ("docente" o "estudiantes")
  let segments = parts.filter((seg) => !looksLikeId(seg));
  if (isModule) segments = segments.slice(1);

  // Construye rutas acumulativas después del "home"
  const paths = segments.map((_, i) => {
    const partial = segments.slice(0, i + 1).join("/");
    return (basePrefix ? `${basePrefix}/` : "/") + partial;
  });

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ul>
        <li><Link to={home.to}>{home.label}</Link></li>
        {segments.map((seg, i) => {
          const to = paths[i];
          const isLast = i === segments.length - 1;
          const raw = seg;
          const label = LABELS[raw] ?? nice(raw); 
          return (
            <li key={to}>
              {isLast
                ? <span aria-current="page" className="actual">{label}</span>
                : <Link to={to}>{label}</Link>
              }
            </li>
          );
        })}
      </ul>
    </nav>
  );
}