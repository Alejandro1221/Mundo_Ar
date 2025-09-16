import { Link, useLocation } from "react-router-dom";
import "../assets/styles/componentes/breadcrumbs.css";

const MODULE_HOME = {
  docente:     { to: "/docente/dashboard",     label: "Dashboard docente" },
  estudiantes: { to: "/estudiantes/dashboard", label: "Dashboard estudiante" },
};

const looksLikeId = (s) => /^\d+$/.test(s) || s.length >= 16;
const nice = (s) => s.replaceAll("-", " ");

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
          const label = nice(seg);
          return (
            <li key={to}>
              {isLast ? <span>{label}</span> : <Link to={to}>{label}</Link>}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}